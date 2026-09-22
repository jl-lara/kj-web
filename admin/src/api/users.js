import { request, buildQuery } from './client';

export const usersApi = {
  list(params = {}) {
    return request(`/users${buildQuery(params)}`);
  },

  getById(id) {
    return request(`/users/${id}`);
  },

  create(data) {
    return request('/users', { method: 'POST', body: data });
  },

  update(id, data) {
    return request(`/users/${id}`, { method: 'PATCH', body: data });
  },

  updateStatus(id, active) {
    return request(`/users/${id}/status`, { method: 'PATCH', body: { active } });
  },
};
