const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

export async function request(path) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`);
  } catch {
    throw new Error('network');
  }
  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }
  const body = await res.json();
  if (!body || body.success !== true) {
    throw new Error(body?.error?.message || 'API error');
  }
  return body.data;
}
