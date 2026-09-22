import { request, buildQuery } from './client';

export const categoriesApi = {
  list(params = {}) {
    return request(`/categories${buildQuery(params)}`);
  },

  getById(id) {
    return request(`/categories/${id}`);
  },

  create(data) {
    return request('/categories', { method: 'POST', body: data });
  },

  update(id, data) {
    return request(`/categories/${id}`, { method: 'PUT', body: data });
  },

  updateStatus(id, active) {
    return request(`/categories/${id}/status`, { method: 'PATCH', body: { active } });
  },

  remove(id) {
    return request(`/categories/${id}`, { method: 'DELETE' });
  },
};
