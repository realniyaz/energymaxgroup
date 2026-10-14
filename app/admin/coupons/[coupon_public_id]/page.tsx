// app/admin/coupons/[coupon_public_id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Edit2,
  X,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  getAdminCouponById,
  getAdminCouponRedemptions,
  activateAdminCoupon,
  deactivateAdminCoupon,
  updateAdminCoupon,
  CouponItem,
  CouponRedemptionItem,
  AllowedDiscountPercent,
  CouponUpdatePayload,
} from "@/lib/services/couponService";

export default function AdminCouponDetailPage() {
  const params = useParams();
  const couponPublicId = params?.coupon_public_id as string;

  const [coupon, setCoupon] = useState<CouponItem | null>(null);
  const [redemptions, setRedemptions] = useState<CouponRedemptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    description: string;
    discount_percent: AllowedDiscountPercent;
    minimum_subtotal: string;
    max_redemptions: string;
    max_redemptions_per_customer: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  }>({
    description: "",
    discount_percent: 10,
    minimum_subtotal: "",
    max_redemptions: "",
    max_redemptions_per_customer: "",
    starts_at: "",
    ends_at: "",
    is_active: true,
  });

  const loadData = async () => {
    if (!couponPublicId) return;
    try {
      setLoading(true);
      setError(null);
      const [c, r] = await Promise.all([
        getAdminCouponById(couponPublicId),
        getAdminCouponRedemptions(couponPublicId),
      ]);
      setCoupon(c);
      setRedemptions(r);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not retrieve coupon details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [couponPublicId]);

  const handleToggleStatus = async () => {
    if (!coupon) return;
    setActionLoading(true);
    try {
      let updated: CouponItem;
      if (coupon.is_active) {
        updated = await deactivateAdminCoupon(coupon.public_id);
      } else {
        updated = await activateAdminCoupon(coupon.public_id);
      }
      setCoupon(updated);
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to update coupon status.");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = () => {
    if (!coupon) return;
    setEditError(null);
    setEditForm({
      description: coupon.description || "",
      discount_percent: coupon.discount_percent,
      minimum_subtotal: coupon.minimum_subtotal ? String(coupon.minimum_subtotal) : "",
      max_redemptions: coupon.max_redemptions ? String(coupon.max_redemptions) : "",
      max_redemptions_per_customer: coupon.max_redemptions_per_customer
        ? String(coupon.max_redemptions_per_customer)
        : "",
      starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 16) : "",
      ends_at: coupon.ends_at ? coupon.ends_at.slice(0, 16) : "",
      is_active: coupon.is_active,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon) return;

    if (editForm.starts_at && editForm.ends_at && new Date(editForm.ends_at) <= new Date(editForm.starts_at)) {
      setEditError("Expiry date must be after the start date.");
      return;
    }

    setEditLoading(true);
    setEditError(null);

    const payload: CouponUpdatePayload = {
      description: editForm.description.trim() || null,
      discount_percent: editForm.discount_percent,
      minimum_subtotal: editForm.minimum_subtotal ? parseFloat(editForm.minimum_subtotal) : null,
      max_redemptions: editForm.max_redemptions ? parseInt(editForm.max_redemptions, 10) : null,
      max_redemptions_per_customer: editForm.max_redemptions_per_customer
        ? parseInt(editForm.max_redemptions_per_customer, 10)
        : null,
      starts_at: editForm.starts_at ? new Date(editForm.starts_at).toISOString() : null,
      ends_at: editForm.ends_at ? new Date(editForm.ends_at).toISOString() : null,
      is_active: editForm.is_active,
    };

    try {
      const updated = await updateAdminCoupon(coupon.public_id, payload);
      setCoupon(updated);
      setIsEditModalOpen(false);
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || "Failed to update coupon.");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Loading campaign audit...
        </span>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || "Coupon record not found."}</span>
        </div>
        <Link
          href="/admin/coupons"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#2D5A1E] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Coupons</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/coupons"
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-[#2D5A1E] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Campaign Audit
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B15]">
              Coupon: <span className="font-mono text-[#2D5A1E]">{coupon.code}</span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={openEditModal}
            className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-[#F2F8ED] text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#2D5A1E]" />
            <span>Edit Parameters</span>
          </button>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer ${
              coupon.is_active
                ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#2D5A1E] hover:bg-[#8CC63F]/30"
            }`}
          >
            {actionLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : coupon.is_active ? (
              <XCircle className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#639E1F]" />
            )}
            <span>{coupon.is_active ? "Deactivate" : "Activate"}</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 shadow-xs cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Discount Value
          </span>
          <h3 className="text-2xl font-bold text-[#172B15]">{coupon.discount_percent}% OFF</h3>
          <p className="text-[11px] text-neutral-500">Order Subtotal Deduction</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Current Status
          </span>
          <div className="flex items-center space-x-1.5 pt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                coupon.is_active ? "bg-[#639E1F]" : "bg-neutral-400"
              }`}
            />
            <h3 className="text-xl font-bold text-[#172B15]">
              {coupon.is_active ? "Active" : "Inactive"}
            </h3>
          </div>
          <p className="text-[11px] text-neutral-500">
            {coupon.is_active ? "Redeemable at checkout" : "Disabled from use"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Completed Orders
          </span>
          <h3 className="text-2xl font-bold text-[#172B15]">
            {redemptions.filter((r) => r.status === "redeemed").length}
          </h3>
          <p className="text-[11px] text-neutral-500">
            Max Limit: {coupon.max_redemptions ?? "Unlimited"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Subtotal Requirement
          </span>
          <h3 className="text-2xl font-bold text-[#172B15]">
            {coupon.minimum_subtotal ? `₹${Number(coupon.minimum_subtotal).toLocaleString("en-IN")}` : "₹0"}
          </h3>
          <p className="text-[11px] text-neutral-500">Minimum basket value</p>
        </div>
      </div>

      {/* Redemptions & Usage Ledger */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#172B15]">Redemptions & Usage Ledger</h2>
            <p className="text-xs text-neutral-500">
              Audit log of active checkout holds (reserved), completed purchases (redeemed), and releases.
            </p>
          </div>
          <span className="text-xs font-bold font-mono px-3 py-1 bg-neutral-100 rounded-xl">
            {redemptions.length} Total Events
          </span>
        </div>

        {redemptions.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            No customer redemptions recorded for this coupon yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Redemption ID</th>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Checkout / Order ID</th>
                  <th className="px-4 py-3">Discount Applied</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Redeemed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#172B15]">#{r.id}</td>
                    <td className="px-4 py-3 text-neutral-700">Cust #{r.customer_id}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      <div>Checkout: #{r.checkout_id}</div>
                      {r.order_id && (
                        <div className="text-[10px] text-[#2D5A1E] font-bold">
                          Order: #{r.order_id}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#2D5A1E]">
                      ₹{Number(r.discount_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          r.status === "redeemed"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "reserved"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-neutral-500">
                      {new Date(r.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-neutral-500">
                      {r.redeemed_at
                        ? new Date(r.redeemed_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Coupon Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/20 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F] block">
                  Update Campaign Parameters
                </span>
                <h3 className="text-lg font-bold text-[#172B15]">
                  Edit Coupon: <span className="font-mono text-[#2D5A1E]">{coupon.code}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Discount Percentage */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Discount Percentage (Allowed: 5% or 10%) *
                </label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[5, 10].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          discount_percent: val as AllowedDiscountPercent,
                        })
                      }
                      className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer border transition-all ${
                        editForm.discount_percent === val
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

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Internal promo notes"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl p-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              {/* Thresholds and Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Min. Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="None"
                    value={editForm.minimum_subtotal}
                    onChange={(e) => setEditForm({ ...editForm, minimum_subtotal: e.target.value })}
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3 py-2 font-mono text-xs text-[#172B15]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={editForm.max_redemptions}
                    onChange={(e) => setEditForm({ ...editForm, max_redemptions: e.target.value })}
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3 py-2 font-mono text-xs text-[#172B15]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Per-Customer Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={editForm.max_redemptions_per_customer}
                    onChange={(e) =>
                      setEditForm({ ...editForm, max_redemptions_per_customer: e.target.value })
                    }
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3 py-2 font-mono text-xs text-[#172B15]"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Starts At
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.starts_at}
                    onChange={(e) => setEditForm({ ...editForm, starts_at: e.target.value })}
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3 py-2 text-xs text-[#172B15]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Ends At
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.ends_at}
                    onChange={(e) => setEditForm({ ...editForm, ends_at: e.target.value })}
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3 py-2 text-xs text-[#172B15]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="modal_is_active_detail"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#2D5A1E] rounded cursor-pointer"
                />
                <label htmlFor="modal_is_active_detail" className="text-xs font-semibold text-[#172B15] cursor-pointer">
                  Coupon is active for customer checkouts
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#172B15] hover:bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Parameters</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}