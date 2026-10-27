import apiClient from './client';

export const categoriesApi = {
  getAll: (type) => apiClient(`/categories${type ? `?type=${type}` : ''}`),
  create: (data) => apiClient('/categories', { method: 'POST', body: data }),
  update: (id, data) => apiClient(`/categories/${id}`, { method: 'PUT', body: data }),
  delete: (id, reassignToId) => apiClient(`/categories/${id}`, { method: 'DELETE', body: { reassignToId } }),
  resetDefaults: () => apiClient('/categories/reset-defaults', { method: 'POST' }),
};
