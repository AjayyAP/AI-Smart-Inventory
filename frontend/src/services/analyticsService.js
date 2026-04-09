import api from './api';

const analyticsService = {
  getDashboardSummary: () => api.get('/analytics/dashboard-summary'),
};

export default analyticsService;
