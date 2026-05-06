import { createContext, useContext, useState, useCallback } from "react";
import { ROLES } from "../constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("unismart_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("unismart_user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("unismart_user");
  }, []);

  const isAuthenticated = !!user;
  const role = user?.role || null;

  const hasRole = useCallback(
    (...roles) => roles.includes(role),
    [role]
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, role, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
