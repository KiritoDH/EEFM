import apiClient from './client';

export const transactionsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return apiClient(`/transactions?${query.toString()}`);
  },
  getById: (id) => apiClient(`/transactions/${id}`),
  create: (data) => apiClient('/transactions', { method: 'POST', body: data }),
  update: (id, data) => apiClient(`/transactions/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiClient(`/transactions/${id}`, { method: 'DELETE' }),
};
