"use client";

import React, { useEffect, useState } from "react";
import {
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Infinity,
  Zap,
} from "lucide-react";
import {
  getAdminReservations,
  createAdminReservation,
  releaseAdminReservation,
  confirmAdminReservation,
  ReservationItem,
} from "@/lib/services/adminReservationService";
import {
  getAdminWarehouses,
  WarehouseItem,
} from "@/lib/services/adminWarehouseService";

const STATUS_FILTERS = [
  { label: "All Statuses", value: "" },
  { label: "Active Holds", value: "ACTIVE" },
  { label: "Confirmed (Deducted)", value: "CONFIRMED" },
  { label: "Released", value: "RELEASED" },
  { label: "Expired", value: "EXPIRED" },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [variantIdInput, setVariantIdInput] = useState("");
  const [quantity, setQuantity] = useState("");
  const [referenceType, setReferenceType] = useState("MANUAL_HOLD");
  const [referenceId, setReferenceId] = useState("");
  const [noExpiry, setNoExpiry] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReservations({
        status: (statusFilter as any) || undefined,
        limit,
        page: Math.floor(offset / limit) + 1,
      });
      setReservations(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to load inventory reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, offset]);

  useEffect(() => {
    async function fetchWarehouses() {
      try {
        const res = await getAdminWarehouses();
        setWarehouses((res.items || []).filter((w) => w.is_active));
      } catch {}
    }
    fetchWarehouses();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouseId || !variantIdInput.trim() || !quantity) {
      setError("Target Warehouse, Product Variant ID, and Quantity are required.");
      return;
    }

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError("Please specify a quantity greater than 0.");
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    const isNumericVariant = /^\d+$/.test(variantIdInput.trim());
    const resolvedVariantId = isNumericVariant ? parseInt(variantIdInput.trim(), 10) : variantIdInput.trim();

    try {
      await createAdminReservation({
        warehouse_id: selectedWarehouseId,
        variant_id: resolvedVariantId as any,
        quantity: parsedQty,
        reference_type: referenceType.trim() || "MANUAL_HOLD",
        reference_id: referenceId.trim() || `HOLD-${Date.now()}`,
        expires_at: noExpiry ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        idempotency_key: `res_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      });

      setSuccess("Reservation created with no expiration window.");
      setIsModalOpen(false);
      setVariantIdInput("");
      setQuantity("");
      setReferenceId("");
      await fetchReservations();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to create reservation hold.");
    } finally {
      setCreating(false);
    }
  };

  const handleConfirm = async (id: number) => {
    if (!confirm(`Force-confirm reservation #${id}? This will permanently deduct inventory with manual admin override.`)) return;
    setProcessingId(id);
    setError(null);
    setSuccess(null);

    try {
      await confirmAdminReservation(id, true); // true = force override expiry
      setSuccess(`Reservation #${id} confirmed and converted to stock deduction (Override Applied).`);
      await fetchReservations();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : `Failed to confirm reservation #${id}.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRelease = async (id: number) => {
    if (!confirm(`Release reservation #${id} back to available stock?`)) return;
    setProcessingId(id);
    setError(null);
    setSuccess(null);

    try {
      await releaseAdminReservation(id);
      setSuccess(`Reservation #${id} released back to stock.`);
      await fetchReservations();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : `Failed to release reservation #${id}.`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Active Hold</span>
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case "RELEASED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <Unlock className="w-3 h-3 text-blue-600" />
            <span>Released</span>
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>Expired (Override Available)</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
            {status}
          </span>
        );
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.reference_id && r.reference_id.toLowerCase().includes(q)) ||
      (r.sku && r.sku.toLowerCase().includes(q)) ||
      String(r.id).includes(q)
    );
  });

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Stock Allocations & Locks
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#172B15]">
            Inventory Reservations ({total})
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={fetchReservations}
            disabled={loading}
            className="p-2.5 rounded-2xl border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccess(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation (No Expiry)</span>
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, SKU, or reservation ID..."
            className="w-full bg-white border border-[#2D5A1E]/15 rounded-xl pl-9 pr-4 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setOffset(0);
          }}
          className="bg-white border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] cursor-pointer"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Inspecting Reservation Holds...
            </span>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Lock className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">
              No inventory reservations match this filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Reference & SKU</th>
                  <th className="px-6 py-4">Facility / Variant ID</th>
                  <th className="px-6 py-4 text-center">Reserved Qty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry Window</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredReservations.map((r) => {
                  const isActionable = r.status === "ACTIVE" || r.status === "EXPIRED";
                  return (
                    <tr key={r.id} className="hover:bg-[#FAFAF7]/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#172B15]">
                        #{r.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#172B15]">{r.reference_id}</p>
                        <span className="font-mono text-[10px] text-neutral-400 uppercase">
                          {r.sku ? `SKU: ${r.sku}` : r.product_name || "HOLD"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-neutral-600">
                        <div>WH: {r.warehouse_name || r.warehouse_code || `#${r.warehouse_id}`}</div>
                        <div>Variant: {r.variant_public_id || `#${r.variant_id}`}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-[#2D5A1E]">
                        {Number(r.quantity).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-neutral-500">
                        {r.expires_at ? (
                          <span>
                            {new Date(r.expires_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[#2D5A1E] font-bold">
                            <Infinity className="w-3.5 h-3.5" />
                            <span>Indefinite</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isActionable ? (
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              type="button"
                              disabled={processingId === r.id}
                              onClick={() => handleConfirm(r.id)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                              title="Force confirm using manual override"
                            >
                              <Zap className="w-2.5 h-2.5" />
                              <span>{processingId === r.id ? "..." : "Confirm"}</span>
                            </button>
                            <button
                              type="button"
                              disabled={processingId === r.id}
                              onClick={() => handleRelease(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-[10px] font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {processingId === r.id ? "..." : "Release"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 text-xs">
            <span className="text-neutral-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setOffset((o) => Math.max(0, o - limit))}
                disabled={offset === 0}
                className="p-2 rounded-xl border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#639E1F] block">
                Manual Inventory Lock
              </span>
              <h3 className="text-lg font-serif font-bold text-[#172B15]">
                Create Stock Hold
              </h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Target Warehouse *
                </label>
                <select
                  required
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
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
                  Product Variant (Numeric ID or UUID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 or 550e8400-e29b-41d4-a716-446655440000"
                  value={variantIdInput}
                  onChange={(e) => setVariantIdInput(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs font-mono text-[#172B15]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Reserved Quantity *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  placeholder="e.g. 5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-[#172B15]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Reference Note / ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. MANUAL-VIP-HOLD"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#172B15]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 bg-[#FAFAF7] p-3 rounded-2xl border border-neutral-100">
                <input
                  type="checkbox"
                  id="noExpiry"
                  checked={noExpiry}
                  onChange={(e) => setNoExpiry(e.target.checked)}
                  className="w-4 h-4 text-[#2D5A1E] rounded accent-[#2D5A1E]"
                />
                <label htmlFor="noExpiry" className="text-xs font-semibold text-[#172B15] cursor-pointer">
                  Indefinite Hold (No Expiration Window)
                </label>
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
                  className="px-5 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase hover:bg-[#2D5A1E] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Indefinite Hold"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}