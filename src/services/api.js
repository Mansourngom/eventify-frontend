import axios from 'axios';

const api = axios.create({
  baseURL : 'http://127.0.0.1:8000/api',
  headers : { 'Content-Type': 'application/json' },
});

// ── JWT Intercepteur ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
          const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh });
          localStorage.setItem('access_token', res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──
export const registerUser   = (data) => api.post('/auth/register/', data);
export const loginUser      = (data) => api.post('/auth/login/', data);
export const getMe          = ()     => api.get('/auth/me/');

// ── EVENTS ──
export const getEvents      = (params) => api.get('/events/', { params });
export const getEventById   = (id)     => api.get(`/events/${id}/`);
export const createEvent    = (data)   => api.post('/events/create/', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateEvent    = (id, data) => api.put(`/events/${id}/update/`, data);
export const deleteEvent    = (id)       => api.delete(`/events/${id}/delete/`);

// ── REGISTRATIONS ──
export const registerToEvent    = (id)  => api.post(`/events/${id}/register/`);
export const getMyRegistrations = ()    => api.get('/registrations/');
export const cancelRegistration = (id) => api.delete(`/registrations/${id}/cancel/`);
export const getParticipants    = (id) => api.get(`/events/${id}/participants/`);

// ── DASHBOARD ──
export const getDashboardStats = () => api.get('/dashboard/stats/');

export default api;