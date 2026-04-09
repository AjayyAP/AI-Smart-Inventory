import api from './api';

const aiService = {
  generateDescription: (productData) => api.post('/ai/generate-description', productData),
  getSmartReorderRecommendations: () => api.get('/ai/smart-reorder'),
  chat: (message) => api.post('/ai/chat', { message }),
};

export default aiService;
