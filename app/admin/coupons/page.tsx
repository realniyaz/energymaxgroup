// app/admin/coupons/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  AlertCircle,
  Loader2,
  X,
  Check,
} from "lucide-react";
import {
  getAdminCoupons,
  activateAdminCoupon,
  deactivateAdminCoupon,
  updateAdminCoupon,
  CouponItem,
  AllowedDiscountPercent,
  CouponUpdatePayload,
} from "@/lib/services/couponService";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
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

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCoupons();
      setCoupons(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load coupons list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon: CouponItem) => {
    setActionLoadingId(coupon.public_id);
    try {
      let updated: CouponItem;
      if (coupon.is_active) {
        updated = await deactivateAdminCoupon(coupon.public_id);
      } else {
        updated = await activateAdminCoupon(coupon.public_id);
      }
      setCoupons((prev) =>
        prev.map((c) => (c.public_id === coupon.public_id ? updated : c))
      );
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to update coupon status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
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
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    if (editForm.starts_at && editForm.ends_at && new Date(editForm.ends_at) <= new Date(editForm.starts_at)) {
      setEditError("Expiry date must be later than start date.");
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
      const updated = await updateAdminCoupon(editingCoupon.public_id, payload);
      setCoupons((prev) =>
        prev.map((c) => (c.public_id === updated.public_id ? updated : c))
      );
      setEditingCoupon(null);
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || "Failed to update coupon.");
    } finally {
      setEditLoading(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        filterActive === "all"
          ? true
          : filterActive === "active"
          ? c.is_active
          : !c.is_active;

      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, filterActive]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Campaigns & Incentives
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            Coupons & <span className="font-serif italic text-[#639E1F]">Discounts</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCoupons}
            className="p-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/coupons/create"
            className="px-4 py-2.5 rounded-xl bg-[#172B15] hover:bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setFilterActive("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterActive === "all"
                ? "bg-[#2D5A1E] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            All ({coupons.length})
          </button>
          <button
            onClick={() => setFilterActive("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterActive === "active"
                ? "bg-[#2D5A1E] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterActive("inactive")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterActive === "inactive"
                ? "bg-[#2D5A1E] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Fetching active campaigns...
            </span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Tag className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-sm text-neutral-600 font-medium">No coupons found.</p>
            <Link
              href="/admin/coupons/create"
              className="inline-block text-xs font-bold uppercase tracking-wider text-[#2D5A1E] hover:underline"
            >
              + Create first campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Promo Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min. Subtotal</th>
                  <th className="px-6 py-4">Usage Limits</th>
                  <th className="px-6 py-4">Validity</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCoupons.map((c) => (
                  <tr key={c.public_id} className="hover:bg-[#FAFAF7]/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-sm tracking-wider px-2 py-0.5 rounded-lg bg-[#2D5A1E]/10 text-[#2D5A1E] border border-[#2D5A1E]/20">
                          {c.code}
                        </span>
                        {c.description && (
                          <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-[200px] pt-1">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 font-bold text-sm text-[#172B15]">
                        <span>{c.discount_percent}%</span>
                        <span className="text-[10px] text-neutral-400 font-normal">OFF</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      {c.minimum_subtotal ? `₹${Number(c.minimum_subtotal).toLocaleString("en-IN")}` : "None"}
                    </td>

                    <td className="px-6 py-4 space-y-0.5 font-mono text-[11px] text-neutral-600">
                      <div>Max Total: {c.max_redemptions ?? "∞"}</div>
                      <div className="text-[10px] text-neutral-400">
                        Per User: {c.max_redemptions_per_customer ?? "∞"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[11px] text-neutral-500 space-y-0.5 font-mono">
                      {c.starts_at || c.ends_at ? (
                        <>
                          <div>
                            {c.starts_at
                              ? new Date(c.starts_at).toLocaleDateString("en-IN")
                              : "Immediate"}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            to {c.ends_at ? new Date(c.ends_at).toLocaleDateString("en-IN") : "No expiry"}
                          </div>
                        </>
                      ) : (
                        <span>Always Active</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(c)}
                        disabled={actionLoadingId === c.public_id}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          c.is_active
                            ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/30"
                            : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                        }`}
                        title={c.is_active ? "Click to Deactivate" : "Click to Activate"}
                      >
                        {actionLoadingId === c.public_id ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : c.is_active ? (
                          <CheckCircle2 className="w-3 h-3 mr-1 text-[#639E1F]" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1 text-neutral-400" />
                        )}
                        <span>{c.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-[#2D5A1E] hover:text-white transition-all shadow-sm cursor-pointer"
                        title="Edit Coupon Parameters"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/admin/coupons/${c.public_id}`}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-[#2D5A1E] hover:text-white transition-all shadow-sm"
                        title="View details & redemptions"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/20 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F] block">
                  Update Campaign
                </span>
                <h3 className="text-lg font-bold text-[#172B15]">
                  Edit Coupon: <span className="font-mono text-[#2D5A1E]">{editingCoupon.code}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
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
              {/* Discount Percentage Selection (5% or 10%) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Discount Percentage (Strict Backend Rule: 5% or 10%) *
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
                  placeholder="Optional internal campaign details"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl p-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              {/* Numerical Limits */}
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

              {/* Start & End Dates */}
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
                  id="modal_is_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#2D5A1E] rounded cursor-pointer"
                />
                <label htmlFor="modal_is_active" className="text-xs font-semibold text-[#172B15] cursor-pointer">
                  Coupon is actively redeemable by customers
                </label>
              </div>

              {/* Form Controls */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
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
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}