import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [isLoading, setLoading] = useState(true);

  // Helper utility to safely fetch local values
  const getSafeItem = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  // Restore session from stored token on mount
  useEffect(() => {
    const token = getSafeItem("access_token");
    if (token) {
      authApi.getProfile()
        .then(({ data }) => setUser(data))
        .catch(() => {
          try {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          } catch (e) {}
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login(email, password);
    try {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
    } catch (e) {
      toast.error("Storage access denied. Check your browser privacy options.");
    }
    const { data: profile } = await authApi.getProfile();
    setUser(profile);
    toast.success(`Welcome back, ${profile.first_name}!`);
    return profile;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    toast.success("Account created! Please verify your email.");
    return data;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } catch (e) {}
    setUser(null);
    toast.success("Logged out successfully.");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}