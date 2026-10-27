// app/admin/affiliates/page.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Send,
  RefreshCw,
  Search,
  AlertCircle,
  Loader2,
  Percent,
  Receipt,
  UserCheck,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import {
  getAdminAffiliates,
  resendActivationLink,
  AdminAffiliateItem,
} from "@/lib/services/adminAffiliateService";

export default function AdminAffiliatesDirectoryPage() {
  const [affiliates, setAffiliates] = useState<AdminAffiliateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchAffiliates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = statusFilter === "all" ? undefined : statusFilter;
      const data = await getAdminAffiliates(filter);
      setAffiliates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to load affiliate partner directory.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const handleSendActivation = async (affiliate: AdminAffiliateItem) => {
    setActionLoadingId(affiliate.public_id);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await resendActivationLink(affiliate.public_id);
      setSuccessMsg(res.message || `Activation email sent to ${affiliate.email}!`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to dispatch activation email.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAffiliates = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return affiliates.filter((a) => {
      const name = (a.full_name || "").toLowerCase();
      const email = (a.email || "").toLowerCase();
      const code = (a.public_code || "").toLowerCase();
      return name.includes(q) || email.includes(q) || code.includes(q);
    });
  }, [affiliates, search]);

  return (
    <div className="space-y-6 pb-16 font-sans max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Partner Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B15] tracking-tight">
            Affiliate <span className="italic font-light text-[#639E1F]">Partner Directory</span>
          </h1>
          <p className="text-xs text-neutral-500 pt-1">
            Active partner management, referral codes, and security token activation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/affiliates/applications"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#639E1F]" />
            <span>Applications Desk</span>
          </Link>

          <Link
            href="/admin/affiliates/settlements"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5 text-[#639E1F]" />
            <span>Settlement Desk</span>
          </Link>

          <Link
            href="/admin/affiliates/policies"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Percent className="w-3.5 h-3.5 text-[#639E1F]" />
            <span>Commission Policies</span>
          </Link>

          <button
            onClick={fetchAffiliates}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partners by name, email, or code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {(["all", "active", "suspended"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#2D5A1E] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Loading partner records...
            </span>
          </div>
        ) : filteredAffiliates.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-500">
            No registered affiliate partners found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Partner</th>
                  <th className="px-6 py-4">Referral Code</th>
                  <th className="px-6 py-4">Approved Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAffiliates.map((aff) => (
                  <tr key={aff.public_id} className="hover:bg-[#FAFAF7]/70">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#172B15]">{aff.full_name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{aff.email}</div>
                      {aff.phone && <div className="text-[10px] text-neutral-400">{aff.phone}</div>}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-xs tracking-wider px-2 py-1 rounded-lg bg-[#2D5A1E]/10 text-[#2D5A1E] border border-[#2D5A1E]/20">
                        {aff.public_code}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-neutral-500">
                      {aff.approved_at ? new Date(aff.approved_at).toLocaleDateString() : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          (aff.status || "").toLowerCase() === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {aff.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSendActivation(aff)}
                        disabled={actionLoadingId === aff.public_id}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#172B15] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#2D5A1E] disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {actionLoadingId === aff.public_id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        <span>Resend Activation Email</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}