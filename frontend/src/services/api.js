import axios from 'axios';

const API = axios.create({
  baseURL: 'https://dev-path-ai.onrender.com',
  withCredentials: true, // Sends HTTP-Only cookies automatically
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios Response Interceptor for automatic 401 Refresh Token renewal
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true;
      try {
        await axios.post('http://localhost:5000/api/auth/refresh-token', {}, { withCredentials: true });
        return API(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  verifyOTP: (data) => API.post('/auth/verify-otp', data),
  resendOTP: (data) => API.post('/auth/resend-otp', data),
  login: (data) => API.post('/auth/login', data),
  refreshToken: () => API.post('/auth/refresh-token'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me')
};

export const profileAPI = {
  saveProfile: (data) => API.post('/profile', data),
  getProfile: () => API.get('/profile')
};

export const aiAPI = {
  generateAllInsights: (data) => API.post('/ai/generate-all', data),
  getAllInsights: () => API.get('/ai/insights'),
  generateProjectBlueprint: (projectTitle) => API.post('/ai/project-blueprint', { projectTitle })
};

export const projectMentorAPI = {
  generateBlueprint: (data) => API.post('/project-mentor/blueprint', data),
  getBlueprint: () => API.get('/project-mentor/blueprint')
};

export const historyAPI = {
  listHistory: (search, filter, page, limit) =>
    API.get('/history', { params: { search, filter, page, limit } }),
  toggleFavorite: (id) => API.put(`/history/${id}/favorite`),
  deleteEntry: (id) => API.delete(`/history/${id}`)
};

export const profileManagementAPI = {
  updateDetails: (data) => API.put('/profile-management/details', data),
  updatePassword: (data) => API.put('/profile-management/password', data),
  deleteAccount: () => API.delete('/profile-management/account')
};

export default API;
