import React, { createContext, useState, useEffect } from 'react';
import { login, checkAuth, logout } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const session = await checkAuth();
        if (session.status) {
          setUser({
            username: session.data.username,
            userType: session.data.userType,
            userId: session.data.userId,
          });
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userType', session.data.userType);
        } else {
          setUser(null);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userType');
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await login(email, password);
      if (response) {
        setUser({
          username: email,
          userType: response.userType,
          userId: response.data.userId,
        });
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', response.userType);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
