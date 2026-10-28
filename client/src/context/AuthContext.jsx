import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_USER } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('moodtune_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('moodtune_auth_token') ? true : true; // default logged in for prototype demo
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('moodtune_user', JSON.stringify(user));
    }
  }, [user]);

  const login = (email, password) => {
    // Client-side authentication simulation
    const updatedUser = {
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email,
      name: email.split('@')[0] || DEFAULT_USER.name
    };
    setUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('moodtune_auth_token', 'demo-jwt-token-xyz-123');
    return { success: true };
  };

  const register = (userData) => {
    const newUser = {
      ...DEFAULT_USER,
      name: userData.name || 'New MoodTuner',
      email: userData.email,
      username: userData.name ? userData.name.toLowerCase().replace(/\s+/g, '_') : 'user_' + Date.now(),
      bio: userData.bio || 'Exploring adaptive music with MoodTune AI.'
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('moodtune_auth_token', 'demo-jwt-token-xyz-123');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('moodtune_auth_token');
  };

  const updateProfile = (fields) => {
    setUser(prev => ({
      ...prev,
      ...fields
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
