import apiRequest from './api';

export const initiativeService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/initiatives${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/initiatives/${id}`),
  create: (data) => apiRequest('/initiatives', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/initiatives/${id}`, { method: 'PUT', body: data }),
  getMyOrg: () => apiRequest('/initiatives/my-org'),
};
