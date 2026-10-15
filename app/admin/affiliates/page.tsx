// app/admin/affiliates/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Tag,
  ShieldCheck,
} from "lucide-react";
import {
  getAdminAffiliateApplications,
  approveAffiliateApplication,
  rejectAffiliateApplication,
  getAdminAffiliates,
  sendAffiliateActivation,
  AdminAffiliateApplication,
  AdminAffiliateItem,
} from "@/lib/services/adminAffiliateService";

export default function AdminAffiliatesPage() {
  const [activeTab, setActiveTab] = useState<"applications" | "affiliates">("applications");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [applications, setApplications] = useState<AdminAffiliateApplication[]>([]);
  const [affiliates, setAffiliates] = useState<AdminAffiliateItem[]>([]);
  const [search, setSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Rejection modal state
  const [rejectModalApp, setRejectModalApp] = useState<AdminAffiliateApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "applications") {
        const data = await getAdminAffiliateApplications(
          appStatusFilter === "all" ? undefined : { status_filter: appStatusFilter }
        );
        setApplications(data);
      } else {
        const data = await getAdminAffiliates();
        setAffiliates(data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load affiliate records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, appStatusFilter]);

  const handleApprove = async (app: AdminAffiliateApplication) => {
    if (!confirm(`Approve affiliate application for ${app.full_name}?`)) return;
    setActionLoadingId(app.public_id);
    setError(null);
    try {
      await approveAffiliateApplication(app.public_id);
      setSuccessMsg(`Approved ${app.full_name}! Affiliate account created.`);
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to approve application.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalApp) return;
    setActionLoadingId(rejectModalApp.public_id);
    try {
      await rejectAffiliateApplication(rejectModalApp.public_id, rejectReason.trim());
      setSuccessMsg(`Rejected application for ${rejectModalApp.full_name}.`);
      setRejectModalApp(null);
      setRejectReason("");
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to reject application.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendActivation = async (affiliate: AdminAffiliateItem) => {
    setActionLoadingId(affiliate.public_id);
    setError(null);
    try {
      const res = await sendAffiliateActivation(affiliate.public_id);
      setSuccessMsg(res.message || `Activation email sent to ${affiliate.email}!`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to send activation email.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((a) =>
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [applications, search]);

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter((a) =>
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.public_code.toLowerCase().includes(search.toLowerCase())
    );
  }, [affiliates, search]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Partnership & Growth
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            Affiliate <span className="font-serif italic text-[#639E1F]">Desk</span>
          </h1>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 self-start sm:self-auto rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all shadow-sm"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Primary Tab Controls */}
      <div className="flex space-x-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "applications"
              ? "bg-[#2D5A1E] text-white shadow-sm"
              : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Applications</span>
        </button>

        <button
          onClick={() => setActiveTab("affiliates")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "affiliates"
              ? "bg-[#2D5A1E] text-white shadow-sm"
              : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Active Affiliates</span>
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
      <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "applications"
                ? "Search by applicant name or email..."
                : "Search by affiliate name, email, or code..."
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        {activeTab === "applications" && (
          <div className="flex items-center space-x-2 w-full md:w-auto">
            {(["pending", "approved", "rejected", "all"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setAppStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  appStatusFilter === st
                    ? "bg-[#2D5A1E] text-white"
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
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Loading partner records...
            </span>
          </div>
        ) : activeTab === "applications" ? (
          /* APPLICATIONS TABLE */
          filteredApplications.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-500">
              No applications found for this filter.
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
                        <div className="text-[11px] text-neutral-400">{app.email}</div>
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
                            href={app.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2D5A1E] hover:underline inline-flex items-center space-x-1"
                          >
                            <span className="max-w-[120px] truncate block">{app.website_url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] text-neutral-500">
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        {app.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(app)}
                              disabled={actionLoadingId === app.public_id}
                              className="px-3 py-1.5 rounded-xl bg-[#2D5A1E] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#1e3c14] disabled:opacity-50 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModalApp(app)}
                              disabled={actionLoadingId === app.public_id}
                              className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider hover:bg-red-200 disabled:opacity-50 cursor-pointer"
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
          /* AFFILIATES TABLE */
          filteredAffiliates.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-500">
              No active affiliates found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172B15]">
                <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-4">Affiliate</th>
                    <th className="px-6 py-4">Referral Code</th>
                    <th className="px-6 py-4">Approved At</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredAffiliates.map((aff) => (
                    <tr key={aff.public_id} className="hover:bg-[#FAFAF7]/70">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#172B15]">{aff.full_name}</div>
                        <div className="text-[11px] text-neutral-400">{aff.email}</div>
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
                        {aff.password_hash ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Activated</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-amber-600 font-semibold text-[11px]">
                            <Mail className="w-3.5 h-3.5" />
                            <span>Pending Password</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {!aff.password_hash && (
                          <button
                            onClick={() => handleSendActivation(aff)}
                            disabled={actionLoadingId === aff.public_id}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#172B15] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#2D5A1E] disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            {actionLoadingId === aff.public_id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Send Activation</span>
                          </button>
                        )}
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
              Provide an optional decision reason for auditing purposes.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason (e.g. Website does not meet criteria, invalid channels)"
                className="w-full bg-[#FAFAF7] border border-neutral-200 rounded-xl p-3 text-xs text-[#172B15] focus:outline-none focus:border-[#2D5A1E]"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectModalApp(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-xs font-bold uppercase text-neutral-600 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === rejectModalApp.public_id}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 disabled:opacity-50"
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