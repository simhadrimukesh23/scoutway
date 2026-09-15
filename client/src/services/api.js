import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return 'https://scoutway-pi.vercel.app';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Attach token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sw_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const guestLogin = () => api.post('/auth/guest');
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Stories
export const getStories = (params) => api.get('/stories', { params });
export const getStory = (id) => api.get(`/stories/${id}`);
export const createStory = (data) => api.post('/stories', data);
export const updateStory = (id, data) => api.put(`/stories/${id}`, data);
export const deleteStory = (id) => api.delete(`/stories/${id}`);
export const likeStory = (id) => api.patch(`/stories/${id}/like`);
export const addComment = (storyId, data) => api.post(`/stories/${storyId}/comments`, data);
export const replyComment = (storyId, commentId, data) => api.post(`/stories/${storyId}/comments/${commentId}/reply`, data);
export const uploadStoryImage = (id, formData) =>
  api.post(`/stories/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default api;


