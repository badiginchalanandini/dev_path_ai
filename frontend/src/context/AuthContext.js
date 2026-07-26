import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data && res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Logout notice:', err.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
        checkLoggedInUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
