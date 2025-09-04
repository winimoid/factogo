import React, { createContext, useState, useMemo } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const authContextValue = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      user,
      setUser,
    }),
    [isAuthenticated, user]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};