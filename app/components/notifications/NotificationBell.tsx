// components/notifications/NotificationBell.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Package,
  CreditCard,
  AlertCircle,
  Truck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useCustomerNotifications } from "@/context/customer-notification-context";
import {
  getCustomerNotifications,
  CustomerNotificationItem,
} from "@/lib/services/customerNotificationService";

export default function NotificationBell() {
  const router = useRouter();
  const { isAuthenticated } = useCustomerAuth();
  const { unreadCount, markOneRead, markAllRead } = useCustomerNotifications();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadRecent = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getCustomerNotifications({ limit: 5, offset: 0 });
      setNotifications(data.items);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) {
      loadRecent();
    }
  };

  const handleNotificationClick = async (item: CustomerNotificationItem) => {
    if (!item.is_read) {
      await markOneRead(item.public_id);
      setNotifications((prev) =>
        prev.map((n) => (n.public_id === item.public_id ? { ...n, is_read: true } : n))
      );
    }
    setOpen(false);

    // Deep link based on entity binding
    if (item.entity_type === "ORDER" && item.entity_public_id) {
      router.push(`/shop/account/orders/${item.entity_public_id}`);
    } else {
      router.push("/shop/account/notifications");
    }
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (!isAuthenticated) return null;

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "ORDER_CONFIRMED":
      case "ORDER_PROCESSING":
        return <Package className="w-3.5 h-3.5 text-[#2D5A1E]" />;
      case "ORDER_SHIPPED":
      case "ORDER_DELIVERED":
        return <Truck className="w-3.5 h-3.5 text-blue-600" />;
      case "PAYMENT_SUCCESS":
        return <CreditCard className="w-3.5 h-3.5 text-[#639E1F]" />;
      case "PAYMENT_FAILED":
        return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative p-2.5 rounded-full text-neutral-600 hover:text-[#172B15] hover:bg-neutral-100 transition-all cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#639E1F] text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xl shadow-[#172B15]/5 z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-sm text-[#172B15]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8CC63F]/20 text-[#2D5A1E]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[11px] font-bold text-[#2D5A1E] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 scrollbar-thin">
            {loading ? (
              <div className="p-8 flex items-center justify-center space-y-2">
                <Loader2 className="w-5 h-5 text-[#2D5A1E] animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                You have no notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.public_id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start space-x-3 hover:bg-[#FAFAF7] transition-colors cursor-pointer ${
                    !n.is_read ? "bg-[#F2F8ED]/40" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-xs">
                    {getIcon(n.notification_type)}
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${!n.is_read ? "font-bold text-[#172B15]" : "font-medium text-neutral-700"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0 ml-2">
                        {new Date(n.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-[#FAFAF7] border-t border-neutral-100 text-center">
            <Link
              href="/shop/account/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-[#2D5A1E] hover:underline inline-flex items-center space-x-1"
            >
              <span>View All Notifications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}