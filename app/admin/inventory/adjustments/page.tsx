// app/admin/inventory/adjustments/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Package,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAdminStockAdjustments,
  createAdminStockAdjustment,
  StockAdjustmentItem,
} from "@/lib/services/adminAdjustmentService";
import {
  getAdminWarehouses,
  WarehouseItem,
} from "@/lib/services/adminWarehouseService";

const ADJUSTMENT_TYPE_FILTERS = [
  { label: "All Adjustment Types", value: "" },
  { label: "Stock Increase (+)", value: "INCREASE" },
  { label: "Stock Decrease (-)", value: "DECREASE" },
];

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<StockAdjustmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Pagination
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  // Creation Drawer / Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [selectedWarehousePublicId, setSelectedWarehousePublicId] = useState("");
  const [variantPublicId, setVariantPublicId] = useState("");
  const [adjType, setAdjType] = useState<"INCREASE" | "DECREASE">("DECREASE");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAdjustments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminStockAdjustments({
        adjustment_type: typeFilter || undefined,
        limit,
        offset,
      });
      setAdjustments(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Unable to retrieve stock adjustment records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, [typeFilter, offset]);

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const res = await getAdminWarehouses();
        setWarehouses((res.items || []).filter((w) => w.is_active));
      } catch {}
    }
    loadWarehouses();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedWarehousePublicId ||
      !variantPublicId.trim() ||
      !quantity ||
      !reason.trim()
    ) {
      setError("Warehouse, Variant UUID, quantity, and reason are required.");
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    const idempotencyKey = `adj_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      await createAdminStockAdjustment({
        warehouse_id: selectedWarehousePublicId,
        variant_id: variantPublicId.trim(),
        adjustment_type: adjType,
        quantity: parseFloat(quantity),
        reason: reason.trim(),
        idempotency_key: idempotencyKey,
      });

      setSuccess("Inventory adjustment successfully applied and ledger updated.");
      setIsModalOpen(false);
      setVariantPublicId("");
      setQuantity("");
      setReason("");
      await fetchAdjustments();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to apply stock adjustment."
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredAdjustments = adjustments.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.reason.toLowerCase().includes(q) ||
      a.public_id.toLowerCase().includes(q) ||
      String(a.warehouse_id).includes(q) ||
      String(a.variant_id).includes(q)
    );
  });

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Cold-Chain Reconciliation
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#172B15]">
            Stock Adjustments ({total})
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/inventory"
            className="px-4 py-2 rounded-2xl bg-white border border-[#2D5A1E]/20 text-neutral-700 hover:text-[#2D5A1E] text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            Balances
          </Link>
          <button
            onClick={() => {
              setError(null);
              setSuccess(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Adjustment</span>
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
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reason or adjustment UUID..."
            className="w-full bg-white border border-[#2D5A1E]/15 rounded-xl pl-9 pr-4 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setOffset(0);
          }}
          className="bg-white border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] cursor-pointer"
        >
          {ADJUSTMENT_TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Inspecting Adjustment Audits...
            </span>
          </div>
        ) : filteredAdjustments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <SlidersHorizontal className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">
              No stock adjustment entries found under this filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Warehouse & Variant ID</th>
                  <th className="px-6 py-4 text-center">Delta Qty</th>
                  <th className="px-6 py-4 text-center">Before → After</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAdjustments.map((adj) => (
                  <tr key={adj.public_id} className="hover:bg-[#FAFAF7]/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                      {new Date(adj.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {adj.adjustment_type === "INCREASE" ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          <span>Increase</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-800 border border-red-200">
                          <ArrowUpRight className="w-3 h-3 text-red-600" />
                          <span>Decrease</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-neutral-600">
                      <div>WH ID: {adj.warehouse_id}</div>
                      <div>Variant ID: {adj.variant_id}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold">
                      {adj.adjustment_type === "INCREASE" ? (
                        <span className="text-[#2D5A1E]">
                          +{Number(adj.quantity).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-red-700">
                          -{Number(adj.quantity).toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                      {Number(adj.before_quantity).toLocaleString("en-IN")} →{" "}
                      <span className="font-bold text-[#172B15]">
                        {Number(adj.after_quantity).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-700 max-w-xs">
                      <p className="truncate text-xs">{adj.reason}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/inventory/adjustments/${adj.public_id}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 hover:bg-[#172B15] hover:text-white transition-all text-neutral-700 font-bold text-[10px]"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 text-xs">
            <span className="text-neutral-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setOffset((o) => Math.max(0, o - limit))}
                disabled={offset === 0}
                className="p-2 rounded-xl border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOffset((o) => o + limit)}
                disabled={offset + limit >= total}
                className="p-2 rounded-xl border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE ADJUSTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#639E1F] block">
                Cold-Chain Reconciliation
              </span>
              <h3 className="text-lg font-serif font-bold text-[#172B15]">
                Perform Stock Adjustment
              </h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Adjustment Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAFAF7] rounded-2xl border border-[#2D5A1E]/10">
                <button
                  type="button"
                  onClick={() => setAdjType("INCREASE")}
                  className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    adjType === "INCREASE"
                      ? "bg-[#172B15] text-white shadow"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-[#8CC63F]" />
                  <span>Increase (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType("DECREASE")}
                  className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    adjType === "DECREASE"
                      ? "bg-red-800 text-white shadow"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-300" />
                  <span>Decrease (-)</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Target Warehouse *
                </label>
                <select
                  required
                  value={selectedWarehousePublicId}
                  onChange={(e) => setSelectedWarehousePublicId(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] cursor-pointer"
                >
                  <option value="">Select facility...</option>
                  {warehouses.map((w) => (
                    <option key={w.public_id} value={w.public_id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Product Variant UUID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={variantPublicId}
                  onChange={(e) => setVariantPublicId(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs font-mono text-[#172B15]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Adjustment Quantity *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  placeholder="e.g. 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-[#172B15]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Audit Reason (Mandatory) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Cold-storage temperature breach, breakage during restocking, periodic cycle count correction..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2 text-xs text-[#172B15]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase hover:bg-[#2D5A1E] transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}