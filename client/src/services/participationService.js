import apiRequest from './api';

export const participationService = {
  join: (initiativeId) => apiRequest(`/participations/${initiativeId}/join`, { method: 'POST' }),
  cancel: (participationId) => apiRequest(`/participations/${participationId}/cancel`, { method: 'POST' }),
  submitEvidence: (participationId, data) => apiRequest(`/participations/${participationId}/submit-evidence`, { method: 'POST', body: data }),
  verify: (participationId, data) => apiRequest(`/participations/${participationId}/verify`, { method: 'POST', body: data }),
  getMyActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/participations/my${query ? `?${query}` : ''}`);
  },
  getInitiativeParticipants: (initiativeId) => apiRequest(`/participations/initiative/${initiativeId}`),
};
