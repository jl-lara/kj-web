import { request } from './client';

export const settingsApi = {
  get() {
    return request('/settings');
  },

  update(data) {
    return request('/settings', { method: 'PATCH', body: data });
  },
};
