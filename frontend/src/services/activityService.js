import api from './api';

const activityService = {
  getActivityLogs: () => api.get('/activity-logs'),
};

export default activityService;
