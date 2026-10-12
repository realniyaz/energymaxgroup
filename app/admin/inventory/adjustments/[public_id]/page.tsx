// app/admin/inventory/adjustments/[public_id]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  Package,
  Calendar,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import {
  getAdminStockAdjustment,
  StockAdjustmentItem,
} from "@/lib/services/adminAdjustmentService";

export default function StockAdjustmentDetailPage({
  params,
}: {
  params: Promise<{ public_id: string }>;
}) {
  const resolvedParams = use(params);
  const publicId = resolvedParams.public_id;

  const [adjustment, setAdjustment] = useState<StockAdjustmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdjustment() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminStockAdjustment(publicId);
        setAdjustment(data);
      } catch (err: any) {
        const detail = err.response?.data?.detail;
        setError(
          typeof detail === "string"
            ? detail
            : "Failed to load adjustment record details."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAdjustment();
  }, [publicId]);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Inspecting Adjustment Ledger...
        </span>
      </div>
    );
  }

  if (error || !adjustment) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-xs text-neutral-500 font-bold">
          {error || "Stock adjustment record not found."}
        </p>
        <Link
          href="/admin/inventory/adjustments"
          className="text-xs font-bold text-[#639E1F] hover:underline"
        >
          Return to Adjustments Desk
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <div>
          <Link
            href="/admin/inventory/adjustments"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Adjustments Ledger</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-[#172B15]">
              Adjustment Record
            </h1>
            {adjustment.adjustment_type === "INCREASE" ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quantity Increase</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-800 border border-red-200">
                <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                <span>Quantity Decrease</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Snapshot & Reason */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-[#172B15]">
                  Balance Quantity Transition
                </h2>
                <p className="text-xs text-neutral-500">
                  Audit snapshot recorded when adjustment was committed.
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#639E1F]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Stock Before
                </span>
                <span className="font-mono text-xl font-bold text-[#172B15]">
                  {Number(adjustment.before_quantity).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Delta Applied
                </span>
                <span className="font-mono text-xl font-bold text-[#2D5A1E]">
                  {adjustment.adjustment_type === "INCREASE" ? "+" : "-"}
                  {Number(adjustment.quantity).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#8CC63F]/10 border border-[#8CC63F]/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A1E] block">
                  Stock After
                </span>
                <span className="font-mono text-xl font-bold text-[#172B15]">
                  {Number(adjustment.after_quantity).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-3">
            <h2 className="text-base font-serif font-bold text-[#172B15]">
              Documented Reason
            </h2>
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 text-xs text-[#172B15] leading-relaxed">
              {adjustment.reason}
            </div>
          </div>
        </div>

        {/* Right Column: References & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#172B15]">
              System Identifiers
            </h3>
            <div className="text-xs space-y-2 border-t border-neutral-100 pt-3">
              <div className="flex justify-between">
                <span className="text-neutral-500">Warehouse ID</span>
                <span className="font-mono font-bold text-[#172B15]">{adjustment.warehouse_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Variant ID</span>
                <span className="font-mono font-bold text-[#172B15]">{adjustment.variant_id}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-neutral-500">Public UUID</span>
                <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[140px]">
                  {adjustment.public_id}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-3 text-xs text-neutral-600">
            <div className="flex items-center space-x-2 text-[#172B15] font-serif font-bold mb-1">
              <Calendar className="w-4 h-4 text-[#639E1F]" />
              <span>Timestamp Metadata</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2">
              <span className="text-neutral-500">Recorded At</span>
              <span className="font-mono text-neutral-800">
                {new Date(adjustment.created_at).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}