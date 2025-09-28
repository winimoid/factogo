import React, { createContext, useState, useMemo, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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