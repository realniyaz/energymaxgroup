// app/shop/account/notifications/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useCustomerNotifications } from "@/context/customer-notification-context";
import {
  getCustomerNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  CustomerNotificationItem,
} from "@/lib/services/customerNotificationService";

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();
  const { refreshUnreadCount } = useCustomerNotifications();

  const [notifications, setNotifications] = useState<CustomerNotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomerNotifications({
        unread_only: unreadOnly,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setNotifications(data.items);
      setTotalCount(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, page, pageSize]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/shop/auth/login?redirect=/shop/account/notifications");
      return;
    }
    fetchItems();
  }, [isAuthenticated, authLoading, fetchItems, router]);

  const handleMarkOne = async (item: CustomerNotificationItem) => {
    if (item.is_read) return;
    await markNotificationAsRead(item.public_id);
    setNotifications((prev) =>
      prev.map((n) => (n.public_id === item.public_id ? { ...n, is_read: true } : n))
    );
    refreshUnreadCount();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    refreshUnreadCount();
  };

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "ORDER_CONFIRMED":
      case "ORDER_PROCESSING":
        return <Package className="w-5 h-5 text-[#2D5A1E]" />;
      case "ORDER_SHIPPED":
      case "ORDER_DELIVERED":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "PAYMENT_SUCCESS":
        return <CreditCard className="w-5 h-5 text-[#639E1F]" />;
      case "PAYMENT_FAILED":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-neutral-500" />;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  if (authLoading || (loading && notifications.length === 0)) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Retrieving In-App Inbox...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
          <div className="space-y-1">
            <Link
              href="/shop/account/orders"
              className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#2D5A1E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Account</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#172B15]">
              Notifications Inbox ({totalCount})
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setUnreadOnly(!unreadOnly);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                unreadOnly
                  ? "bg-[#2D5A1E] text-white border-[#2D5A1E]"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-[#639E1F]"
              }`}
            >
              Unread Only
            </button>

            <button
              onClick={handleMarkAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all flex items-center space-x-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#2D5A1E]/15 space-y-3">
            <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
            <h3 className="text-base font-bold text-[#172B15]">Your inbox is clear</h3>
            <p className="text-xs text-neutral-500">
              You will receive real-time updates here as your formulations are confirmed and dispatched.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.public_id}
                onClick={() => handleMarkOne(item)}
                className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                  !item.is_read
                    ? "bg-white border-[#639E1F]/50 shadow-sm ring-1 ring-[#639E1F]/20"
                    : "bg-white/80 border-[#2D5A1E]/15 opacity-80"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center shrink-0 shadow-xs">
                    {getIcon(item.notification_type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-[#172B15]">{item.title}</h3>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#639E1F]" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed max-w-xl">
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
                    href={`/shop/account/orders/${item.entity_public_id}`}
                    className="p-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 hover:bg-[#2D5A1E] hover:text-white transition-all text-neutral-600 shrink-0 self-center"
                    title="View Linked Order"
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
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}