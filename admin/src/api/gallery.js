import { request, buildQuery } from './client';

export const galleryApi = {
  list(params = {}) {
    return request(`/gallery${buildQuery(params)}`);
  },

  getById(id) {
    return request(`/gallery/${id}`);
  },

  create(data) {
    return request('/gallery', { method: 'POST', body: data });
  },

  update(id, data) {
    return request(`/gallery/${id}`, { method: 'PUT', body: data });
  },

  updateStatus(id, active) {
    return request(`/gallery/${id}/status`, { method: 'PATCH', body: { active } });
  },

  remove(id) {
    return request(`/gallery/${id}`, { method: 'DELETE' });
  },
};
