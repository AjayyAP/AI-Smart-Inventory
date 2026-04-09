import api from './api';

const supplierService = {
  getSuppliers: (params) => api.get('/suppliers', { params }),
  getSupplierById: (id) => api.get(`/suppliers/${id}`),
  createSupplier: (data) => api.post('/suppliers', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),
};

export default supplierService;
