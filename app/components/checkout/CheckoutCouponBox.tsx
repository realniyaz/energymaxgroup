// components/checkout/CheckoutCouponBox.tsx
"use client";

import React, { useState } from "react";
import { Tag, Check, Loader2, AlertCircle } from "lucide-react";
import {
  applyCheckoutCoupon,
  removeCheckoutCoupon,
  CouponApplyResponse,
} from "@/lib/services/couponService";

interface CheckoutCouponBoxProps {
  checkoutPublicId: string;
  currentCouponCode?: string | null;
  discountPercent?: number | null;
  onCouponUpdated: (updated: CouponApplyResponse) => void;
}

export default function CheckoutCouponBox({
  checkoutPublicId,
  currentCouponCode,
  discountPercent,
  onCouponUpdated,
}: CheckoutCouponBoxProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setError(null);
    setLoading(true);
    try {
      const res = await applyCheckoutCoupon(checkoutPublicId, cleanCode);
      onCouponUpdated(res);
      setCode("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Invalid or ineligible coupon code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await removeCheckoutCoupon(checkoutPublicId);
      onCouponUpdated(res);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Failed to remove coupon code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#FAFAF7] rounded-2xl border border-[#2D5A1E]/15 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#172B15]">
        <div className="flex items-center space-x-1.5">
          <Tag className="w-3.5 h-3.5 text-[#639E1F]" />
          <span>Apply Coupon</span>
        </div>
      </div>

      {currentCouponCode ? (
        <div className="p-2.5 bg-[#F2F8ED] border border-[#8CC63F]/40 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-[#2D5A1E]" />
            <span className="font-mono font-bold text-xs text-[#2D5A1E]">
              {currentCouponCode}
            </span>
            {discountPercent && (
              <span className="text-[10px] font-bold text-[#639E1F] bg-white px-1.5 py-0.5 rounded-md border border-[#8CC63F]/30">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="text-[10px] font-bold text-red-600 hover:underline uppercase cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Remove"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex items-center space-x-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code (e.g. 5% or 10%)"
            className="flex-1 bg-white border border-[#2D5A1E]/20 rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-wider text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] uppercase"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-4 py-2 bg-[#172B15] hover:bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 cursor-pointer flex items-center space-x-1 shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Apply</span>
            )}
          </button>
        </form>
      )}

      {error && (
        <div className="text-[11px] text-red-600 flex items-center space-x-1 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}