// app/admin/affiliates/applications/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAdminApplications,
  approveApplication,
  rejectApplication,
  AdminAffiliateApplication,
} from "@/lib/services/adminAffiliateService";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ExternalLink,
  Users,
  Search,
} from "lucide-react";

export default function AdminAffiliateApplicationsPage() {
  const [applications, setApplications] = useState<AdminAffiliateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [selectedApp, setSelectedApp] = useState<AdminAffiliateApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminApplications(statusFilter || undefined);
      setApplications(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load partner applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const handleApprove = async (app: AdminAffiliateApplication) => {
    if (!confirm(`Approve ${app.full_name}? This will generate their referral code and send an activation email.`)) {
      return;
    }
    setProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      await approveApplication(app.public_id);
      setSuccess(`Application for ${app.full_name} approved! Activation link dispatched.`);
      await loadApplications();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to approve application.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (rejectReason.trim().length < 5) {
      alert("Please provide a reason with at least 5 characters.");
      return;
    }
    setProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      await rejectApplication(selectedApp.public_id, rejectReason.trim());
      setSuccess(`Application for ${selectedApp.full_name} rejected.`);
      setSelectedApp(null);
      setRejectReason("");
      await loadApplications();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to reject application.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Partner Governance
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#172B15] tracking-tight">
            Affiliate Applications Desk
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review applicant audience metrics, channels, and approve partner access.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/affiliates"
            className="px-4 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all"
          >
            Partner Directory
          </Link>
          <Link
            href="/admin/affiliates/settlements"
            className="px-4 py-2 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all"
          >
            Settlement Desk
          </Link>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Filters Bar */}
      <div className="flex items-center space-x-2">
        {["PENDING", "APPROVED", "REJECTED", ""].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === tab
                ? "bg-[#2D5A1E] text-white shadow-xs"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {tab || "ALL"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs text-neutral-400">Loading partner applications...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-400 space-y-2">
            <Users className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No applications found matching the "{statusFilter || "ALL"}" filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Channels & Audience</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {applications.map((app) => (
                  <tr key={app.public_id} className="hover:bg-neutral-50/50">
                    <td className="p-4">
                      <div className="font-bold text-[#172B15]">{app.full_name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{app.email}</div>
                      {app.phone && <div className="text-[10px] text-neutral-400">{app.phone}</div>}
                    </td>

                    <td className="p-4 max-w-sm">
                      <div className="font-semibold text-[#2D5A1E]">{app.promotion_channels}</div>
                      {app.audience_description && (
                        <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                          {app.audience_description}
                        </p>
                      )}
                      {app.website_url && (
                        <a
                          href={app.website_url.startsWith("http") ? app.website_url : `https://${app.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[10px] text-[#639E1F] hover:underline mt-1"
                        >
                          <span>{app.website_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          app.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {app.status}
                      </span>
                      {app.rejection_reason && (
                        <p className="text-[10px] text-red-600 mt-1">
                          Reason: {app.rejection_reason}
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-neutral-400 text-[11px]">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {app.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(app)}
                            disabled={processing}
                            className="px-3.5 py-1.5 rounded-xl bg-[#2D5A1E] text-white font-bold text-[11px] hover:bg-[#234717] disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setSelectedApp(app)}
                            disabled={processing}
                            className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-[11px] hover:bg-red-700 disabled:opacity-50 cursor-pointer shadow-xs"
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

      {/* Rejection Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#172B15]">
              Reject Application: {selectedApp.full_name}
            </h3>
            <p className="text-xs text-neutral-500">
              Provide an administrative rejection reason (sent to applicant or kept for auditing).
            </p>

            <textarea
              rows={3}
              required
              minLength={5}
              placeholder="e.g. Promotional channels do not match our wellness brand guidelines..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl p-3 text-xs focus:outline-none focus:border-[#639E1F]"
            />

            <div className="flex space-x-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedApp(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 border rounded-xl text-xs text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={processing || rejectReason.trim().length < 5}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}