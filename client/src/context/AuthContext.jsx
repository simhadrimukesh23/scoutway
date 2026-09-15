import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL for Google OAuth token
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('sw_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const initAuth = async () => {
      const token = localStorage.getItem('sw_token');
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.user);
        } catch {
          localStorage.removeItem('sw_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (userData, token) => {
    if (token) localStorage.setItem('sw_token', token);
    setUser(userData);
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    localStorage.removeItem('sw_token');
    setUser(null);
  };

  const isGuest = user?.authProvider === 'guest';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isGuest, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
