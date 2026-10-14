// context/admin-notification-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getAdminUnreadNotificationCount,
  markAllAdminNotificationsAsRead,
  markAdminNotificationAsRead,
} from "@/lib/services/adminNotificationService";

interface AdminNotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markOneRead: (publicId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextType>({
  unreadCount: 0,
  refreshUnreadCount: async () => {},
  markOneRead: async () => {},
  markAllRead: async () => {},
});

export const AdminNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getAdminUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Keep silent for background polling failures
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  const markOneRead = async (publicId: string) => {
    await markAdminNotificationAsRead(publicId);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await markAllAdminNotificationsAsRead();
    setUnreadCount(0);
  };

  return (
    <AdminNotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        markOneRead,
        markAllRead,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = () => useContext(AdminNotificationContext);