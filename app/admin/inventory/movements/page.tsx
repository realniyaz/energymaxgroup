// app/admin/inventory/movements/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ShoppingBag,
  SlidersHorizontal,
  Lock,
  Loader2,
  AlertCircle,
  Building2,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAdminInventoryMovements,
  InventoryMovementItem,
} from "@/lib/services/adminInventoryService";

const MOVEMENT_TYPES = [
  { label: "All Movement Types", value: "" },
  { label: "Stock In (Receipt)", value: "STOCK_IN" },
  { label: "Stock Out (Deduction)", value: "STOCK_OUT" },
  { label: "Reservation (Hold)", value: "RESERVATION" },
  { label: "Release (Expired/Cancelled)", value: "RELEASE" },
  { label: "Sale (Order Fulfilled)", value: "SALE" },
  { label: "Manual Adjustment", value: "ADJUSTMENT" },
];

export default function InventoryMovementsPage() {
  const [movements, setMovements] = useState<InventoryMovementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [movementType, setMovementType] = useState("");
  const [search, setSearch] = useState("");
  const [limit] = useState(25);
  const [offset, setOffset] = useState(0);

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminInventoryMovements({
        movement_type: movementType || undefined,
        limit,
        offset,
      });
      setMovements(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Unable to retrieve inventory audit movements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [movementType, offset]);

  const getMovementBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case "STOCK_IN":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
            <span>Stock In</span>
          </span>
        );
      case "STOCK_OUT":
      case "SALE":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <ShoppingBag className="w-3 h-3 text-blue-600" />
            <span>{type === "SALE" ? "Sale Deduction" : "Stock Out"}</span>
          </span>
        );
      case "RESERVATION":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Reservation</span>
          </span>
        );
      case "RELEASE":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3 h-3 text-purple-600" />
            <span>Released</span>
          </span>
        );
      case "ADJUSTMENT":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
            <SlidersHorizontal className="w-3 h-3 text-neutral-600" />
            <span>Adjustment</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">
            {type.replace("_", " ")}
          </span>
        );
    }
  };

  const filteredMovements = movements.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.product_name.toLowerCase().includes(q) ||
      m.sku.toLowerCase().includes(q) ||
      m.warehouse_code.toLowerCase().includes(q) ||
      (m.reference_id && m.reference_id.toLowerCase().includes(q)) ||
      (m.note && m.note.toLowerCase().includes(q))
    );
  });

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Cold-Chain Audit Trail
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#172B15]">
            Inventory Movements Ledger ({total})
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-white border border-[#2D5A1E]/20 text-neutral-700 hover:text-[#2D5A1E] text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <span>Balances</span>
          </Link>
          <Link
            href="/admin/inventory/warehouses"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-white border border-[#2D5A1E]/20 text-neutral-700 hover:text-[#2D5A1E] text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-[#639E1F]" />
            <span>Facilities</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
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
            placeholder="Search by SKU, Order ID, reference, note..."
            className="w-full bg-white border border-[#2D5A1E]/15 rounded-xl pl-9 pr-4 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        <div className="relative">
          <select
            value={movementType}
            onChange={(e) => {
              setMovementType(e.target.value);
              setOffset(0);
            }}
            className="bg-white border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] cursor-pointer"
          >
            {MOVEMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Inspecting Ledger Records...
            </span>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">
              No inventory movements recorded under this filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Formulation & SKU</th>
                  <th className="px-6 py-4">Facility</th>
                  <th className="px-6 py-4 text-center">Delta Qty</th>
                  <th className="px-6 py-4 text-center">Before → After</th>
                  <th className="px-6 py-4">Reference & Note</th>
                  <th className="px-6 py-4">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAFAF7]/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">{getMovementBadge(m.movement_type)}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#172B15]">{m.product_name}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        {m.sku} • {m.flavour}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#172B15]">{m.warehouse_name}</p>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {m.warehouse_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold">
                      {m.movement_type === "STOCK_IN" ||
                      m.movement_type === "RELEASE" ? (
                        <span className="text-[#2D5A1E]">
                          +{Number(m.quantity).toLocaleString("en-IN")}
                        </span>
                      ) : m.movement_type === "STOCK_OUT" ||
                        m.movement_type === "SALE" ? (
                        <span className="text-red-700">
                          -{Number(m.quantity).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-neutral-700">
                          {Number(m.quantity).toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                      {Number(m.before_quantity).toLocaleString("en-IN")} →{" "}
                      <span className="font-bold text-[#172B15]">
                        {Number(m.after_quantity).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {m.reference_id && (
                        <span className="inline-block font-mono text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded mb-1">
                          {m.reference_type ? `${m.reference_type}: ` : ""}
                          {m.reference_id}
                        </span>
                      )}
                      {m.note && (
                        <p className="text-[11px] text-neutral-500 max-w-xs truncate">
                          {m.note}
                        </p>
                      )}
                      {!m.reference_id && !m.note && (
                        <span className="text-neutral-400 italic text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <Link
                            href={`/admin/inventory/movements/${m.id}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 hover:bg-[#172B15] hover:text-white transition-all text-neutral-700 font-bold text-[10px]"
                        >
                            <span>Inspect</span>
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
              Page {currentPage} of {totalPages} ({total} movements)
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
    </div>
  );
}