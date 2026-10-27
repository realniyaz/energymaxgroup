// app/admin/affiliates/page.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Mail,
  Send,
  RefreshCw,
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Percent,
  Receipt,
  UserCheck,
  Ban,
} from "lucide-react";
import {
  getAdminApplications,
  approveApplication,
  rejectApplication,
  getAdminAffiliates,
  resendActivationLink,
  updateAffiliateStatus,
  AdminAffiliateApplication,
  AdminAffiliateItem,
  AffiliateApplicationStatus,
} from "@/lib/services/adminAffiliateService";

export default function AdminAffiliatesPage() {
  const [activeTab, setActiveTab] = useState<"affiliates" | "applications">("affiliates");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [applications, setApplications] = useState<AdminAffiliateApplication[]>([]);
  const [affiliates, setAffiliates] = useState<AdminAffiliateItem[]>([]);
  const [search, setSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<AffiliateApplicationStatus | "ALL">("PENDING");

  // Rejection modal state
  const [rejectModalApp, setRejectModalApp] = useState<AdminAffiliateApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "applications") {
        const data = await getAdminApplications(
          appStatusFilter === "ALL" ? undefined : appStatusFilter
        );
        setApplications(data || []);
      } else {
        const data = await getAdminAffiliates(undefined, search.trim() || undefined);
        setAffiliates(data || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load affiliate records.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, appStatusFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (app: AdminAffiliateApplication) => {
    if (!confirm(`Approve affiliate application for ${app.full_name}? This will generate their referral code and email activation.`)) {
      return;
    }
    setActionLoadingId(app.public_id);
    setError(null);
    try {
      await approveApplication(app.public_id);
      setSuccessMsg(`Approved ${app.full_name}! Activation invitation dispatched.`);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to approve application.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalApp) return;
    if (rejectReason.trim().length < 5) {
      alert("Please provide an audit rejection reason with at least 5 characters.");
      return;
    }

    setActionLoadingId(rejectModalApp.public_id);
    setError(null);
    try {
      await rejectApplication(rejectModalApp.public_id, rejectReason.trim());
      setSuccessMsg(`Rejected application for ${rejectModalApp.full_name}.`);
      setRejectModalApp(null);
      setRejectReason("");
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to reject application.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendActivation = async (affiliate: AdminAffiliateItem) => {
    setActionLoadingId(affiliate.id);
    setError(null);
    try {
      const res = await resendActivationLink(affiliate.id);
      setSuccessMsg(res.message || `Activation invitation resent to ${affiliate.email}!`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to dispatch activation email.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (affiliate: AdminAffiliateItem) => {
    const nextStatus = affiliate.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (!confirm(`Change partner status for ${affiliate.full_name} to ${nextStatus}?`)) {
      return;
    }

    setActionLoadingId(affiliate.id);
    setError(null);
    try {
      await updateAffiliateStatus(affiliate.id, nextStatus);
      setSuccessMsg(`Partner status updated to ${nextStatus}.`);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update affiliate status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter((a) => {
      const name = (a.full_name || "").toLowerCase();
      const email = (a.email || "").toLowerCase();
      const channels = (a.promotion_channels || "").toLowerCase();
      return name.includes(query) || email.includes(query) || channels.includes(query);
    });
  }, [applications, search]);

  const filteredAffiliates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return affiliates.filter((a) => {
      const name = (a.full_name || "").toLowerCase();
      const email = (a.email || "").toLowerCase();
      const code = (a.public_code || "").toLowerCase();
      return name.includes(query) || email.includes(query) || code.includes(query);
    });
  }, [affiliates, search]);

  return (
    <div className="space-y-6 pb-16 font-sans max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Partnership & Growth Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B15] tracking-tight">
            Affiliate <span className="italic font-light text-[#639E1F]">Partner Desk</span>
          </h1>
          <p className="text-xs text-neutral-500 pt-1">
            Oversee affiliate onboarding, review applications, and audit partner telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Primary Tab Controls */}
      <div className="flex space-x-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => {
            setActiveTab("affiliates");
            setSearch("");
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "affiliates"
              ? "bg-[#2D5A1E] text-white shadow-xs"
              : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Partner Directory</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("applications");
            setSearch("");
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "applications"
              ? "bg-[#2D5A1E] text-white shadow-xs"
              : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Applicant Onboarding Desk</span>
        </button>
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "applications"
                ? "Search applicants by name, email, channels..."
                : "Search partners by name, email, or code..."
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        {activeTab === "applications" && (
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
            {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setAppStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  appStatusFilter === st
                    ? "bg-[#2D5A1E] text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Data Views */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Synchronizing partner database...
            </span>
          </div>
        ) : activeTab === "applications" ? (
          /* =========================================================
             APPLICATIONS DESK TABLE
             ========================================================= */
          filteredApplications.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-500">
              No applications found matching the current search/status filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172B15]">
                <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Channels & Audience</th>
                    <th className="px-6 py-4">Website</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.public_id} className="hover:bg-[#FAFAF7]/70">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#172B15]">{app.full_name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{app.email}</div>
                        {app.phone && <div className="text-[10px] text-neutral-400">{app.phone}</div>}
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-semibold text-[11px] text-[#2D5A1E] line-clamp-2">
                          {app.promotion_channels}
                        </div>
                        {app.audience_description && (
                          <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                            {app.audience_description}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {app.website_url ? (
                          <a
                            href={
                              app.website_url.startsWith("http")
                                ? app.website_url
                                : `https://${app.website_url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2D5A1E] hover:underline inline-flex items-center space-x-1"
                          >
                            <span className="max-w-[130px] truncate block">{app.website_url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] text-neutral-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {app.status}
                        </span>
                        {app.rejection_reason && (
                          <p className="text-[10px] text-red-600 mt-1 max-w-[140px] truncate mx-auto">
                            {app.rejection_reason}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        {app.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(app)}
                              disabled={actionLoadingId === app.public_id}
                              className="px-3 py-1.5 rounded-xl bg-[#2D5A1E] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#1e3c14] disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModalApp(app)}
                              disabled={actionLoadingId === app.public_id}
                              className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider hover:bg-red-200 disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* =========================================================
             ACTIVE AFFILIATES DIRECTORY TABLE
             ========================================================= */
          filteredAffiliates.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-500">
              No registered affiliate partners found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172B15]">
                <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-4">Affiliate Partner</th>
                    <th className="px-6 py-4">Referral Code</th>
                    <th className="px-6 py-4">Approved Date</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4">Activation</th>
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
                        {new Date(aff.approved_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            aff.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : aff.status === "SUSPENDED"
                              ? "bg-red-100 text-red-800"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {aff.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {aff.is_activated ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Activated</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-amber-600 font-semibold text-[11px]">
                            <Mail className="w-3.5 h-3.5" />
                            <span>Pending Invite</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        {!aff.is_activated && (
                          <button
                            onClick={() => handleSendActivation(aff)}
                            disabled={actionLoadingId === aff.id}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#172B15] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#2D5A1E] disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            {actionLoadingId === aff.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Resend Invite</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleStatus(aff)}
                          disabled={actionLoadingId === aff.id}
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-xs ${
                            aff.status === "ACTIVE"
                              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {aff.status === "ACTIVE" ? (
                            <>
                              <Ban className="w-3 h-3" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#172B15]">
              Reject Application: {rejectModalApp.full_name}
            </h3>
            <p className="text-xs text-neutral-500">
              Provide an audit decision note for why this candidate was not accepted.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                minLength={5}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason (e.g. Website does not meet brand criteria, low audience engagement)"
                className="w-full bg-[#FAFAF7] border border-neutral-200 rounded-xl p-3 text-xs text-[#172B15] focus:outline-none focus:border-[#2D5A1E]"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalApp(null);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-xs font-bold uppercase text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === rejectModalApp.public_id || rejectReason.trim().length < 5}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}