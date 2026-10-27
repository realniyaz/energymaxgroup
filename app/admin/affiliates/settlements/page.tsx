// app/admin/affiliates/settlements/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAdminWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
  AdminWithdrawalItem,
} from "@/lib/services/adminAffiliateService";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Receipt,
} from "lucide-react";

export default function AdminAffiliateSettlementsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  // Dialog states
  const [activeItem, setActiveItem] = useState<AdminWithdrawalItem | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | "mark-paid" | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminWithdrawals(statusFilter || undefined);
      setWithdrawals(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, [statusFilter]);

  const executeAction = async () => {
    if (!activeItem || !dialogAction) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (dialogAction === "approve") {
        await approveWithdrawal(activeItem.public_id);
        setSuccess(`Payout request for Affiliate #${activeItem.affiliate_id} approved.`);
      } else if (dialogAction === "reject") {
        if (inputValue.trim().length < 5) {
          alert("Please provide a rejection note of at least 5 characters.");
          setProcessing(false);
          return;
        }
        await rejectWithdrawal(activeItem.public_id, inputValue.trim());
        setSuccess(`Payout request rejected; reserved funds released back to partner.`);
      } else if (dialogAction === "mark-paid") {
        if (!inputValue.trim()) {
          alert("Please enter the bank transaction or UPI reference number.");
          setProcessing(false);
          return;
        }
        await markWithdrawalPaid(activeItem.public_id, inputValue.trim());
        setSuccess(`Settlement finalized! Status moved to PAID.`);
      }

      setActiveItem(null);
      setDialogAction(null);
      setInputValue("");
      await loadWithdrawals();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Action could not be completed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Treasury & Settlements
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#172B15] tracking-tight">
            Affiliate Payout Settlements
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review partner withdrawal requests, approve banking dispatches, and log transaction UTRs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/affiliates/applications"
            className="px-4 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7]"
          >
            Applications Desk
          </Link>
          <Link
            href="/admin/affiliates/policies"
            className="px-4 py-2 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E]"
          >
            Commission Policies
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

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2">
        {["PENDING", "APPROVED", "PAID", "REJECTED", ""].map((tab) => (
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
            <span className="text-xs text-neutral-400">Loading payout queue...</span>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-400 space-y-2">
            <Receipt className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No withdrawal requests found for "{statusFilter || "ALL"}".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="p-4">Affiliate ID</th>
                  <th className="p-4">Requested Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Requested At</th>
                  <th className="p-4">Reference / Reason</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {withdrawals.map((w) => (
                  <tr key={w.public_id} className="hover:bg-neutral-50/50">
                    <td className="p-4 font-bold text-[#172B15]">
                      Affiliate #{w.affiliate_id}
                    </td>

                    <td className="p-4 font-bold text-sm text-[#2D5A1E]">
                      ₹{Number(w.amount).toFixed(2)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          w.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : w.status === "APPROVED"
                            ? "bg-blue-100 text-blue-800"
                            : w.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td className="p-4 text-neutral-400 text-[11px]">
                      {new Date(w.requested_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-neutral-600 text-[11px] font-sans">
                      {w.payout_reference && (
                        <div className="font-mono text-emerald-700 font-bold">
                          UTR: {w.payout_reference}
                        </div>
                      )}
                      {w.rejection_reason && (
                        <div className="text-red-600">Note: {w.rejection_reason}</div>
                      )}
                      {!w.payout_reference && !w.rejection_reason && "—"}
                    </td>

                    <td className="p-4 text-right space-x-2 font-sans">
                      {w.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => {
                              setActiveItem(w);
                              setDialogAction("approve");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#2D5A1E] text-white font-bold text-[11px] hover:bg-[#234717] cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setActiveItem(w);
                              setDialogAction("reject");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-[11px] hover:bg-red-700 cursor-pointer shadow-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {w.status === "APPROVED" && (
                        <button
                          onClick={() => {
                            setActiveItem(w);
                            setDialogAction("mark-paid");
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#172B15] text-[#8CC63F] font-bold text-[11px] hover:bg-[#2D5A1E] cursor-pointer shadow-xs"
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

      {/* Interactive Modal */}
      {activeItem && dialogAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#172B15]">
              {dialogAction === "approve"
                ? "Approve Payout"
                : dialogAction === "reject"
                ? "Reject Payout Request"
                : "Confirm Bank Disbursement"}
            </h3>

            {dialogAction === "approve" && (
              <p className="text-xs text-neutral-500">
                Confirm approval of ₹{Number(activeItem.amount).toFixed(2)} for Affiliate #{activeItem.affiliate_id}. Funds will remain reserved until marked paid.
              </p>
            )}

            {dialogAction === "reject" && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">
                  Provide reason for rejection. This automatically returns the reserved funds back to the partner's available balance.
                </p>
                <textarea
                  rows={3}
                  required
                  placeholder="Reason for rejection (min 5 chars)..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl p-3 text-xs focus:outline-none focus:border-[#639E1F]"
                />
              </div>
            )}

            {dialogAction === "mark-paid" && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">
                  Enter the banking UTR or UPI transaction reference to finalize settlement of ₹{Number(activeItem.amount).toFixed(2)}.
                </p>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-20261027-AXIS..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-[#639E1F]"
                />
              </div>
            )}

            <div className="flex space-x-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveItem(null);
                  setDialogAction(null);
                  setInputValue("");
                }}
                className="px-4 py-2 border rounded-xl text-xs text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeAction}
                disabled={processing}
                className="px-4 py-2 bg-[#172B15] text-white rounded-xl text-xs font-bold hover:bg-[#2D5A1E] disabled:opacity-50"
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}