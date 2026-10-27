// app/affiliate/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAffiliateAuth } from "@/context/affiliate-auth-context";
import {
  getAffiliateDashboard,
  getAffiliatePerformance,
  DashboardResponse,
  AffiliatePerformanceResponse,
} from "@/lib/services/affiliateService";
import {
  Copy,
  Check,
  LogOut,
  Sparkles,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  Wallet,
  ArrowRight,
  ExternalLink,
  Loader2,
  Calendar,
} from "lucide-react";

export default function AffiliateDashboard() {
  const { affiliate, logout } = useAffiliateAuth();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [performanceData, setPerformanceData] = useState<AffiliatePerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startDateStr = thirtyDaysAgo.toISOString().split("T")[0];
        const endDateStr = today.toISOString().split("T")[0];

        const [dash, perf] = await Promise.all([
          getAffiliateDashboard().catch(() => null),
          getAffiliatePerformance(startDateStr, endDateStr).catch(() => null),
        ]);

        setDashboardData(dash);
        setPerformanceData(perf);
      } finally {
        setLoading(false);
      }
    }

    if (affiliate) {
      loadData();
    }
  }, [affiliate]);

  if (!affiliate) {
    return null;
  }

  // Uses the backend tracked redirect entrypoint
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://energymax-backend.onrender.com";
  const referralTrackingLink = `${backendBaseUrl}/api/v1/affiliates/r/${affiliate.public_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralTrackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const primaryEarnings = dashboardData?.commissions?.earnings_by_currency?.[0];
  const netEarningsAmount = primaryEarnings
    ? Number(primaryEarnings.net_earnings).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] flex flex-col justify-between font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#2D5A1E]/15 px-6 sm:px-12 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Image src="/logo1.png" alt="EnergyMax Logo" width={32} height={32} />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#172B15] block">
              EnergyMax Partner Portal
            </span>
            <span className="text-[10px] text-neutral-400">
              Logged in as {affiliate.full_name}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/affiliate/wallet"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F2F8ED] border border-[#639E1F]/30 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#639E1F]/20 transition-all"
          >
            <Wallet className="w-4 h-4 text-[#639E1F]" />
            <span>Wallet & Payouts</span>
          </Link>
          <button
            onClick={logout}
            className="text-xs font-semibold text-neutral-400 hover:text-red-600 flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Command Center */}
      <main className="max-w-6xl mx-auto w-full p-6 sm:p-10 space-y-8 flex-1">
        
        {/* Referral Tracking Showcase Banner */}
        <div className="bg-[#172B15] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#8CC63F]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#8CC63F]/20 text-[#8CC63F] text-[9px] font-bold uppercase tracking-widest mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Verified Referral Code</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-mono font-bold tracking-wider text-white">
                {affiliate.public_code}
              </h2>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#8CC63F] text-[#172B15] font-bold text-xs uppercase tracking-wider hover:bg-[#7db435] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tracking Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Partner Referral Link</span>
                </>
              )}
            </button>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-300">
            <span className="font-mono text-[11px] break-all select-all text-neutral-300">
              {referralTrackingLink}
            </span>
            <span className="text-[10px] text-[#8CC63F] uppercase tracking-wider font-semibold">
              Status: {affiliate.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Real-time Telemetry Metrics */}
        {loading ? (
          <div className="py-12 flex justify-center items-center space-x-2 text-xs text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#2D5A1E]" />
            <span>Loading telemetry metrics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Clicks */}
            <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center text-[#2D5A1E]">
                <MousePointerClick className="w-5 h-5 text-[#639E1F]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Total Referral Clicks
                </span>
                <h3 className="text-2xl font-mono font-bold text-[#172B15] mt-0.5">
                  {dashboardData?.performance?.total_clicks ?? 0}
                </h3>
              </div>
            </div>

            {/* Attributed Orders */}
            <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center text-[#2D5A1E]">
                <ShoppingBag className="w-5 h-5 text-[#639E1F]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Attributed Orders
                </span>
                <h3 className="text-2xl font-mono font-bold text-[#172B15] mt-0.5">
                  {dashboardData?.performance?.total_attributed_orders ?? 0}
                </h3>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center text-[#2D5A1E]">
                <TrendingUp className="w-5 h-5 text-[#639E1F]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Click-to-Order Rate
                </span>
                <h3 className="text-2xl font-mono font-bold text-[#172B15] mt-0.5">
                  {dashboardData?.performance?.click_to_order_rate_percent ?? 0}%
                </h3>
              </div>
            </div>

            {/* Net Earnings */}
            <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/20 flex items-center justify-center text-[#2D5A1E]">
                    <Wallet className="w-5 h-5 text-[#2D5A1E]" />
                  </div>
                  <Link
                    href="/affiliate/wallet"
                    className="text-[10px] font-bold text-[#639E1F] hover:underline flex items-center space-x-1"
                  >
                    <span>Wallet</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mt-3">
                  Net Earnings Accrued
                </span>
                <h3 className="text-2xl font-mono font-bold text-[#172B15] mt-0.5">
                  ₹{netEarningsAmount}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* 30-Day Conversion Daily History Table */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#172B15]">
                Recent 30-Day Activity Breakdown
              </h3>
              <p className="text-xs text-neutral-400">
                Track visitor impressions, attribution rate, and daily conversions.
              </p>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs text-neutral-500 font-mono">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Rolling 30 Days</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="p-4">Calendar Date</th>
                  <th className="p-4">Referral Clicks</th>
                  <th className="p-4">Attributed Orders</th>
                  <th className="p-4">Daily Conversion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {performanceData?.daily && performanceData.daily.length > 0 ? (
                  performanceData.daily
                    .filter((day) => day.clicks > 0 || day.attributed_orders > 0)
                    .slice(0, 10)
                    .map((item) => (
                      <tr key={item.date} className="hover:bg-neutral-50/50">
                        <td className="p-4 text-neutral-600">{item.date}</td>
                        <td className="p-4 font-bold text-[#172B15]">{item.clicks}</td>
                        <td className="p-4 font-bold text-[#2D5A1E]">{item.attributed_orders}</td>
                        <td className="p-4 text-neutral-600">
                          {item.click_to_order_rate_percent}%
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-400 font-sans">
                      No conversions or clicks registered in the current window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profile Card & Storefront Handoff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A1E]">
              Account Profile
            </h3>
            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-400">Partner Name</span>
                <span className="font-semibold text-[#172B15]">{affiliate.full_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-400">Email Address</span>
                <span className="font-semibold text-[#172B15]">{affiliate.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-400">Registered Phone</span>
                <span className="font-semibold text-[#172B15]">{affiliate.phone || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-400">Activation Date</span>
                <span className="font-semibold text-[#172B15]">
                  {affiliate.activated_at
                    ? new Date(affiliate.activated_at).toLocaleDateString()
                    : "Active"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A1E]">
                Storefront Preview
              </h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Test your partner link tracking before sharing with your audience. When visitors land on our boutique via your code, the attribution cookie persists for 30 days.
              </p>
            </div>

            <a
              href={referralTrackingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] font-semibold hover:border-[#639E1F] transition-all"
            >
              <span>Test Click Tracking on Storefront</span>
              <ExternalLink className="w-4 h-4 text-neutral-400" />
            </a>
          </div>
        </div>

      </main>

      <footer className="text-center py-6 text-[10px] text-neutral-400 uppercase tracking-widest border-t border-[#2D5A1E]/10">
        EnergyMax Cellular Health Partner Ecosystem
      </footer>
    </div>
  );
}