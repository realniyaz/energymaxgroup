// context/customer-notification-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import {
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/services/customerNotificationService";

interface CustomerNotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markOneRead: (publicId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const CustomerNotificationContext = createContext<CustomerNotificationContextType>({
  unreadCount: 0,
  refreshUnreadCount: async () => {},
  markOneRead: async () => {},
  markAllRead: async () => {},
});

export const CustomerNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useCustomerAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Ignore background badge synchronization errors silently
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCount();
      const interval = setInterval(refreshUnreadCount, 45000); // Poll every 45s
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, refreshUnreadCount]);

  const markOneRead = async (publicId: string) => {
    await markNotificationAsRead(publicId);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await markAllNotificationsAsRead();
    setUnreadCount(0);
  };

  return (
    <CustomerNotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        markOneRead,
        markAllRead,
      }}
    >
      {children}
    </CustomerNotificationContext.Provider>
  );
};

export const useCustomerNotifications = () => useContext(CustomerNotificationContext);