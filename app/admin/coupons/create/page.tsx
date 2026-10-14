// app/admin/coupons/create/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag, Check, AlertCircle, Loader2 } from "lucide-react";
import { createAdminCoupon, AllowedDiscountPercent } from "@/lib/services/couponService";

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    code: string;
    description: string;
    discount_percent: AllowedDiscountPercent;
    minimum_subtotal: string;
    max_redemptions: string;
    max_redemptions_per_customer: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  }>({
    code: "",
    description: "",
    discount_percent: 10, // Default to 10%
    minimum_subtotal: "",
    max_redemptions: "",
    max_redemptions_per_customer: "1",
    starts_at: "",
    ends_at: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation matching backend
    if (!/^[A-Za-z0-9_-]+$/.test(form.code.trim())) {
      setError("Coupon code can only contain letters, numbers, hyphens, and underscores.");
      return;
    }

    if (form.starts_at && form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)) {
      setError("Expiry date (ends_at) must be after start date.");
      return;
    }

    setLoading(true);
    try {
      await createAdminCoupon({
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discount_percent: form.discount_percent,
        minimum_subtotal: form.minimum_subtotal ? parseFloat(form.minimum_subtotal) : null,
        max_redemptions: form.max_redemptions ? parseInt(form.max_redemptions, 10) : null,
        max_redemptions_per_customer: form.max_redemptions_per_customer
          ? parseInt(form.max_redemptions_per_customer, 10)
          : null,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        is_active: form.is_active,
      });
      router.push("/admin/coupons");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create coupon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center space-x-3 border-b border-[#2D5A1E]/15 pb-4">
        <Link
          href="/admin/coupons"
          className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-[#2D5A1E]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Campaign Setup
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B15]">
            Create Promotional Coupon
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Code & Discount Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Coupon Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VITALITY10, ENERGY5"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-3 font-mono font-bold text-sm tracking-wider text-[#172B15] focus:outline-none focus:border-[#639E1F]"
            />
            <p className="text-[10px] text-neutral-400">
              A-Z, 0-9, hyphens, and underscores only.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Discount Percentage (Backend Rule: 5% or 10%) *
            </label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[5, 10].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setForm({ ...form, discount_percent: val as AllowedDiscountPercent })}
                  className={`py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer border transition-all ${
                    form.discount_percent === val
                      ? "bg-[#2D5A1E] text-white border-[#2D5A1E] shadow-sm"
                      : "bg-[#FAFAF7] text-neutral-700 border-neutral-200 hover:border-[#639E1F]"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{val}% Discount</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Exclusive launch incentive for first-time orders"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl p-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        {/* Financial & Limits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-100">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Min. Order Subtotal (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 999"
              value={form.minimum_subtotal}
              onChange={(e) => setForm({ ...form, minimum_subtotal: e.target.value })}
              className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-2.5 font-mono text-xs text-[#172B15]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Total Redemptions Limit
            </label>
            <input
              type="number"
              min="1"
              placeholder="Unlimited (Leave blank)"
              value={form.max_redemptions}
              onChange={(e) => setForm({ ...form, max_redemptions: e.target.value })}
              className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-2.5 font-mono text-xs text-[#172B15]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Per-Customer Limit
            </label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={form.max_redemptions_per_customer}
              onChange={(e) => setForm({ ...form, max_redemptions_per_customer: e.target.value })}
              className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-2.5 font-mono text-xs text-[#172B15]"
            />
          </div>
        </div>

        {/* Schedule & Active */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Valid From
            </label>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-2.5 text-xs text-[#172B15]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Valid Until
            </label>
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-2.5 text-xs text-[#172B15]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 accent-[#2D5A1E] rounded cursor-pointer"
          />
          <label htmlFor="is_active" className="text-xs font-semibold text-[#172B15] cursor-pointer">
            Activate this coupon immediately upon creation
          </label>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
          <Link
            href="/admin/coupons"
            className="px-5 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold uppercase tracking-wider"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-[#172B15] hover:bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center space-x-2 shadow-sm cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save & Deploy Coupon</span>
          </button>
        </div>
      </form>
    </div>
  );
}