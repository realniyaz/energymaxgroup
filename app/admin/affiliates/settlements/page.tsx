// app/admin/affiliates/settlements/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  getAdminWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
  AdminWithdrawalItem,
} from "@/lib/services/adminAffiliateService";
import {
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Check,
  SendHorizontal,
} from "lucide-react";

export default function AdminPayoutSettlementsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals
  const [rejectItem, setRejectItem] = useState<AdminWithdrawalItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [payItem, setPayItem] = useState<AdminWithdrawalItem | null>(null);
  const [payoutRef, setPayoutRef] = useState("");

  const loadWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filter = statusFilter === "ALL" ? undefined : statusFilter;
      const data = await getAdminWithdrawals(filter);
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  const handleApprove = async (item: AdminWithdrawalItem) => {
    if (!confirm(`Approve withdrawal of ₹${item.amount} for Affiliate #${item.affiliate_id}?`)) return;

    setActionLoadingId(item.public_id);
    setError(null);
    setSuccess(null);

    try {
      await approveWithdrawal(item.public_id);
      setSuccess("Withdrawal approved for settlement.");
      await loadWithdrawals();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to approve withdrawal.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectItem) return;

    setActionLoadingId(rejectItem.public_id);
    setError(null);
    setSuccess(null);

    try {
      await rejectWithdrawal(rejectItem.public_id, rejectReason.trim());
      setSuccess("Withdrawal rejected; reserved balance unlocked.");
      setRejectItem(null);
      setRejectReason("");
      await loadWithdrawals();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to reject withdrawal.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkPaidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payItem) return;

    setActionLoadingId(payItem.public_id);
    setError(null);
    setSuccess(null);

    try {
      await markWithdrawalPaid(payItem.public_id, payoutRef.trim());
      setSuccess("Withdrawal finalized and marked PAID with reference.");
      setPayItem(null);
      setPayoutRef("");
      await loadWithdrawals();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to finalize settlement.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border border-red-200";
      case "PENDING":
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
            Treasury & Settlements
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B15] tracking-tight">
            Payout <span className="italic font-light text-[#639E1F]">Settlements Desk</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Supervise partner payout requests, release rejected funds, and log bank UTR references.
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
            onClick={loadWithdrawals}
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

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto">
        {(["ALL", "PENDING", "APPROVED", "PAID", "REJECTED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === tab
                ? "bg-[#2D5A1E] text-white shadow-xs"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Fetching Withdrawal Records...
            </span>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-400 space-y-2">
            <Receipt className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No withdrawal requests found for this status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Partner</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Requested At</th>
                  <th className="px-6 py-4">Payout Ref / Note</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {withdrawals.map((w) => (
                  <tr key={w.public_id} className="hover:bg-[#FAFAF7]/70">
                    <td className="px-6 py-4 text-[11px] text-neutral-600">
                      {w.public_id.slice(0, 8)}...
                    </td>

                    <td className="px-6 py-4 font-sans font-bold text-[#172B15]">
                      Affiliate #{w.affiliate_id}
                    </td>

                    <td className="px-6 py-4 font-bold text-sm text-[#172B15]">
                      ₹{Number(w.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 text-center font-sans">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                          w.status
                        )}`}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[11px] text-neutral-500">
                      {new Date(w.requested_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-neutral-600 font-sans text-xs">
                      {w.payout_reference ? (
                        <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-[11px] text-[#172B15]">
                          {w.payout_reference}
                        </span>
                      ) : w.rejection_reason ? (
                        <span className="text-red-600 italic">
                          Note: {w.rejection_reason}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right font-sans space-x-2 whitespace-nowrap">
                      {w.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(w)}
                            disabled={actionLoadingId === w.public_id}
                            className="px-3 py-1 rounded-xl bg-[#2D5A1E] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#1e3c14] disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectItem(w)}
                            disabled={actionLoadingId === w.public_id}
                            className="px-3 py-1 rounded-xl bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider hover:bg-red-200 disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {w.status === "APPROVED" && (
                        <button
                          onClick={() => setPayItem(w)}
                          disabled={actionLoadingId === w.public_id}
                          className="px-3 py-1 rounded-xl bg-[#172B15] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#2D5A1E] disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Reject Request */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#172B15]">
              Reject Payout Request
            </h3>
            <p className="text-xs text-neutral-500">
              Provide an administrative explanation. Reserved funds will be immediately released back to the partner balance.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                minLength={5}
                placeholder="Reason (e.g. Invalid bank details, pending fraud check)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl p-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />

              <div className="flex space-x-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectItem(null);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 border rounded-xl text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === rejectItem.public_id || rejectReason.trim().length < 5}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mark Paid */}
      {payItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#172B15]">
              Finalize Payout Settlement
            </h3>
            <p className="text-xs text-neutral-500">
              Enter the bank transaction reference number or UPI UTR code.
            </p>

            <form onSubmit={handleMarkPaidSubmit} className="space-y-4">
              <input
                type="text"
                required
                minLength={3}
                placeholder="Bank UTR / Cashfree Reference..."
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl p-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-mono"
              />

              <div className="flex space-x-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPayItem(null);
                    setPayoutRef("");
                  }}
                  className="px-4 py-2 border rounded-xl text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === payItem.public_id || payoutRef.trim().length < 3}
                  className="px-4 py-2 bg-[#2D5A1E] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1e3c14] disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Record Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}