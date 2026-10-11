import apiRequest from './api';

export const aiService = {
  getRecommendations: (limit = 6) => apiRequest(`/ai/recommendations?limit=${limit}`),
  whatCanIDo: (data) => apiRequest('/ai/what-can-i-do', { method: 'POST', body: data }),
  getOccasionIdeas: (data) => apiRequest('/ai/occasion-ideas', { method: 'POST', body: data }),
  getGapInsights: () => apiRequest('/ai/gap-insights'),
  assistDraft: (data) => apiRequest('/ai/assist-draft', { method: 'POST', body: data }),
};
