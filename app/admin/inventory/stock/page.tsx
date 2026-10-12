// app/admin/inventory/stock/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  FileText,
  Key,
} from "lucide-react";
import {
  executeStockIn,
  executeStockOut,
  StockOperationResponse,
} from "@/lib/services/adminInventoryService";
import {
  getAdminWarehouses,
  WarehouseItem,
} from "@/lib/services/adminWarehouseService";

export default function StockOperationsPage() {
  const [opMode, setOpMode] = useState<"STOCK_IN" | "STOCK_OUT">("STOCK_IN");

  // Selection states
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | "">("");
  const [variantIdInput, setVariantIdInput] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<string>("");

  // Audit and References
  const [referenceType, setReferenceType] = useState<string>("PURCHASE_RECEIPT");
  const [referenceId, setReferenceId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [useCustomIdempotency, setUseCustomIdempotency] = useState<boolean>(false);
  const [customIdempotencyKey, setCustomIdempotencyKey] = useState<string>("");

  // Execution states
  const [loadingWarehouses, setLoadingWarehouses] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<StockOperationResponse | null>(null);

  useEffect(() => {
    async function loadFacilities() {
      try {
        const res = await getAdminWarehouses();
        const active = (res.items || []).filter((w) => w.is_active);
        setWarehouses(active);
      } catch (err) {
        // Fallback gracefully
      } finally {
        setLoadingWarehouses(false);
      }
    }
    loadFacilities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLastResult(null);

    const warehouseIdNum = Number(selectedWarehouseId);
    const variantIdNum = Number(variantIdInput);
    const qtyNum = Number(quantityInput);

    if (!warehouseIdNum || isNaN(warehouseIdNum)) {
      setError("Please select a target warehouse.");
      return;
    }
    if (!variantIdNum || isNaN(variantIdNum) || variantIdNum <= 0) {
      setError("Please provide a valid numeric Variant ID.");
      return;
    }
    if (!qtyNum || isNaN(qtyNum) || qtyNum <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    setSubmitting(true);

    const idempotencyKey = useCustomIdempotency && customIdempotencyKey.trim()
      ? customIdempotencyKey.trim()
      : `stock_${opMode.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const payload = {
      warehouse_id: warehouseIdNum,
      variant_id: variantIdNum,
      quantity: qtyNum,
      movement_type: opMode,
      reference_type: referenceType.trim() || null,
      reference_id: referenceId.trim() || null,
      idempotency_key: idempotencyKey,
      note: note.trim() || null,
    };

    try {
      let result: StockOperationResponse;
      if (opMode === "STOCK_IN") {
        result = await executeStockIn(payload);
      } else {
        result = await executeStockOut(payload);
      }
      setLastResult(result);
      // Reset sensitive fields
      setQuantityInput("");
      setReferenceId("");
      setNote("");
      setCustomIdempotencyKey("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : `Failed to execute ${opMode === "STOCK_IN" ? "Stock-In" : "Stock-Out"} operation.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Warehouse Operations Desk
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#172B15]">
            Stock In & Stock Out Entry
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/inventory"
            className="px-4 py-2 rounded-2xl bg-white border border-[#2D5A1E]/20 text-neutral-700 hover:text-[#2D5A1E] text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            Balances
          </Link>
          <Link
            href="/admin/inventory/movements"
            className="px-4 py-2 rounded-2xl bg-white border border-[#2D5A1E]/20 text-neutral-700 hover:text-[#2D5A1E] text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            Ledger Audit
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {lastResult && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-[#172B15] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="text-sm font-serif font-bold text-emerald-900">
                Operation Executed Successfully
              </h3>
            </div>
            <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              Movement #{lastResult.movement_id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                Quantity Delta
              </span>
              <span className="font-mono text-base font-bold text-[#2D5A1E]">
                {lastResult.movement_type === "STOCK_OUT" ? "-" : "+"}
                {Number(lastResult.movement_quantity).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                Before → After
              </span>
              <span className="font-mono text-base font-bold text-[#172B15]">
                {Number(lastResult.before_quantity).toLocaleString("en-IN")} →{" "}
                {Number(lastResult.after_quantity).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                Total On-Hand
              </span>
              <span className="font-mono text-base font-bold text-[#172B15]">
                {Number(lastResult.on_hand).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-[#2D5A1E] block">
                Net Available Stock
              </span>
              <span className="font-mono text-base font-bold text-[#2D5A1E]">
                {Number(lastResult.available).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Container */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
          {/* Operation Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAFAF7] rounded-2xl border border-[#2D5A1E]/10">
            <button
              type="button"
              onClick={() => {
                setOpMode("STOCK_IN");
                setReferenceType("PURCHASE_RECEIPT");
              }}
              className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                opMode === "STOCK_IN"
                  ? "bg-[#172B15] text-white shadow-md"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-[#8CC63F]" />
              <span>Stock In (Receipt)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpMode("STOCK_OUT");
                setReferenceType("DAMAGE_OR_DISPATCH");
              }}
              className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                opMode === "STOCK_OUT"
                  ? "bg-red-800 text-white shadow-md"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-red-300" />
              <span>Stock Out (Deduction)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Facility & Variant Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500 flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-[#639E1F]" />
                  <span>Target Warehouse *</span>
                </label>
                {loadingWarehouses ? (
                  <div className="h-10 bg-[#FAFAF7] rounded-xl flex items-center px-3 text-xs text-neutral-400">
                    Loading hubs...
                  </div>
                ) : (
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : "")}
                    required
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] cursor-pointer"
                  >
                    <option value="">Select facility...</option>
                    {warehouses.map((w, idx) => (
                      <option key={w.public_id} value={idx + 1}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500 flex items-center space-x-1">
                  <Package className="w-3 h-3 text-[#639E1F]" />
                  <span>Product Variant ID (Numeric) *</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 1"
                  value={variantIdInput}
                  onChange={(e) => setVariantIdInput(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] font-mono focus:outline-none focus:border-[#639E1F]"
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-500">
                Quantity (Units) *
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                required
                placeholder="e.g. 250"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] font-mono font-bold text-base focus:outline-none focus:border-[#639E1F]"
              />
            </div>

            {/* Reference Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Reference Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. PURCHASE_ORDER, QC_AUDIT"
                  value={referenceType}
                  onChange={(e) => setReferenceType(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Reference Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-9901"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] font-mono focus:outline-none focus:border-[#639E1F]"
                />
              </div>
            </div>

            {/* Audit Note */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-500">
                Audit Note / Reason
              </label>
              <textarea
                rows={3}
                placeholder="Add audit ledger details regarding cold-storage transfer, batch lot, or receipt specifics..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />
            </div>

            {/* Idempotency Config */}
            <div className="space-y-2 pt-1 border-t border-neutral-100">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="custom_idempotency"
                  checked={useCustomIdempotency}
                  onChange={(e) => setUseCustomIdempotency(e.target.checked)}
                  className="w-4 h-4 text-[#2D5A1E] rounded accent-[#2D5A1E]"
                />
                <label htmlFor="custom_idempotency" className="text-xs text-neutral-600 font-medium">
                  Provide custom idempotency key (otherwise auto-generated)
                </label>
              </div>

              {useCustomIdempotency && (
                <input
                  type="text"
                  placeholder="Unique retry key (max 100 chars)"
                  value={customIdempotencyKey}
                  onChange={(e) => setCustomIdempotencyKey(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2 text-xs font-mono text-[#172B15]"
                />
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md ${
                  opMode === "STOCK_IN"
                    ? "bg-[#172B15] hover:bg-[#2D5A1E]"
                    : "bg-red-800 hover:bg-red-900"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transacting Ledger...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm {opMode === "STOCK_IN" ? "Stock In" : "Stock Out"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Rules & Guardrails */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-[#172B15]">
              <ShieldCheck className="w-5 h-5 text-[#639E1F]" />
              <h3 className="text-sm font-serif font-bold">Ledger Invariants</h3>
            </div>
            <div className="space-y-3 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
              <p>
                <strong>Non-negative balance rule:</strong> Deductions exceeding available units are rejected immediately with a <code>409 Conflict</code> error.
              </p>
              <p>
                <strong>Row-level locking:</strong> Concurrent requests execute sequentially with database row locks (`SELECT FOR UPDATE`) to prevent double-spending stock.
              </p>
              <p>
                <strong>Audit immutability:</strong> Every stock transaction automatically creates an immutable record inside <code>inventory_movements</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}