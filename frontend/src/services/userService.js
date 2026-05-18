import api from './api';

const userService = {
  getUsers: async (params) => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  updateUser: async (id, userData) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};

export default userService;
