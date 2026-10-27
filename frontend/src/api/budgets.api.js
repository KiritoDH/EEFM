import apiClient from './client';

export const budgetsApi = {
  getAll: (month) => apiClient(`/budgets${month ? `?month=${month}` : ''}`),
  upsert: (data) => apiClient('/budgets', { method: 'POST', body: data }),
  delete: (id) => apiClient(`/budgets/${id}`, { method: 'DELETE' }),
};
