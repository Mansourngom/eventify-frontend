import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getMe()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    localStorage.setItem('access_token',  res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await registerUser(data);
    localStorage.setItem('access_token',  res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }