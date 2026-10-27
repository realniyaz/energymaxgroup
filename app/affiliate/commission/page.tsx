// app/affiliate/commissions/page.tsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Loader2,
  Calendar,
  Layers,
  FileText,
  Percent,
} from "lucide-react";
import { useAffiliateAuth } from "@/context/affiliate-auth-context";
import {
  getAffiliateCommissions,
  CommissionLedgerItem,
} from "@/lib/services/affiliateService";

export default function AffiliateCommissionsPage() {
  const router = useRouter();
  const { affiliate, loading: authLoading } = useAffiliateAuth();

  const [commissions, setCommissions] = useState<CommissionLedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [, startTransition] = useTransition();

  // Selected commission for modal breakdown
  const [activeItem, setActiveItem] = useState<CommissionLedgerItem | null>(null);

  useEffect(() => {
    if (!authLoading && !affiliate) {
      router.replace("/affiliate/login");
    }
  }, [affiliate, authLoading, router]);

  const loadCommissions = async () => {
    if (!affiliate) return;
    setLoading(true);
    setError(null);

    try {
      const typeParam = selectedType === "ALL" ? undefined : selectedType;
      const data = await getAffiliateCommissions(100, 0, typeParam);
      setCommissions(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load commission records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (affiliate) {
      loadCommissions();
    }
  }, [affiliate, selectedType]);

  const filteredCommissions = commissions.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      c.order_number?.toLowerCase().includes(query) ||
      c.order_public_id?.toLowerCase().includes(query) ||
      String(c.order_id).includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.public_id.toLowerCase().includes(query)
    );
  });

  const formatAmount = (val: string | number) => {
    const num = Number(val || 0);
    return `${num < 0 ? "-" : ""}₹${Math.abs(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getEntryBadge = (type: string) => {
    switch (type) {
      case "COMMISSION":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Commission</span>
          </span>
        );
      case "REVERSAL":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <RotateCcw className="w-3 h-3" />
            <span>Reversal</span>
          </span>
        );
      case "ADJUSTMENT":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Adjustment</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-600">
            {type}
          </span>
        );
    }
  };

  if (authLoading || !affiliate) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Verifying Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#2D5A1E]/15 px-6 sm:px-12 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center space-x-4">
          <Link
            href="/affiliate/dashboard"
            className="w-9 h-9 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-all text-[#172B15]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-serif font-bold text-[#172B15]">
              Commission Ledger
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">
              Audit log of all order attributions & reversals
            </p>
          </div>
        </div>

        <Link
          href="/affiliate/wallet"
          className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-[#F2F8ED] border border-[#639E1F]/30 text-[#2D5A1E] hover:bg-[#639E1F]/20 transition-all"
        >
          View Wallet
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-6 sm:p-10 space-y-6">
        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-[#2D5A1E]/15 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Order #, UUID, or Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAFAF7] border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#639E1F] text-[#172B15]"
            />
          </div>

          {/* Type Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto p-1 bg-[#FAFAF7] rounded-2xl border border-neutral-200 shrink-0">
            {["ALL", "COMMISSION", "REVERSAL", "ADJUSTMENT"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedType === type
                    ? "bg-[#2D5A1E] text-white shadow-xs"
                    : "text-neutral-500 hover:text-[#172B15]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-xs text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#2D5A1E]" />
              <span>Fetching ledger records...</span>
            </div>
          ) : filteredCommissions.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Layers className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-[#172B15]">
                No Commission Records Found
              </p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {searchQuery
                  ? "No transactions match your search filter."
                  : "When customer checkouts convert using your referral tracking code, order commissions will be logged here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF7] border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-[9px]">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Order Reference</th>
                    <th className="p-4">Base Amount</th>
                    <th className="p-4">Rate</th>
                    <th className="p-4">Commission</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {filteredCommissions.map((item) => {
                    const isNegative = Number(item.amount) < 0;
                    return (
                      <tr
                        key={item.public_id}
                        className="hover:bg-neutral-50/50 transition-colors"
                      >
                        <td className="p-4">{getEntryBadge(item.entry_type)}</td>
                        <td className="p-4">
                          <span className="font-bold text-[#172B15] block">
                            {item.order_number || `Order #${item.order_id}`}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-sans truncate max-w-[140px] block">
                            {item.order_public_id || item.public_id}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-600">
                          ₹{Number(item.base_amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-neutral-600">
                          {Number(item.commission_rate)}%
                        </td>
                        <td
                          className={`p-4 font-bold ${
                            isNegative ? "text-rose-600" : "text-[#2D5A1E]"
                          }`}
                        >
                          {formatAmount(item.amount)}
                        </td>
                        <td className="p-4 text-neutral-400 text-[11px]">
                          {new Date(item.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setActiveItem(item)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-[#172B15] cursor-pointer"
                            title="Inspect Ledger Entry"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail Breakdown Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F] block">
                  Attribution Audit
                </span>
                <h3 className="text-lg font-serif font-bold text-[#172B15]">
                  Entry Breakdown
                </h3>
              </div>
              {getEntryBadge(activeItem.entry_type)}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-400">Order Number</span>
                <span className="font-mono font-bold text-[#172B15]">
                  {activeItem.order_number || `Order #${activeItem.order_id}`}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-400">Net Eligible Base</span>
                <span className="font-mono font-bold text-[#172B15]">
                  ₹{Number(activeItem.base_amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-400">Commission Rate</span>
                <span className="font-mono font-bold text-[#2D5A1E]">
                  {Number(activeItem.commission_rate)}%
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-400">Net Amount</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    Number(activeItem.amount) < 0
                      ? "text-rose-600"
                      : "text-[#2D5A1E]"
                  }`}
                >
                  {formatAmount(activeItem.amount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-400">Ledger Entry ID</span>
                <span className="font-mono text-[10px] text-neutral-600 select-all">
                  {activeItem.public_id}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-400">Recorded At</span>
                <span className="font-mono text-neutral-600">
                  {new Date(activeItem.created_at).toLocaleString("en-IN")}
                </span>
              </div>

              {activeItem.description && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Audit Description
                  </span>
                  <p className="p-3 bg-[#FAFAF7] rounded-xl border border-neutral-200 text-neutral-600 leading-relaxed font-sans text-xs">
                    {activeItem.description}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="w-full py-3 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all cursor-pointer shadow-xs"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}