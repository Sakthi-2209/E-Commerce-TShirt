import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'customer' or 'admin'
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {

    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const savedRole = localStorage.getItem('role');
      if (token && savedRole) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setRole(savedRole);
        try {
          if (savedRole === 'customer') {
            const { data } = await api.get('/customers/auth/me');
            setUser(data);
          } else if (savedRole === 'admin') {

            setUser({ name: 'Admin User' }); 
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {

      const { data } = await api.post('/customers/auth/login', { email, password });
      handleLoginSuccess(data, 'customer');
      return 'customer';
    } catch (err) {

      try {
        const { data } = await api.post('/admin/auth/login', { email, password });
        handleLoginSuccess(data, 'admin');
        return 'admin';
      } catch (adminErr) {
        throw new Error('Invalid email or password');
      }
    }
  };

  const handleLoginSuccess = (data, userRole) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('role', userRole);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    setUser(data);
    setRole(userRole);
  };

  const logout = async () => {
    try {
      if (role === 'admin') await api.post('/admin/auth/logout');
      else await api.post('/customers/auth/logout');
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setRole(null);
    setToastMsg('Logged out successfully');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      await api.post('/customers/auth/register', { firstName, lastName, email, password });
      await login(email, password);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const adminRegister = async (name, email, password) => {
    try {
      await api.post('/admin/auth/register', { name, email, password });
      await login(email, password);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Admin registration failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, login, register, adminRegister, logout, loading }}>
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#000',
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: 500
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          {toastMsg}
        </div>
      )}
      {!loading && children}
    </AuthContext.Provider>
  );
};
