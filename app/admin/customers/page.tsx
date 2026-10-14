// app/admin/customers/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  getCustomers,
  getCustomerStats,
  getNewCustomers,
  getReturningCustomers,
  deleteCustomer,
  CustomerListItem,
  CustomerStats,
} from "@/lib/services/adminCustomerService";

type FilterTab = "all" | "new" | "returning" | "active" | "inactive";

export default function AdminCustomersPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch live telemetry statistics
      getCustomerStats()
        .then(setStats)
        .catch(() => null);

      // 2. Fetch customers based on the selected segment
      if (activeTab === "new") {
        const data = await getNewCustomers({ page, page_size: pageSize });
        setCustomers(data);
        setTotalCount(data.length);
        setTotalPages(1);
      } else if (activeTab === "returning") {
        const data = await getReturningCustomers({ page, page_size: pageSize });
        setCustomers(data);
        setTotalCount(data.length);
        setTotalPages(1);
      } else {
        const isActiveParam =
          activeTab === "active" ? true : activeTab === "inactive" ? false : undefined;
        const res = await getCustomers({
          page,
          page_size: pageSize,
          search: search.trim() || undefined,
          is_active: isActiveParam,
        });
        setCustomers(res.items);
        setTotalCount(res.total);
        setTotalPages(res.total_pages);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to load customer records.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleDelete = async (customer: CustomerListItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete customer "@${customer.username}"? This action will cascade across all sessions and linked addresses.`
    );
    if (!confirmed) return;

    setDeletingId(customer.public_id);
    try {
      await deleteCustomer(customer.public_id);
      setCustomers((prev) => prev.filter((c) => c.public_id !== customer.public_id));
      if (stats) {
        setStats({
          ...stats,
          total_customers: Math.max(0, stats.total_customers - 1),
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete customer.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Client Registry & CRM
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            Customer <span className="font-serif italic text-[#639E1F]">Directory</span>
          </h1>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center space-x-2 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Total Patrons
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2D5A1E]/10 flex items-center justify-center text-[#2D5A1E]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#172B15]">
            {stats?.total_customers ?? customers.length}
          </h3>
          <p className="text-[11px] text-neutral-500">Registered platform accounts</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Active Users
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#8CC63F]/20 flex items-center justify-center text-[#2D5A1E]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#2D5A1E]">
            {stats?.active_customers ?? customers.filter((c) => c.is_active).length}
          </h3>
          <p className="text-[11px] text-neutral-500">Unrestricted operational accounts</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Verified Emails
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#172B15]">
            {stats?.email_verified_count ?? customers.filter((c) => c.email_verified).length}
          </h3>
          <p className="text-[11px] text-neutral-500">Passed email OTP verification</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              New Acquisition
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#639E1F]">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#639E1F]">
            {stats?.new_customers_30d ?? "—"}
          </h3>
          <p className="text-[11px] text-neutral-500">Signups in the last 30 days</p>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Tab Controls */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {(
            [
              { id: "all", label: "All Customers" },
              { id: "new", label: "New Signups" },
              { id: "returning", label: "Returning / Repeat" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Inactive" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? "bg-[#2D5A1E] text-white shadow-sm"
                  : "bg-[#FAFAF7] text-neutral-600 border border-neutral-200 hover:border-[#639E1F]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        {activeTab !== "new" && activeTab !== "returning" && (
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] transition-all"
            />
          </form>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Customers Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Synchronizing customer identities...
            </span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Users className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-sm text-neutral-600 font-medium">
              No customer records found matching this segment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Patron Details</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Verification</th>
                  <th className="px-6 py-4">Last Login</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customers.map((c) => (
                  <tr key={c.public_id} className="hover:bg-[#FAFAF7]/70 transition-colors">
                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] font-bold text-sm flex items-center justify-center uppercase border border-[#8CC63F]/30 shrink-0">
                          {c.first_name?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-[#172B15]">
                            {c.first_name} {c.last_name || ""}
                          </p>
                          <p className="text-[11px] font-mono text-neutral-400">
                            @{c.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-neutral-600">
                        <Mail className="w-3 h-3 text-neutral-400" />
                        <span className="truncate max-w-[170px]">{c.email || "—"}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center space-x-1.5 text-neutral-500 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.is_active
                            ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/30"
                            : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                        }`}
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Verification Chips */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {c.email_verified ? (
                          <span
                            title="Email Verified"
                            className="p-1 rounded-md bg-[#8CC63F]/20 text-[#2D5A1E]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span
                            title="Email Unverified"
                            className="p-1 rounded-md bg-amber-50 text-amber-600"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {c.phone_verified && (
                          <span
                            title="Phone Verified"
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-100 text-neutral-600"
                          >
                            PH
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="px-6 py-4 text-neutral-500 font-mono text-[11px]">
                      {c.last_login_at
                        ? new Date(c.last_login_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Never"}
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        href={`/admin/customers/${c.public_id}`}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-[#2D5A1E] hover:text-white transition-all shadow-sm"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.public_id}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                        title="Delete Customer Record"
                      >
                        {deletingId === c.public_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
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
              Showing page {page} of {totalPages} ({totalCount} total)
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
    </div>
  );
}