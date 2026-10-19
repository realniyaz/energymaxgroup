// app/shop/account/orders/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Calendar,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
  Search,
  Home,
  ChevronLeft,
  ChevronRight,
  Truck,
  Barcode,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { customerClient } from "@/lib/customer-client";
import {
  getMyOrders,
  MyOrderSummaryItem,
  parseOrderAmount,
} from "@/lib/services/orderService";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();

  // Orders State
  const [orders, setOrders] = useState<MyOrderSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Manual Tracking Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch Authenticated Customer Orders
  const loadOrders = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getMyOrders(targetPage, pageSize);
        setOrders(data.items || []);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.total || 0);
        setPage(data.page || targetPage);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push("/shop/auth/login?redirect=/shop/account/orders");
          return;
        }
        const detail = err.response?.data?.detail;
        setError(
          typeof detail === "string"
            ? detail
            : "Unable to retrieve your order history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize, router]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/shop/auth/login?redirect=/shop/account/orders");
      return;
    }

    loadOrders(page);
  }, [isAuthenticated, authLoading, page, loadOrders, router]);

  // Handle Manual Order Number Lookup
  const handleSearchLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await customerClient.get(
        `/api/v1/shop/orders/track/${encodeURIComponent(query)}`
      );

      if (res.data?.public_id) {
        router.push(`/shop/account/orders/${res.data.public_id}`);
      } else {
        setSearchError("Order record located, but ID is missing.");
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setSearchError(
        typeof detail === "string"
          ? detail
          : "Order not found. Please verify the order number."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "paid":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40">
            Paid
          </span>
        );
      case "pending_payment":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            Payment Pending
          </span>
        );
      case "packed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
            Packed
          </span>
        );
      case "processing":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            Processing
          </span>
        );
      case "shipped":
      case "dispatched":
      case "in_transit":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            In Transit
          </span>
        );
      case "out_for_delivery":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
            Out For Delivery
          </span>
        );
      case "delivered":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
            {status.replace("_", " ")}
          </span>
        );
    }
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold">
          Retrieving Your Orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-8 sm:py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-3 pb-2">
          <Link
            href="/"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white border border-[#2D5A1E]/15 text-xs font-semibold text-[#172B15] hover:bg-[#F2F8ED] hover:border-[#639E1F] transition-all shadow-xs"
          >
            <Home className="w-3.5 h-3.5 text-[#639E1F] shrink-0" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/shop"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4.5 py-2.5 rounded-2xl bg-[#2D5A1E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#172B15] transition-all shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Page Title & Search Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Customer Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#172B15]">
              My Orders ({totalCount})
            </h1>
            <p className="text-xs text-neutral-600">
              Review your purchase history, item summaries, and carrier tracking updates[cite: 19].
            </p>
          </div>

          {/* Quick Tracking Search Form */}
          <form
            onSubmit={handleSearchLookup}
            className="flex items-center space-x-2 w-full md:w-auto"
          >
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lookup Order # (e.g. EMX-...)"
                className="w-full bg-white border border-[#2D5A1E]/15 rounded-xl pl-9 pr-3 py-2 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading || !searchQuery.trim()}
              className="px-4 py-2 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1 shrink-0"
            >
              {searchLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Track</span>
              )}
            </button>
          </form>
        </div>

        {/* Alerts */}
        {searchError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadOrders(page)}
              className="text-xs font-bold underline hover:text-red-900 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#2D5A1E]/15 shadow-sm text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center mx-auto text-[#2D5A1E]">
              <Package className="w-7 h-7 text-[#639E1F]" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#172B15]">
              No Orders Found
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              You haven&apos;t placed any orders yet. Visit our shop catalog to explore our products[cite: 19].
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#172B15] transition-all shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Products</span>
            </Link>
          </div>
        ) : (
          /* Orders Card List */
          <div className="space-y-4">
            {orders.map((order) => {
              const orderDate = new Date(order.created_at).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              );

              const itemsCount =
                order.items?.reduce(
                  (acc, curr) => acc + (curr.quantity || 1),
                  0
                ) ||
                order.items?.length ||
                0;

              const totalAmount = parseOrderAmount(order.total_amount);
              const shipment = order.shipment;

              return (
                <div
                  key={order.public_id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-[#2D5A1E]/15 shadow-sm hover:border-[#639E1F]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[#172B15]">
                        {order.order_number}
                      </span>
                      {getStatusBadge(order.status)}

                      {/* Live Courier / AWB Tag */}
                      {shipment?.awb_code && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAFAF7] border border-neutral-200 text-[#2D5A1E]">
                          <Truck className="w-3 h-3 text-[#639E1F]" />
                          <span>
                            {shipment.courier_name || "Courier"}:{" "}
                            {shipment.awb_code}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{orderDate}</span>
                      </span>
                      <span>•</span>
                      <span>
                        {itemsCount} item{itemsCount === 1 ? "" : "s"}
                      </span>
                      {order.shipping_address_snapshot?.city && (
                        <>
                          <span>•</span>
                          <span>
                            Deliver to: {order.shipping_address_snapshot.city}
                          </span>
                        </>
                      )}
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="text-xs text-neutral-600 line-clamp-1 pt-0.5">
                        <span className="font-medium">Items: </span>
                        {order.items.map((it) => it.product_name).join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between md:justify-end space-x-5 pt-3 md:pt-0 border-t md:border-0 border-neutral-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                        Total Amount
                      </span>
                      <span className="text-base sm:text-lg font-serif font-bold text-[#172B15]">
                        ₹
                        {totalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <Link
                      href={`/shop/account/orders/${order.public_id}`}
                      className="px-4 py-2.5 rounded-2xl bg-[#FAFAF7] hover:bg-[#172B15] hover:text-white border border-[#2D5A1E]/15 text-[#172B15] text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 group shadow-xs shrink-0"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[#2D5A1E]/10 text-xs">
            <span className="text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-2 rounded-xl border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-2 rounded-xl border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Cold-Chain Quality Guarantee Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#639E1F]" />
          </div>
          <div className="text-xs text-neutral-600 space-y-0.5">
            <span className="font-bold text-[#172B15] block">
              Temperature-Controlled Cold-Chain Shipping
            </span>
            <span>
              All probiotic orders are shipped under strict cold-storage
              protocols to protect live cultures until they arrive at your door[cite: 19].
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}