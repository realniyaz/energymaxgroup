// app/admin/affiliates/applications/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  getAdminApplications,
  approveApplication,
  rejectApplication,
  AdminAffiliateApplication,
} from "@/lib/services/adminAffiliateService";
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  ExternalLink,
  Users,
  Search,
  ArrowLeft,
  Receipt,
  Percent,
  RefreshCw,
  XCircle,
} from "lucide-react";

export default function AdminAffiliateApplicationsPage() {
  const [applications, setApplications] = useState<AdminAffiliateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [search, setSearch] = useState("");

  const [selectedApp, setSelectedApp] = useState<AdminAffiliateApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filter = statusFilter === "all" ? undefined : statusFilter;
      const data = await getAdminApplications(filter);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to load partner applications.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleApprove = async (app: AdminAffiliateApplication) => {
    if (!confirm(`Approve affiliate application for ${app.full_name}?`)) return;

    setActionLoadingId(app.public_id);
    setError(null);
    setSuccess(null);

    try {
      await approveApplication(app.public_id);
      setSuccess(`Application for ${app.full_name} approved! Activation link dispatched.`);
      await loadApplications();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to approve application.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (rejectReason.trim().length < 5) {
      alert("Please provide a rejection note of at least 5 characters.");
      return;
    }

    setActionLoadingId(selectedApp.public_id);
    setError(null);
    setSuccess(null);

    try {
      await rejectApplication(selectedApp.public_id, rejectReason.trim());
      setSuccess(`Application for ${selectedApp.full_name} rejected.`);
      setSelectedApp(null);
      setRejectReason("");
      await loadApplications();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to reject application.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (!q) return true;
      const name = (a.full_name || "").toLowerCase();
      const email = (a.email || "").toLowerCase();
      const channels = (a.promotion_channels || "").toLowerCase();
      return name.includes(q) || email.includes(q) || channels.includes(q);
    });
  }, [applications, search]);

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
      default:
        return "bg-amber-100 text-amber-800 border border-amber-200";
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Admissions Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B15] tracking-tight">
            Partner <span className="italic font-light text-[#639E1F]">Applications</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review candidate audience profiles, verify promotion channels, and issue approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/affiliates"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Partner Directory</span>
          </Link>
          <button
            onClick={loadApplications}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Ribbon */}
      <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by name, email, channels..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-[#2D5A1E] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Fetching Applications...
            </span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-400 space-y-2">
            <Users className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No applications match the current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Channels & Audience</th>
                  <th className="px-6 py-4">Website</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredApplications.map((app) => (
                  <tr key={app.public_id} className="hover:bg-[#FAFAF7]/70">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#172B15]">{app.full_name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{app.email}</div>
                      {app.phone && <div className="text-[10px] text-neutral-400 font-mono">{app.phone}</div>}
                    </td>

                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-semibold text-[#2D5A1E]">{app.promotion_channels}</div>
                      {app.audience_description && (
                        <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                          {app.audience_description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {app.website_url ? (
                        <a
                          href={app.website_url.startsWith("http") ? app.website_url : `https://${app.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] text-[#2D5A1E] hover:underline"
                        >
                          <span className="max-w-[130px] truncate block">{app.website_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                      {app.decision_reason && (
                        <p className="text-[10px] text-red-600 mt-1 max-w-[140px] truncate mx-auto">
                          {app.decision_reason}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-neutral-500">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {app.status.toLowerCase() === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(app)}
                            disabled={actionLoadingId === app.public_id}
                            className="px-3.5 py-1.5 rounded-xl bg-[#2D5A1E] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#1e3c14] disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setSelectedApp(app)}
                            disabled={actionLoadingId === app.public_id}
                            className="px-3.5 py-1.5 rounded-xl bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider hover:bg-red-200 disabled:opacity-50 cursor-pointer shadow-xs"
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
        )}
      </div>

      {/* Reject Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#172B15]">
              Reject Application: {selectedApp.full_name}
            </h3>
            <p className="text-xs text-neutral-500">
              Provide an administrative reason explaining why this application was not accepted.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                rows={3}
                required
                minLength={5}
                placeholder="Audit note (e.g. Channel does not meet guidelines)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl p-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />

              <div className="flex space-x-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedApp(null);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 border rounded-xl text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === selectedApp.public_id || rejectReason.trim().length < 5}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 cursor-pointer shadow-xs"
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