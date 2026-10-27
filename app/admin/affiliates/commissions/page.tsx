// app/admin/affiliates/commissions/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Percent,
  CheckCircle2,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Receipt,
  Users,
  FileText,
} from "lucide-react";
import {
  getAdminCommissions,
  adjustCommission,
  reverseCommission,
  CommissionLedgerItem,
} from "@/lib/services/adminAffiliateService";

export default function AdminCommissionsLedgerPage() {
  const [commissions, setCommissions] = useState<CommissionLedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Adjustment Modal State
  const [adjustItem, setAdjustItem] = useState<CommissionLedgerItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustDescription, setAdjustDescription] = useState<string>("");

  // Reversal Modal State
  const [reverseItem, setReverseItem] = useState<CommissionLedgerItem | null>(null);
  const [reverseReason, setReverseReason] = useState<string>("");

  const loadCommissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filter = entryTypeFilter === "ALL" ? undefined : entryTypeFilter;
      const data = await getAdminCommissions(undefined, filter, 100, 0);
      setCommissions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to load commission ledger.");
    } finally {
      setLoading(false);
    }
  }, [entryTypeFilter]);

  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum === 0) {
      alert("Adjustment amount must be a finite, non-zero number.");
      return;
    }

    if (adjustDescription.trim().length < 5) {
      alert("Please provide a description of at least 5 characters.");
      return;
    }

    setActionLoadingId(adjustItem.public_id);
    setError(null);
    setSuccess(null);

    try {
      await adjustCommission(adjustItem.public_id, {
        amount: amountNum,
        currency: adjustItem.currency || "INR",
        description: adjustDescription.trim(),
      });
      setSuccess("Commission adjustment recorded successfully.");
      setAdjustItem(null);
      setAdjustAmount("");
      setAdjustDescription("");
      await loadCommissions();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to record commission adjustment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reverseItem) return;

    if (reverseReason.trim().length < 5) {
      alert("Please provide a reversal reason of at least 5 characters.");
      return;
    }

    setActionLoadingId(reverseItem.public_id);
    setError(null);
    setSuccess(null);

    try {
      await reverseCommission(reverseItem.public_id, {
        reason: reverseReason.trim(),
      });
      setSuccess("Commission reversed successfully.");
      setReverseItem(null);
      setReverseReason("");
      await loadCommissions();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to reverse commission.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCommissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return commissions.filter((c) => {
      if (!q) return true;
      const orderRef = (c.order_number || String(c.order_id) || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const id = (c.public_id || "").toLowerCase();
      return orderRef.includes(q) || desc.includes(q) || id.includes(q);
    });
  }, [commissions, search]);

  const getEntryBadge = (type: string) => {
    switch (type) {
      case "COMMISSION":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Commission</span>
          </span>
        );
      case "REVERSAL":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            <RotateCcw className="w-3 h-3" />
            <span>Reversal</span>
          </span>
        );
      case "ADJUSTMENT":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Adjustment</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-600">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Financial Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B15] tracking-tight">
            Commissions <span className="italic font-light text-[#639E1F]">Audit Desk</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Master double-entry ledger for affiliate commissions, administrative adjustments, and order reversals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/affiliates"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Partner Directory</span>
          </Link>

          <Link
            href="/admin/affiliates/settlements"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5 text-[#639E1F]" />
            <span>Settlement Desk</span>
          </Link>

          <button
            onClick={loadCommissions}
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
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
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
            placeholder="Search by Order #, Description, UUID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {(["ALL", "COMMISSION", "REVERSAL", "ADJUSTMENT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setEntryTypeFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                entryTypeFilter === tab
                  ? "bg-[#2D5A1E] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Synchronizing Ledger...
            </span>
          </div>
        ) : filteredCommissions.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-400 space-y-2">
            <FileText className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No ledger entries found matching this criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Entry Type</th>
                  <th className="px-6 py-4">Partner</th>
                  <th className="px-6 py-4">Order Reference</th>
                  <th className="px-6 py-4">Base Amount</th>
                  <th className="px-6 py-4">Rate (%)</th>
                  <th className="px-6 py-4">Net Amount</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {filteredCommissions.map((c) => {
                  const isNegative = Number(c.amount) < 0;
                  return (
                    <tr key={c.public_id} className="hover:bg-[#FAFAF7]/70">
                      <td className="px-6 py-4 font-sans">{getEntryBadge(c.entry_type)}</td>

                      <td className="px-6 py-4 font-sans font-bold text-[#172B15]">
                        Affiliate #{c.affiliate_id}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-[#172B15] block">
                          {c.order_number || `Order #${c.order_id}`}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-sans block truncate max-w-[140px]">
                          {c.order_public_id || c.public_id}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-neutral-600">
                        ₹{Number(c.base_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4 text-neutral-600">
                        {Number(c.commission_rate)}%
                      </td>

                      <td
                        className={`px-6 py-4 font-bold text-sm ${
                          isNegative ? "text-rose-600" : "text-[#2D5A1E]"
                        }`}
                      >
                        {isNegative ? "-" : "+"}₹
                        {Math.abs(Number(c.amount)).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-6 py-4 text-neutral-500 text-[11px]">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right font-sans space-x-2 whitespace-nowrap">
                        {c.entry_type === "COMMISSION" && (
                          <>
                            <button
                              onClick={() => {
                                setAdjustItem(c);
                                setAdjustAmount("");
                                setAdjustDescription("");
                              }}
                              disabled={actionLoadingId === c.public_id}
                              className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-bold uppercase tracking-wider transition-all border border-amber-200 cursor-pointer shadow-xs"
                            >
                              Adjust
                            </button>
                            <button
                              onClick={() => {
                                setReverseItem(c);
                                setReverseReason("");
                              }}
                              disabled={actionLoadingId === c.public_id}
                              className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 text-[10px] font-bold uppercase tracking-wider transition-all border border-rose-200 cursor-pointer shadow-xs"
                            >
                              Reverse
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#172B15]">
              Adjust Commission #{adjustItem.public_id.slice(0, 8)}
            </h3>
            <p className="text-xs text-neutral-500">
              Post an audited positive or negative adjustment against this original commission entry.
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Adjustment Amount (Signed INR, e.g. -50.00 or 100.00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="-50.00"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl p-2.5 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Audit Description
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={5}
                  placeholder="Reason (e.g. Partial refund on item 2)..."
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl p-2.5 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="flex space-x-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 border rounded-xl text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === adjustItem.public_id}
                  className="px-4 py-2 bg-[#2D5A1E] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1e3c14] disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Record Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reversal Modal */}
      {reverseItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#172B15]">
              Reverse Entire Commission #{reverseItem.public_id.slice(0, 8)}
            </h3>
            <p className="text-xs text-neutral-500">
              Reversing this entry will write a 100% negative reversal entry (-₹{Number(reverseItem.amount).toFixed(2)}) linked to this transaction.
            </p>

            <form onSubmit={handleReverseSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Reason for Reversal
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={5}
                  placeholder="e.g. Customer returned order EMX-4892..."
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl p-2.5 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="flex space-x-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setReverseItem(null)}
                  className="px-4 py-2 border rounded-xl text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === reverseItem.public_id}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}