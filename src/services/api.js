import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh });
        localStorage.setItem('access_token', res.data.access);
        orig.headers.Authorization = `Bearer ${res.data.access}`;
        return api(orig);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const registerUser       = d     => api.post('/auth/register/', d);
export const loginUser          = d     => api.post('/auth/login/', d);
export const getMe              = ()    => api.get('/auth/me/');
export const getEvents          = p     => api.get('/events/', { params: p });
export const getEventById       = id    => api.get(`/events/${id}/`);
export const createEvent        = d     => api.post('/events/create/', d, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateEvent        = (id,d)=> api.put(`/events/${id}/update/`, d);
export const deleteEvent        = id    => api.delete(`/events/${id}/delete/`);
export const registerToEvent    = id    => api.post(`/events/${id}/register/`);
export const getMyRegistrations = ()    => api.get('/registrations/');
export const cancelRegistration = id    => api.delete(`/registrations/${id}/cancel/`);
export const getDashboardStats  = ()    => api.get('/dashboard/stats/');
export const getParticipants    = id    => api.get(`/events/${id}/participants/`);

export default api;