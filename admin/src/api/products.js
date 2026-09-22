import { request, buildQuery } from './client';

export const productsApi = {
  list(params = {}) {
    return request(`/products${buildQuery(params)}`);
  },

  getById(id) {
    return request(`/products/${id}`);
  },

  create(data) {
    return request('/products', { method: 'POST', body: data });
  },

  update(id, data) {
    return request(`/products/${id}`, { method: 'PUT', body: data });
  },

  updateStatus(id, active) {
    return request(`/products/${id}/status`, { method: 'PATCH', body: { active } });
  },

  remove(id) {
    return request(`/products/${id}`, { method: 'DELETE' });
  },
};
