import { request, buildQuery } from './client';

export const promotionsApi = {
  list(params = {}) {
    return request(`/promotions${buildQuery(params)}`);
  },

  getById(id) {
    return request(`/promotions/${id}`);
  },

  create(data) {
    return request('/promotions', { method: 'POST', body: data });
  },

  update(id, data) {
    return request(`/promotions/${id}`, { method: 'PUT', body: data });
  },

  updateStatus(id, active) {
    return request(`/promotions/${id}/status`, { method: 'PATCH', body: { active } });
  },

  remove(id) {
    return request(`/promotions/${id}`, { method: 'DELETE' });
  },
};
