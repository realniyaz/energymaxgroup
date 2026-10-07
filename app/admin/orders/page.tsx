// app/admin/orders/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye,
  Filter,
} from "lucide-react";
import {
  getAdminOrders,
  AdminOrderListItem,
} from "@/lib/services/adminOrderService";

const STATUS_FILTERS = [
  { label: "All Statuses", value: "" },
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Paid", value: "paid" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrders({
        page,
        page_size: pageSize,
        status: status || undefined,
        search: search.trim() || undefined,
      });
      setOrders(data.items);
      setTotalPages(data.total_pages);
      setTotalOrders(data.total);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus.toLowerCase()) {
      case "paid":
        return "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40";
      case "pending_payment":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-neutral-100 text-neutral-700 border border-neutral-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Cold-Chain Operations
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#172B15]">
            Customer Orders ({totalOrders})
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, patron..."
              className="bg-white border border-[#2D5A1E]/15 rounded-xl pl-9 pr-4 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] w-56"
            />
          </form>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] cursor-pointer"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Fetching Order Manifests...
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">No orders found matching the filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Order Number</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((ord) => (
                  <tr key={ord.public_id} className="hover:bg-[#FAFAF7]/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#172B15]">
                      {ord.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#172B15]">{ord.customer_name}</p>
                      <p className="text-[11px] text-neutral-400">{ord.customer_email || ord.customer_phone || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(ord.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(ord.status)}`}>
                        {ord.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-serif font-bold text-[#172B15]">
                      ₹{Number(ord.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/orders/${ord.public_id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 hover:bg-[#172B15] hover:text-white transition-all text-neutral-700 font-bold text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 text-xs">
            <span className="text-neutral-500">
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