"tsx"
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient, setAccessToken ,setRefreshToken} from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface AdminUser {
  public_id: string;
  username: string;
  staff_type: string;
  is_super_admin: boolean;
  is_active: boolean;
  role_id: number;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiClient.get<AdminUser>("/api/v1/admin/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username: string, password: string) => {
    const res = await apiClient.post("/api/v1/admin/auth/login", { username, password });
    setAccessToken(res.data.access_token);
    if (res.data.refresh_token) {
      setRefreshToken(res.data.refresh_token);
    }
    await fetchUser();
    router.push("/admin/dashboard");
  };

  const logout = async () => {
    try {
      await apiClient.post("/api/v1/admin/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push("/admin/login");
    }
  };

  const logoutAll = async () => {
    try {
      await apiClient.post("/api/v1/admin/auth/logout-all");
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push("/admin/login");
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, login, logout, logoutAll }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return context;
};