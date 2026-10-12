// app/admin/inventory/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  ShieldAlert,
} from "lucide-react";
import {
  getAdminInventoryBalances,
  stockInInventory,
  stockOutInventory,
  InventoryBalanceItem,
} from "@/lib/services/adminInventoryService";

export default function AdminInventoryBalancesPage() {
  const [balances, setBalances] = useState<InventoryBalanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search filter
  const [search, setSearch] = useState("");

  // Stock Operation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryBalanceItem | null>(null);
  const [operationType, setOperationType] = useState<"STOCK_IN" | "STOCK_OUT">("STOCK_IN");
  const [opQuantity, setOpQuantity] = useState("");
  const [opNote, setOpNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBalances = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminInventoryBalances();
      setBalances(data.items || []);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to load inventory balances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const openOperationModal = (
    item: InventoryBalanceItem,
    type: "STOCK_IN" | "STOCK_OUT"
  ) => {
    setSelectedItem(item);
    setOperationType(type);
    setOpQuantity("");
    setOpNote("");
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleOperationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !opQuantity || parseFloat(opQuantity) <= 0) {
      setError("Please specify a valid quantity greater than zero.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const idempotencyKey = `op_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      if (operationType === "STOCK_IN") {
        await stockInInventory({
          warehouse_id: selectedItem.warehouse_id,
          variant_id: selectedItem.variant_id,
          quantity: parseFloat(opQuantity),
          note: opNote.trim() || undefined,
          idempotency_key: idempotencyKey,
        });
        setSuccess(`Stock-in completed for ${selectedItem.sku}.`);
      } else {
        await stockOutInventory({
          warehouse_id: selectedItem.warehouse_id,
          variant_id: selectedItem.variant_id,
          quantity: parseFloat(opQuantity),
          note: opNote.trim() || undefined,
          idempotency_key: idempotencyKey,
        });
        setSuccess(`Stock-out completed for ${selectedItem.sku}.`);
      }

      setIsModalOpen(false);
      await fetchBalances();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to execute stock operation.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBalances = balances.filter(
    (b) =>
      b.product_name.toLowerCase().includes(search.toLowerCase()) ||
      b.sku.toLowerCase().includes(search.toLowerCase()) ||
      b.warehouse_name.toLowerCase().includes(search.toLowerCase()) ||
      b.warehouse_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Cold-Chain Warehousing
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#172B15]">
            Inventory Stock Balances ({balances.length})
          </h1>
        </div>

        <Link
          href="/admin/inventory/warehouses"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white border border-[#2D5A1E]/20 text-[#172B15] text-xs font-bold uppercase tracking-wider hover:bg-[#FAFAF7] transition-all shadow-sm"
        >
          <Building2 className="w-4 h-4 text-[#639E1F]" />
          <span>Manage Facilities</span>
        </Link>
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

      {/* Filter / Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by product, SKU, or warehouse..."
          className="w-full bg-white border border-[#2D5A1E]/15 rounded-xl pl-9 pr-4 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
        />
      </div>

      {/* Balances Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Calculating Available Inventory...
            </span>
          </div>
        ) : filteredBalances.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">
              No inventory balance entries located.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Product Variant</th>
                  <th className="px-6 py-4">Facility / Hub</th>
                  <th className="px-6 py-4 text-center">On Hand</th>
                  <th className="px-6 py-4 text-center">Reserved</th>
                  <th className="px-6 py-4 text-center">Damaged</th>
                  <th className="px-6 py-4 text-center font-bold text-[#2D5A1E]">Available</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredBalances.map((b, idx) => (
                  <tr key={idx} className="hover:bg-[#FAFAF7]/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#172B15]">{b.product_name}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-neutral-400 font-mono">
                        <span>SKU: {b.sku}</span>
                        <span>•</span>
                        <span>{b.flavour}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#172B15]">{b.warehouse_name}</p>
                      <span className="font-mono text-[10px] text-neutral-400">{b.warehouse_code}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-medium">
                      {Number(b.on_hand).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-amber-600 font-medium">
                      {Number(b.reserved).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-red-600 font-medium">
                      {Number(b.damaged).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-[#2D5A1E]">
                      {Number(b.available).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => openOperationModal(b, "STOCK_IN")}
                          title="Stock In Receipt"
                          className="p-1.5 rounded-lg bg-[#8CC63F]/20 text-[#2D5A1E] hover:bg-[#8CC63F]/30 transition-colors cursor-pointer"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openOperationModal(b, "STOCK_OUT")}
                          title="Stock Out Deduction"
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STOCK IN / OUT MODAL */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#639E1F] block">
                {operationType === "STOCK_IN" ? "Stock Receipt" : "Stock Deduction"}
              </span>
              <h3 className="text-lg font-serif font-bold text-[#172B15]">
                {selectedItem.product_name} ({selectedItem.sku})
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Facility: {selectedItem.warehouse_name} ({selectedItem.warehouse_code})
              </p>
            </div>

            <form onSubmit={handleOperationSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  placeholder="e.g. 100"
                  value={opQuantity}
                  onChange={(e) => setOpQuantity(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Audit Reason / Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Fresh cold-chain batch arrival, QC sample dispatch..."
                  value={opNote}
                  onChange={(e) => setOpNote(e.target.value)}
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
                  disabled={submitting}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${
                    operationType === "STOCK_IN"
                      ? "bg-[#2D5A1E] hover:bg-[#234717]"
                      : "bg-red-700 hover:bg-red-800"
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : operationType === "STOCK_IN" ? (
                    "Apply Stock-In"
                  ) : (
                    "Apply Stock-Out"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}