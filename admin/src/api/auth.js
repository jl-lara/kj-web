import { request, setAccessToken, refreshAccessToken } from './client';

export const authApi = {
  async login(email, password) {
    const { data } = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async refresh() {
    const accessToken = await refreshAccessToken();
    return { accessToken };
  },

  async logout() {
    await request('/auth/logout', {
      method: 'POST',
      auth: false,
      retry: false,
    });
  },

  async me() {
    const { data } = await request('/auth/me');
    return data;
  },

  async updateProfile(name) {
    const { data } = await request('/auth/me', { method: 'PATCH', body: { name } });
    return data;
  },

  async changePassword(currentPassword, newPassword, confirmPassword) {
    const { data } = await request('/auth/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword, confirmPassword },
    });
    return data;
  },
};
