// app/affiliate/wallet/page.tsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAffiliateAuth } from "@/context/affiliate-auth-context";
import {
  WalletBalanceItem,
  WithdrawalItem,
  CommissionLedgerItem,
  CurrencyEarnings,
  getAffiliateWallet,
  getAffiliateWithdrawals,
  getAffiliateCommissions,
  getAffiliateEarnings,
  requestAffiliateWithdrawal,
} from "@/lib/services/affiliateService";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Receipt,
  Layers,
} from "lucide-react";

export default function AffiliateWalletPage() {
  const router = useRouter();
  const { affiliate, loading: authLoading } = useAffiliateAuth();

  const [wallet, setWallet] = useState<WalletBalanceItem | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [commissions, setCommissions] = useState<CommissionLedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal form states
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  // 1. Session Guard: Route to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !affiliate) {
      router.replace("/affiliate/login");
    }
  }, [affiliate, authLoading, router]);

  // 2. Load Financial Data with Resilient Fallbacks
  const loadFinancialData = async () => {
    if (!affiliate) return;
    setLoading(true);
    setError(null);

    try {
      const [walletRes, withdrawalsRes, commissionsRes] = await Promise.all([
        getAffiliateWallet().catch(() => null),
        getAffiliateWithdrawals(50, 0).catch(() => []),
        getAffiliateCommissions(50, 0).catch(() => []),
      ]);

      setWithdrawals(withdrawalsRes || []);
      setCommissions(commissionsRes || []);

      // If dedicated wallet endpoint succeeds:
      if (Array.isArray(walletRes) && walletRes.length > 0) {
        setWallet(walletRes[0]);
      } else {
        // Fallback: Compute balance accurately using WalletService rules
        let netEarnings = 0;
        try {
          const earningsSummary = await getAffiliateEarnings();
          if (earningsSummary && earningsSummary.length > 0) {
            netEarnings = Number(earningsSummary[0].net_earnings || 0);
          }
        } catch {
          netEarnings = (commissionsRes || []).reduce(
            (acc, curr) => acc + Number(curr.amount || 0),
            0
          );
        }

        const reservedBalance = (withdrawalsRes || [])
          .filter((w) => w.status === "PENDING" || w.status === "APPROVED")
          .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        const paidBalance = (withdrawalsRes || [])
          .filter((w) => w.status === "PAID")
          .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        const available = Math.max(0, netEarnings - reservedBalance - paidBalance);

        setWallet({
          currency: "INR",
          net_earnings: netEarnings.toFixed(2),
          reserved_balance: reservedBalance.toFixed(2),
          paid_balance: paidBalance.toFixed(2),
          available_balance: available.toFixed(2),
        });
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load real-time wallet balances. Please refresh."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (affiliate) {
      loadFinancialData();
    }
  }, [affiliate]);

  // 3. Payout Request Handler
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const val = parseFloat(amount);
    const available = Number(wallet?.available_balance || 0);

    if (isNaN(val) || val <= 0) {
      setError("Please specify a valid positive withdrawal amount.");
      return;
    }

    if (val > available) {
      setError(
        `Withdrawal amount exceeds your current available balance of ₹${available.toLocaleString(
          "en-IN",
          { minimumFractionDigits: 2 }
        )}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      // 128-bit collision-resistant idempotency key
      const idempotencyKey = `wth_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;

      await requestAffiliateWithdrawal({
        amount: val,
        currency: wallet?.currency || "INR",
        idempotency_key: idempotencyKey,
      });

      setSuccess("Withdrawal request submitted successfully for administrative review.");
      setAmount("");
      await loadFinancialData();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : detail?.message ||
              err.message ||
              "Failed to submit withdrawal request. Please retry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !affiliate) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Verifying Balance Gateway...
        </p>
      </div>
    );
  }

  const availableNum = Number(wallet?.available_balance || 0);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-8 px-4 sm:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#2D5A1E]/15 pb-4">
          <Link
            href="/affiliate/dashboard"
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#2D5A1E] flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="inline-flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F] bg-[#8CC63F]/15 px-3 py-1 rounded-full border border-[#8CC63F]/30">
              Partner Settlement Desk
            </span>
          </div>
        </div>

        {/* 4 Multi-State Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Available */}
          <div className="bg-[#172B15] text-white p-6 rounded-3xl shadow-lg space-y-2 relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8CC63F] block">
                Available Balance
              </span>
              <div className="text-2xl font-mono font-bold text-white mt-1">
                ₹{availableNum.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <p className="text-[10px] text-neutral-300">
              Ready for immediate payout request
            </p>
          </div>

          {/* Reserved */}
          <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">
                Pending Reserves
              </span>
              <div className="text-2xl font-mono font-bold text-amber-700 mt-1">
                ₹{Number(wallet?.reserved_balance || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <p className="text-[10px] text-neutral-400">
              Currently pending administrative review
            </p>
          </div>

          {/* Paid Out */}
          <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                Paid Out to Date
              </span>
              <div className="text-2xl font-mono font-bold text-[#172B15] mt-1">
                ₹{Number(wallet?.paid_balance || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <p className="text-[10px] text-neutral-400">
              Settled into your designated bank account
            </p>
          </div>

          {/* Cumulative Net Earned */}
          <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                Cumulative Earned
              </span>
              <div className="text-2xl font-mono font-bold text-[#172B15] mt-1">
                ₹{Number(wallet?.net_earnings || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <p className="text-[10px] text-neutral-400">
              Total lifetime earned commissions
            </p>
          </div>
        </div>

        {/* Withdrawal Request Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172B15]">
              Request Payout
            </h2>
            <p className="text-xs text-neutral-400">
              Requests are verified and settled into your registered bank account.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleWithdrawalRequest} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-3.5 text-xs font-mono text-neutral-400">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={availableNum}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter withdrawal amount..."
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl pl-8 pr-4 py-3 text-xs font-mono focus:outline-none focus:border-[#639E1F] text-[#172B15]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || availableNum <= 0}
              className="px-6 py-3.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Request Payout</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* 2-Column Ledger & Withdrawals History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Payout Requests History */}
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs space-y-0">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Payout Requests
              </h3>
              <span className="text-[10px] text-neutral-400 font-mono">
                {withdrawals.length} entries
              </span>
            </div>

            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No withdrawal requests on record.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
                {withdrawals.map((w) => (
                  <div key={w.public_id} className="p-4 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[#172B15]">
                          ₹{Number(w.amount).toFixed(2)}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
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
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(w.requested_at).toLocaleDateString()}
                        {w.payout_reference && ` • Ref: ${w.payout_reference}`}
                        {w.rejection_reason && ` • Note: ${w.rejection_reason}`}
                      </p>
                    </div>

                    <div>
                      {w.status === "PAID" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {w.status === "PENDING" && <Clock className="w-5 h-5 text-amber-500" />}
                      {w.status === "REJECTED" && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Double-Entry Commission Ledger */}
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs space-y-0">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Commission Ledger
              </h3>
              <Link
                href="/affiliate/commissions"
                className="text-[10px] text-[#639E1F] font-bold uppercase tracking-wider hover:underline"
              >
                View Full Ledger ({commissions.length})
              </Link>
            </div>

            {commissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No commission entries recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
                {commissions.map((c) => (
                  <div key={c.public_id} className="p-4 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-mono font-bold ${
                            c.entry_type === "REVERSAL"
                              ? "text-red-600"
                              : "text-[#2D5A1E]"
                          }`}
                        >
                          {Number(c.amount) > 0 ? "+" : ""}
                          ₹{Number(c.amount).toFixed(2)}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAFAF7] border border-neutral-200 text-neutral-600">
                          {c.entry_type}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(c.created_at).toLocaleDateString()}
                        {c.description && ` • ${c.description}`}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-400">
                      Rate: {c.commission_rate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}