export function ok<T>(data: T) {
  return { success: true, data };
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}

export function okList<T>(data: T[], meta: Meta) {
  return { success: true, data, meta };
}

export function fail(message: string, code: string) {
  return { success: false, error: { message, code } };
}
