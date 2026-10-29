// app/admin/affiliates/kyc/page.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowRight,
  Loader2,
  Layers,
  FileText,
  UserCheck,
  RotateCcw,
  Mail,
  Phone,
  User,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import {
  getAdminKYCQueueSummary,
  getAdminKYCSubmissions,
  claimAdminKYCSubmission,
  getAdminAffiliates,
  AdminKYCQueueSummary,
  AdminKYCSubmissionItem,
  AdminKYCStatus,
  AdminAffiliateItem,
} from "@/lib/services/adminAffiliateService";

export default function AdminAffiliateKYCDeskPage() {
  const [summary, setSummary] = useState<AdminKYCQueueSummary | null>(null);
  const [submissions, setSubmissions] = useState<AdminKYCSubmissionItem[]>([]);
  const [affiliates, setAffiliates] = useState<AdminAffiliateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & search
  const [statusFilter, setStatusFilter] = useState<AdminKYCStatus | "ALL">("ALL");
  const [selectedClientName, setSelectedClientName] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = statusFilter === "ALL" ? null : statusFilter;
      const [sumRes, listRes, affsRes] = await Promise.all([
        getAdminKYCQueueSummary().catch(() => null),
        getAdminKYCSubmissions(filter, 100, 0),
        getAdminAffiliates(null, 200, 0).catch(() => []),
      ]);

      if (sumRes) setSummary(sumRes);
      setSubmissions(Array.isArray(listRes.items) ? listRes.items : []);
      if (Array.isArray(affsRes)) setAffiliates(affsRes);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Failed to synchronize the affiliate KYC compliance queue."
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Robust Resolver: Combines sub.affiliate object with the Affiliates Roster cache
  const resolveAffiliate = useCallback(
    (sub: AdminKYCSubmissionItem) => {
      // 1. Direct object returned from updated backend
      if (sub.affiliate && sub.affiliate.full_name) {
        return {
          name: sub.affiliate.full_name,
          email: sub.affiliate.email,
          phone: sub.affiliate.phone || null,
          code: sub.affiliate.affiliate_code,
          status: sub.affiliate.account_status,
          initials: sub.affiliate.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        };
      }

      // 2. Cross-reference by affiliate_id against loaded affiliates
      const match = affiliates.find(
        (a) =>
          (a.id !== undefined && a.id === sub.affiliate_id) ||
          (a as any).pk === sub.affiliate_id ||
          a.public_id === (sub as any).affiliate?.id
      );

      if (match) {
        return {
          name: match.full_name,
          email: match.email,
          phone: match.phone || null,
          code: match.public_code,
          status: match.status,
          initials: match.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        };
      }

      // 3. Graceful fallback
      return {
        name: `Partner #${sub.affiliate_id}`,
        email: null,
        phone: null,
        code: `ID-${sub.affiliate_id}`,
        status: "ACTIVE",
        initials: "PT",
      };
    },
    [affiliates]
  );

  // Distinct client names for profile-wise dropdown
  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s) => {
      const aff = resolveAffiliate(s);
      if (aff.name && !aff.name.startsWith("Partner #")) {
        map.set(aff.name, aff.code);
      }
    });
    affiliates.forEach((a) => {
      if (a.full_name) {
        map.set(a.full_name, a.public_code);
      }
    });
    return Array.from(map.entries()).map(([name, code]) => ({ name, code }));
  }, [submissions, affiliates, resolveAffiliate]);

  // Combined Multi-Attribute Filtering (Search + Status + Client Profile)
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const aff = resolveAffiliate(s);
      const q = search.trim().toLowerCase();

      // Client name dropdown filter
      if (selectedClientName !== "ALL" && aff.name !== selectedClientName) {
        return false;
      }

      if (!q) return true;

      const name = (aff.name || "").toLowerCase();
      const email = (aff.email || "").toLowerCase();
      const phone = (aff.phone || "").toLowerCase();
      const code = (aff.code || "").toLowerCase();
      const uuid = (s.public_id || "").toLowerCase();
      const affiliateId = String(s.affiliate_id || "");
      const status = (s.status || "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        code.includes(q) ||
        uuid.includes(q) ||
        affiliateId.includes(q) ||
        status.includes(q)
      );
    });
  }, [submissions, search, selectedClientName, resolveAffiliate]);

  // Claim handler
  const handleClaim = async (sub: AdminKYCSubmissionItem, index: number) => {
    const numericId = sub.id ?? index + 1;
    setActionLoadingId(sub.public_id);
    setError(null);
    setSuccessMsg(null);

    try {
      await claimAdminKYCSubmission(numericId);
      setSuccessMsg(
        `Submission ${sub.public_id.slice(0, 8)}... successfully claimed for review.`
      );
      await loadData();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Failed to claim submission. Verify admin permissions."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderStatusBadge = (status: AdminKYCStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Verified</span>
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>In Review</span>
          </span>
        );
      case "RESUBMISSION_REQUIRED":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            <RotateCcw className="w-3 h-3 text-amber-600" />
            <span>Resubmit Req</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      case "PENDING_REVIEW":
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans max-w-7xl mx-auto text-[#172B15]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Compliance & Identity Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B15] tracking-tight">
            Affiliate <span className="italic font-light text-[#639E1F]">KYC Verification Desk</span>
          </h1>
          <p className="text-xs text-neutral-500 pt-1">
            Audit partner legal dossiers, inspect identification files, and authorize payout eligibility.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/affiliates"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#639E1F]" />
            <span>Partner Directory</span>
          </Link>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">
            Total Dossiers
          </span>
          <div className="text-xl font-mono font-bold text-[#172B15] mt-1">
            {summary?.total_submissions ?? 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700 block">
            Pending Review
          </span>
          <div className="text-xl font-mono font-bold text-amber-800 mt-1">
            {summary?.pending_review ?? 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-widest text-blue-700 block">
            In Review
          </span>
          <div className="text-xl font-mono font-bold text-blue-800 mt-1">
            {summary?.in_review ?? 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 bg-purple-50/20 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-widest text-purple-700 block">
            Resubmit Needed
          </span>
          <div className="text-xl font-mono font-bold text-purple-800 mt-1">
            {summary?.resubmission_required ?? 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 block">
            Verified Clean
          </span>
          <div className="text-xl font-mono font-bold text-emerald-800 mt-1">
            {summary?.verified ?? 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-widest text-rose-700 block">
            Rejected
          </span>
          <div className="text-xl font-mono font-bold text-rose-800 mt-1">
            {summary?.rejected ?? 0}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
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

      {/* Filter Ribbon: Search + Name Dropdown Filter + Status Tabs */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Universal Search Input */}
          <div className="relative md:col-span-7">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, email, phone, referral code, or UUID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Profile-Wise Name Selector */}
          <div className="relative md:col-span-5">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D5A1E]" />
              <select
                value={selectedClientName}
                onChange={(e) => setSelectedClientName(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-semibold text-[#172B15] appearance-none focus:outline-none focus:border-[#639E1F] cursor-pointer"
              >
                <option value="ALL">All Clients / Partners ({clientOptions.length})</option>
                {clientOptions.map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name} ({opt.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Strip & Result Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(
              [
                "ALL",
                "PENDING_REVIEW",
                "IN_REVIEW",
                "RESUBMISSION_REQUIRED",
                "REJECTED",
                "VERIFIED",
              ] as const
            ).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-[#2D5A1E] text-white shadow-xs"
                    : "bg-[#FAFAF7] text-neutral-600 border border-neutral-200/80 hover:bg-neutral-100"
                }`}
              >
                {st === "ALL" ? "All Queue" : st.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-neutral-500 font-mono flex items-center space-x-2 shrink-0">
            <span>
              Showing <strong>{filteredSubmissions.length}</strong> of{" "}
              {submissions.length} dossiers
            </span>
            {(selectedClientName !== "ALL" || search) && (
              <button
                onClick={() => {
                  setSelectedClientName("ALL");
                  setSearch("");
                }}
                className="text-[10px] font-bold text-[#639E1F] uppercase hover:underline ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Submissions Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Fetching verified client KYC records...
            </span>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-500 space-y-2">
            <ShieldAlert className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No KYC dossiers found matching the selected client or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15] min-w-[900px]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-200/80 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Client / Partner Profile</th>
                  <th className="px-6 py-4">Submission UUID & Date</th>
                  <th className="px-6 py-4">Compliance Status</th>
                  <th className="px-6 py-4">Attached Documents</th>
                  <th className="px-6 py-4">Auditor / Reviewer</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredSubmissions.map((sub, index) => {
                  const numericId = sub.id ?? index + 1;
                  const aff = resolveAffiliate(sub);

                  return (
                    <tr key={sub.public_id} className="hover:bg-[#F2F8ED]/30 transition-colors">
                      {/* 1. Client / Partner Profile (Primary Column) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-2xl bg-[#2D5A1E]/10 text-[#2D5A1E] font-bold flex items-center justify-center text-xs shrink-0 border border-[#2D5A1E]/15">
                            {aff.initials}
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold text-[#172B15] text-sm flex items-center space-x-2">
                              <span>{aff.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] font-bold border border-[#8CC63F]/40">
                                {aff.code}
                              </span>
                            </div>

                            <div className="text-[11px] text-neutral-500 font-mono flex items-center space-x-2">
                              {aff.email && (
                                <span className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3 text-neutral-400" />
                                  <span>{aff.email}</span>
                                </span>
                              )}
                              {aff.phone && (
                                <span className="flex items-center space-x-1 text-neutral-400">
                                  <span>•</span>
                                  <Phone className="w-3 h-3" />
                                  <span>{aff.phone}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Submission Reference & Timestamp */}
                      <td className="px-6 py-4">
                        <div className="font-mono text-[11px] font-bold text-neutral-700">
                          {sub.public_id.slice(0, 8)}...{sub.public_id.slice(-4)}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(sub.submitted_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* 3. Status Badge & Notes */}
                      <td className="px-6 py-4">
                        {renderStatusBadge(sub.status)}
                        {sub.decision_reason && (
                          <div
                            className="text-[10px] text-neutral-400 max-w-[180px] truncate mt-1 font-sans"
                            title={sub.decision_reason}
                          >
                            Note: {sub.decision_reason}
                          </div>
                        )}
                      </td>

                      {/* 4. Documents Breakdown */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-[11px] font-semibold text-neutral-700">
                          <FileText className="w-3.5 h-3.5 text-[#2D5A1E]" />
                          <span>{sub.documents?.length || 0} Files Attached</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sub.documents?.map((d) => (
                            <span
                              key={d.public_id}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200"
                            >
                              {d.document_type.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 5. Auditor / Reviewer */}
                      <td className="px-6 py-4 text-xs">
                        {sub.assigned_reviewer_id ? (
                          <span className="inline-flex items-center space-x-1.5 text-neutral-700 font-semibold">
                            <UserCheck className="w-3.5 h-3.5 text-[#2D5A1E]" />
                            <span>Auditor #{sub.assigned_reviewer_id}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* 6. Table Row Actions */}
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {sub.status === "PENDING_REVIEW" && (
                          <button
                            onClick={() => handleClaim(sub, index)}
                            disabled={actionLoadingId === sub.public_id}
                            className="px-3 py-1.5 rounded-xl bg-[#2D5A1E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#1e3c14] transition-all disabled:opacity-50 cursor-pointer shadow-xs inline-flex items-center space-x-1"
                          >
                            {actionLoadingId === sub.public_id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <span>Claim</span>
                            )}
                          </button>
                        )}

                        <Link
                          href={`/admin/affiliates/kyc/${sub.public_id}?numericId=${numericId}`}
                          className="px-3 py-1.5 rounded-xl border border-[#2D5A1E]/20 text-[#2D5A1E] text-[11px] font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all inline-flex items-center space-x-1 shadow-xs"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}