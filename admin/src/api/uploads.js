import { request } from './client';

export const uploadsApi = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await request('/uploads/image', { method: 'POST', body: formData });
    return data;
  },

  async removeImage(key) {
    await request(`/uploads/image?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
  },
};
