import api from './api';

const orderService = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

export default orderService;
