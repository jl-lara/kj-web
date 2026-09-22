import { request, buildQuery } from './client';

export const locationsApi = {
  list(params = {}) {
    return request(`/locations${buildQuery(params)}`);
  },

  getById(id) {
    return request(`/locations/${id}`);
  },

  create(data) {
    return request('/locations', { method: 'POST', body: data });
  },

  update(id, data) {
    return request(`/locations/${id}`, { method: 'PUT', body: data });
  },

  updateStatus(id, active) {
    return request(`/locations/${id}/status`, { method: 'PATCH', body: { active } });
  },

  remove(id) {
    return request(`/locations/${id}`, { method: 'DELETE' });
  },
};
