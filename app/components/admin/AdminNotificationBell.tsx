// components/admin/AdminNotificationBell.tsx
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
  CheckCircle2,
} from "lucide-react";
import { useAdminNotifications } from "@/context/admin-notification-context";
import {
  getAdminNotifications,
  AdminNotificationItem,
} from "@/lib/services/adminNotificationService";

export default function AdminNotificationBell() {
  const router = useRouter();
  const { unreadCount, markOneRead, markAllRead } = useAdminNotifications();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setLoading(true);
    try {
      const data = await getAdminNotifications({ limit: 5, offset: 0 });
      setNotifications(data.items);
    } catch (err) {
      console.error("Failed to load admin notifications:", err);
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

  const handleItemClick = async (item: AdminNotificationItem) => {
    if (!item.is_read) {
      await markOneRead(item.public_id);
      setNotifications((prev) =>
        prev.map((n) => (n.public_id === item.public_id ? { ...n, is_read: true } : n))
      );
    }
    setOpen(false);

    // Deep link based on entity binding
    if (item.entity_type === "ORDER" && item.entity_public_id) {
      router.push(`/admin/orders/${item.entity_public_id}`);
    } else {
      router.push("/admin/notifications");
    }
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "ORDER_CREATED":
        return <Package className="w-3.5 h-3.5 text-[#2D5A1E]" />;
      case "ORDER_PAID":
      case "PAYMENT_SUCCESS":
        return <CreditCard className="w-3.5 h-3.5 text-[#639E1F]" />;
      case "PAYMENT_FAILED":
        return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
      case "ORDER_SHIPPED":
      case "ORDER_DELIVERED":
        return <Truck className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        aria-label="Admin Notifications"
        className="relative p-2 rounded-xl text-neutral-600 hover:text-[#172B15] hover:bg-neutral-100 transition-all cursor-pointer border border-neutral-200"
      >
        <Bell className="w-4 h-4 text-neutral-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#639E1F] text-[9px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-xl shadow-[#172B15]/5 z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-[#FAFAF7]">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#172B15]">
                System Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#8CC63F]/20 text-[#2D5A1E]">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[10px] font-bold text-[#2D5A1E] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-[#2D5A1E] animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No recent admin notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.public_id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 flex items-start space-x-3 hover:bg-[#FAFAF7] transition-colors cursor-pointer ${
                    !n.is_read ? "bg-[#F2F8ED]/40" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                    {getIcon(n.notification_type)}
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${!n.is_read ? "font-bold text-[#172B15]" : "font-medium text-neutral-700"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0 ml-2">
                        {new Date(n.created_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
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

          <div className="p-2.5 bg-[#FAFAF7] border-t border-neutral-100 text-center">
            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-[#2D5A1E] hover:underline inline-flex items-center space-x-1"
            >
              <span>View Notification Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}