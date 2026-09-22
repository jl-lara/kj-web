const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

let accessToken = null;
let unauthorizedHandler = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function parseResponse(res) {
  if (res.status === 204) {
    return { data: null, meta: null };
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const message = body?.error?.message || `Error ${res.status}`;
    const code = body?.error?.code || 'REQUEST_FAILED';
    throw new ApiError(message, code, res.status);
  }
  return { data: body?.data ?? null, meta: body?.meta ?? null };
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const { data } = await parseResponse(res);
      setAccessToken(data?.accessToken ?? null);
      return data?.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function request(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const requestBody = isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: requestBody,
      credentials: 'include',
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 'NETWORK_ERROR', 0);
  }

  if (res.status === 401 && auth && retry) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, auth, retry: false });
    } catch {
      clearAccessToken();
      if (unauthorizedHandler) unauthorizedHandler();
      throw new ApiError('Tu sesión ha expirado', 'SESSION_EXPIRED', 401);
    }
  }

  return parseResponse(res);
}

export function isApiError(error) {
  return error instanceof ApiError;
}
