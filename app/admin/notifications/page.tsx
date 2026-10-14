// app/admin/notifications/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Package,
  CreditCard,
  AlertCircle,
  Truck,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAdminNotifications } from "@/context/admin-notification-context";
import {
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  AdminNotificationItem,
} from "@/lib/services/adminNotificationService";

export default function AdminNotificationCenterPage() {
  const { refreshUnreadCount } = useAdminNotifications();

  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminNotifications({
        unread_only: unreadOnly,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setNotifications(data.items);
      setTotalCount(data.total);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, page, pageSize]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleMarkOne = async (item: AdminNotificationItem) => {
    if (item.is_read) return;
    await markAdminNotificationAsRead(item.public_id);
    setNotifications((prev) =>
      prev.map((n) => (n.public_id === item.public_id ? { ...n, is_read: true } : n))
    );
    refreshUnreadCount();
  };

  const handleMarkAll = async () => {
    await markAllAdminNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    refreshUnreadCount();
  };

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "ORDER_CREATED":
        return <Package className="w-5 h-5 text-[#2D5A1E]" />;
      case "ORDER_PAID":
      case "PAYMENT_SUCCESS":
        return <CreditCard className="w-5 h-5 text-[#639E1F]" />;
      case "PAYMENT_FAILED":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "ORDER_SHIPPED":
      case "ORDER_DELIVERED":
        return <Truck className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-neutral-500" />;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Administrative Audit & Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            Notification <span className="font-serif italic text-[#639E1F]">Center</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setUnreadOnly(!unreadOnly);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              unreadOnly
                ? "bg-[#2D5A1E] text-white border-[#2D5A1E]"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-[#639E1F]"
            }`}
          >
            Unread Only
          </button>

          <button
            onClick={handleMarkAll}
            className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={fetchItems}
            className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main List */}
      {loading && notifications.length === 0 ? (
        <div className="p-20 bg-white rounded-3xl border border-[#2D5A1E]/15 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
            Synchronizing administrative alerts...
          </span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-[#2D5A1E]/15 space-y-3">
          <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
          <h3 className="text-base font-bold text-[#172B15]">No administrative alerts</h3>
          <p className="text-xs text-neutral-500">
            System notifications for incoming orders, payments, and fulfillments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.public_id}
              onClick={() => handleMarkOne(item)}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                !item.is_read
                  ? "bg-white border-[#639E1F]/50 shadow-sm ring-1 ring-[#639E1F]/20"
                  : "bg-white/80 border-[#2D5A1E]/15 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center shrink-0">
                  {getIcon(item.notification_type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-[#172B15]">{item.title}</h3>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#639E1F]" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                    {item.message}
                  </p>
                  <div className="flex items-center space-x-2 text-[10px] text-neutral-400 font-mono pt-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(item.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {item.entity_type === "ORDER" && item.entity_public_id && (
                <Link
                  href={`/admin/orders/${item.entity_public_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 hover:bg-[#2D5A1E] hover:text-white transition-all text-neutral-600 shrink-0 self-center"
                  title="View Associated Order"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#2D5A1E]/15 text-xs text-neutral-500">
          <span>
            Page {page} of {totalPages} ({totalCount} total)
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}