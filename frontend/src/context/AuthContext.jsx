import React, { useState, useEffect } from 'react';
import { AuthContext } from './appContexts';
import api from '../services/api';
import { toast } from 'react-toastify';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setLoading(false);
        return;
      }
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Optimistically set user

      // Validate token with backend to check if user is still Active
      try {
        const response = await api.get('/auth/me');
        // If user is pending, backend returns 403 → api.js interceptor clears storage & redirects
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...response.data }));
      } catch {
        // Token invalid or user is pending → clear session
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Logged in successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      // Only log the user in if we actually got a token back
      if (response.data && response.data.token) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success('Email verified successfully!');
      } else {
        // Account is pending approval - don't log in
        toast.info(response.data?.message || 'Email verified! Awaiting Admin approval.');
      }
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'OTP Verification failed';
      toast.info(msg);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
      throw error;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
