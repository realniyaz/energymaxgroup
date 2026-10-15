// app/admin/analytics/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Loader2,
  AlertTriangle,
  IndianRupee,
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  RotateCcw,
  Percent,
} from "lucide-react";
import {
  getAdminAnalyticsOverview,
  AnalyticsOverviewResponse,
  calculateDelta,
} from "@/lib/services/adminAnalyticsService";

type PresetRange = "today" | "7d" | "30d" | "month" | "custom";

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AdminAnalyticsPage() {
  const [preset, setPreset] = useState<PresetRange>("30d");
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return formatDate(d);
  });
  const [endDate, setEndDate] = useState<string>(() => formatDate(new Date()));

  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (start: string, end: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminAnalyticsOverview({
        start_date: start,
        end_date: end,
      });
      setData(res);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Failed to load analytics overview."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(startDate, endDate);
  }, [fetchAnalytics, startDate, endDate]);

  const handlePresetSelect = (selectedPreset: PresetRange) => {
    setPreset(selectedPreset);
    const now = new Date();
    let start = new Date();

    if (selectedPreset === "today") {
      start = new Date();
    } else if (selectedPreset === "7d") {
      start.setDate(now.getDate() - 6);
    } else if (selectedPreset === "30d") {
      start.setDate(now.getDate() - 29);
    } else if (selectedPreset === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      return;
    }

    const startStr = formatDate(start);
    const endStr = formatDate(now);
    setStartDate(startStr);
    setEndDate(endStr);
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }
    setPreset("custom");
    fetchAnalytics(startDate, endDate);
  };

  // Delta calculations
  const grossDelta = data
    ? calculateDelta(data.current.gross_revenue, data.previous.gross_revenue)
    : null;
  const netDelta = data
    ? calculateDelta(data.current.net_revenue, data.previous.net_revenue)
    : null;
  const ordersDelta = data
    ? calculateDelta(data.current.orders, data.previous.orders)
    : null;
  const aovDelta = data
    ? calculateDelta(data.current.average_order_value, data.previous.average_order_value)
    : null;
  const refundsDelta = data
    ? calculateDelta(data.current.refunds, data.previous.refunds)
    : null;

  return (
    <div className="w-full space-y-8 pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F]">
              Executive Business Intelligence
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#8CC63F]/20 text-[#2D5A1E]">
              <ShieldCheck className="w-3 h-3" />
              <span>Permission: analytics.view</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-light text-[#172B15] tracking-tight">
            Financial & Sales <span className="font-serif italic text-[#639E1F]">Analytics</span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-white border border-[#2D5A1E]/20 p-1 shadow-xs text-xs font-bold uppercase tracking-wider">
            {(["today", "7d", "30d", "month"] as PresetRange[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePresetSelect(p)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  preset === p
                    ? "bg-[#172B15] text-white shadow-xs"
                    : "text-neutral-500 hover:text-[#172B15]"
                }`}
              >
                {p === "today" ? "Today" : p === "7d" ? "7D" : p === "30d" ? "30D" : "This Month"}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(startDate, endDate)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Date Range Picker Bar */}
      <form
        onSubmit={handleCustomDateSubmit}
        className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-xs flex flex-wrap items-center gap-4 text-xs"
      >
        <div className="flex items-center space-x-2 text-[#2D5A1E] font-bold">
          <Calendar className="w-4 h-4" />
          <span className="uppercase tracking-wider text-[11px]">Audit Window:</span>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-[10px] uppercase font-bold text-neutral-400">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPreset("custom");
            }}
            className="px-3 py-1.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/20 text-[#172B15] text-xs font-mono focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-[10px] uppercase font-bold text-neutral-400">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPreset("custom");
            }}
            className="px-3 py-1.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/20 text-[#172B15] text-xs font-mono focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 rounded-xl bg-[#2D5A1E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#234717] transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          Apply Custom Dates
        </button>

        <span className="text-[11px] text-neutral-400 ml-auto">
          Comparative baseline is automatically computed by backend based on period length.
        </span>
      </form>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-xs">
          <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Evaluating comparative ledger window...
          </p>
        </div>
      )}

      {/* Main KPI Matrix */}
      {!loading && data && (
        <div className="space-y-8">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Gross Revenue */}
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#2D5A1E]/10 flex items-center justify-center text-[#2D5A1E]">
                  <IndianRupee className="w-5 h-5" />
                </div>
                {grossDelta && (
                  <span
                    className={`inline-flex items-center space-x-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                      grossDelta.isPositive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {grossDelta.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{grossDelta.deltaPercent}%</span>
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Gross Revenue
                </span>
                <h3 className="text-3xl font-serif text-[#172B15] font-medium pt-1">
                  ₹{Number(data.current.gross_revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Prior Period:</span>
                <span className="font-mono font-medium">
                  ₹{Number(data.previous.gross_revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Net Revenue */}
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/15 flex items-center justify-center text-[#2D5A1E]">
                  <Receipt className="w-5 h-5" />
                </div>
                {netDelta && (
                  <span
                    className={`inline-flex items-center space-x-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                      netDelta.isPositive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {netDelta.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{netDelta.deltaPercent}%</span>
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Net Revenue (Collected)
                </span>
                <h3 className="text-3xl font-serif text-[#172B15] font-medium pt-1">
                  ₹{Number(data.current.net_revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Gross minus Refunds:</span>
                <span className="font-mono text-[#2D5A1E] font-semibold">
                  -₹{Number(data.current.refunds).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Total Orders Volume */}
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#2D5A1E]/10 flex items-center justify-center text-[#2D5A1E]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                {ordersDelta && (
                  <span
                    className={`inline-flex items-center space-x-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                      ordersDelta.isPositive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {ordersDelta.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{ordersDelta.deltaPercent}%</span>
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Completed Orders
                </span>
                <h3 className="text-3xl font-serif text-[#172B15] font-medium pt-1">
                  {data.current.orders}
                </h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Prior Period Volume:</span>
                <span className="font-mono font-medium">{data.previous.orders}</span>
              </div>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <Percent className="w-5 h-5 text-amber-600" />
                </div>
                {aovDelta && (
                  <span
                    className={`inline-flex items-center space-x-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                      aovDelta.isPositive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {aovDelta.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{aovDelta.deltaPercent}%</span>
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Average Order Value (AOV)
                </span>
                <h3 className="text-3xl font-serif text-[#172B15] font-medium pt-1">
                  ₹{Number(data.current.average_order_value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Prior AOV:</span>
                <span className="font-mono font-medium">
                  ₹{Number(data.previous.average_order_value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Comparative Ledger Table */}
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-light text-[#172B15]">Period Comparative Breakdown</h3>
                <p className="text-xs text-neutral-500">
                  Direct telemetry evaluation between active window and prior comparative window.
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E] hover:underline flex items-center space-x-1"
              >
                <span>Inspect Orders Desk</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    <th className="pb-3 px-4">Financial Metric</th>
                    <th className="pb-3 px-4">Current Period</th>
                    <th className="pb-3 px-4">Previous Period</th>
                    <th className="pb-3 px-4">Net Variance</th>
                    <th className="pb-3 px-4 text-right">Performance Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  <tr className="hover:bg-[#F2F8ED]/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#172B15]">Gross Revenue</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#172B15]">
                      ₹{Number(data.current.gross_revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono text-neutral-500">
                      ₹{Number(data.previous.gross_revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      ₹{(Number(data.current.gross_revenue) - Number(data.previous.gross_revenue)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {grossDelta && (
                        <span className={`font-mono font-bold ${grossDelta.isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                          {grossDelta.isPositive ? "+" : "-"}{grossDelta.deltaPercent}%
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F2F8ED]/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#172B15]">Net Revenue</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#2D5A1E]">
                      ₹{Number(data.current.net_revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono text-neutral-500">
                      ₹{Number(data.previous.net_revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      ₹{(Number(data.current.net_revenue) - Number(data.previous.net_revenue)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {netDelta && (
                        <span className={`font-mono font-bold ${netDelta.isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                          {netDelta.isPositive ? "+" : "-"}{netDelta.deltaPercent}%
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F2F8ED]/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#172B15]">Gross Order Book Value</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#172B15]">
                      ₹{Number(data.current.order_value_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono text-neutral-500">
                      ₹{Number(data.previous.order_value_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      ₹{(Number(data.current.order_value_total) - Number(data.previous.order_value_total)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-neutral-400">Order Totals</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F2F8ED]/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-rose-700 flex items-center space-x-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Refunds & Deductions</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-rose-700">
                      ₹{Number(data.current.refunds).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono text-neutral-500">
                      ₹{Number(data.previous.refunds).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono text-rose-700">
                      ₹{(Number(data.current.refunds) - Number(data.previous.refunds)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {refundsDelta && (
                        <span className="font-mono font-bold text-rose-700">
                          {refundsDelta.isPositive ? "+" : "-"}{refundsDelta.deltaPercent}%
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F2F8ED]/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#172B15]">Total Completed Orders</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#172B15]">
                      {data.current.orders}
                    </td>
                    <td className="py-4 px-4 font-mono text-neutral-500">
                      {data.previous.orders}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {data.current.orders - data.previous.orders}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {ordersDelta && (
                        <span className={`font-mono font-bold ${ordersDelta.isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                          {ordersDelta.isPositive ? "+" : "-"}{ordersDelta.deltaPercent}%
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F2F8ED]/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#172B15]">Average Order Value (AOV)</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#172B15]">
                      ₹{Number(data.current.average_order_value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono text-neutral-500">
                      ₹{Number(data.previous.average_order_value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      ₹{(Number(data.current.average_order_value) - Number(data.previous.average_order_value)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {aovDelta && (
                        <span className={`font-mono font-bold ${aovDelta.isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                          {aovDelta.isPositive ? "+" : "-"}{aovDelta.deltaPercent}%
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}