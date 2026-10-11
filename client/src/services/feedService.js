import apiRequest from './api';

export const feedService = {
  getFeed: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/feed${query ? `?${query}` : ''}`);
  },
  createPost: (data) => apiRequest('/feed', { method: 'POST', body: data }),
  toggleLike: (id) => apiRequest(`/feed/${id}/like`, { method: 'POST' }),
  addComment: (id, content) => apiRequest(`/feed/${id}/comment`, { method: 'POST', body: { content } }),
  getComments: (id) => apiRequest(`/feed/${id}/comments`),
  toggleFollow: (targetId) => apiRequest(`/feed/follow/${targetId}`, { method: 'POST' }),
};
