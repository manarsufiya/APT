import React, { createContext, useContext, useEffect, useState } from "react";
import { api, getAuthToken, removeAuthToken, setAuthToken, UserProfile } from "../lib/api";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  signUp: (data: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.error("Auth session restore failed:", err);
        removeAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await api.login(data);
    setAuthToken(res.token);
    setUser(res.user);
  };

  const signUp = async (data: { email: string; password: string; fullName: string }) => {
    const res = await api.signUp(data);
    setAuthToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
