"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient, setAccessToken, setRefreshToken } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export interface AdminUser {
  public_id: string;
  username: string;
  staff_type: string;
  is_super_admin: boolean;
  is_active: boolean;
  role_id?: number;
  roles?: Array<{ public_id: string; name: string }>;
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
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
  
  if (!token) {
    setUser(null);
    setLoading(false);
    return;
  }

  try {
    const res = await apiClient.get<AdminUser>("/api/v1/admin/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUser(res.data);
  } catch {
    setAccessToken(null);
    setUser(null);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username: string, password: string) => {
    const res = await apiClient.post("/api/v1/admin/auth/login", { 
      username: username.trim(), 
      password 
    });

    const { access_token, refresh_token } = res.data;

    // Attach token globally to Axios instance
    setAccessToken(access_token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

    if (refresh_token) {
      setRefreshToken(refresh_token);
    }

    // Explicitly pass Authorization header to bypass race conditions
    const meRes = await apiClient.get<AdminUser>("/api/v1/admin/auth/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    setUser(meRes.data);
    router.push("/admin/dashboard");
  };

const logout = async () => {
  try {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_refresh_token")
        : null;

    if (refreshToken) {
      await apiClient.post(
        "/api/v1/admin/auth/logout",
        {}, // empty request body
        {
          params: {
            refresh_token: refreshToken, // sends ?refresh_token=...
          },
        }
      );
    }
  } catch (err: any) {
    console.warn("Backend logout notification failed, continuing local teardown:", err);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
    }

    setUser(null);
    router.push("/admin/login");
  }
};

  const logoutAll = async () => {
    try {
      await apiClient.post("/api/v1/admin/auth/logout-all");
    } catch (err) {
      console.warn("Logout-all notification failed:", err);
    } finally {
      setAccessToken(null);
      delete apiClient.defaults.headers.common["Authorization"];
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