import axios from 'axios';

// Base API URL from environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - clear session if needed
      // (Optionally redirect or let AuthContext handle state)
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Property Endpoints
export const propertyService = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  getMapProperties: () => api.get('/properties/map/all'),
  getMyProperties: (params) => api.get('/properties/agent/my-properties', { params }),
  create: (formData) =>
    api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/properties/${id}`),
  updateStatus: (id, status) => api.patch(`/properties/${id}/status`, { status }),
};

// Booking Endpoints (Purchase / Rent Applications)
export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getAgentBookings: (params) => api.get('/bookings/agent-bookings', { params }),
  updateStatus: (id, status, responseNotes = '') =>
    api.put(`/bookings/${id}/status`, { status, responseNotes }),
  getAllAdmin: (params) => api.get('/admin/bookings', { params }),
};

// Property Visit Endpoints
export const visitService = {
  create: (data) => api.post('/visits', data),
  getUserVisits: () => api.get('/visits/my-visits'),
  getAgentVisits: () => api.get('/visits/agent-visits'),
  updateStatus: (id, status, agentNotes = '') =>
    api.put(`/visits/${id}/status`, { status, agentNotes }),
};

// Wishlist Endpoints
export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  add: (propertyId) => api.post(`/wishlist/${propertyId}`),
  remove: (propertyId) => api.delete(`/wishlist/${propertyId}`),
  check: (propertyId) => api.get(`/wishlist/check/${propertyId}`),
};

// Inquiry Endpoints
export const inquiryService = {
  create: (data) => api.post('/inquiries', data),
  getUserInquiries: () => api.get('/inquiries/my-inquiries'),
  getAgentInquiries: (params) => api.get('/inquiries/agent-inquiries', { params }),
  reply: (id, replyMessage) => api.put(`/inquiries/${id}/reply`, { replyMessage }),
  updateStatus: (id, status) => api.put(`/inquiries/${id}/status`, { status }),
};

// Admin Endpoints
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getReports: () => api.get('/admin/reports'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllAgents: (params) => api.get('/admin/agents', { params }),
  getAllProperties: (params) => api.get('/admin/properties', { params }),
  approveProperty: (id) => api.put(`/admin/properties/${id}/approve`),
  rejectProperty: (id, reason) => api.put(`/admin/properties/${id}/reject`, { reason }),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
};

export default api;
