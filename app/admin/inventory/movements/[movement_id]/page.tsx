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
  FileText,
  Hash,
  ArrowRight,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Lock,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import {
  getAdminInventoryMovement,
  InventoryMovementItem,
} from "@/lib/services/adminInventoryService";

export default function MovementDetailPage({
  params,
}: {
  params: Promise<{ movement_id: string }>;
}) {
  const resolvedParams = use(params);
  const movementId = resolvedParams.movement_id;

  const [movement, setMovement] = useState<InventoryMovementItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovement() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminInventoryMovement(movementId);
        setMovement(data);
      } catch (err: any) {
        const detail = err.response?.data?.detail;
        setError(
          typeof detail === "string"
            ? detail
            : "Failed to load inventory movement details."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMovement();
  }, [movementId]);

  const getMovementBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case "STOCK_IN":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stock In (Receipt)</span>
          </span>
        );
      case "STOCK_OUT":
      case "SALE":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>{type === "SALE" ? "Sale Deduction" : "Stock Out"}</span>
          </span>
        );
      case "RESERVATION":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Reservation Hold</span>
          </span>
        );
      case "RELEASE":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>Reservation Release</span>
          </span>
        );
      case "ADJUSTMENT":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
            <span>Inventory Adjustment</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
            {type.replace("_", " ")}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Inspecting Movement Audit Log...
        </span>
      </div>
    );
  }

  if (error || !movement) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-xs text-neutral-500 font-bold">
          {error || "Movement entry not found."}
        </p>
        <Link
          href="/admin/inventory/movements"
          className="text-xs font-bold text-[#639E1F] hover:underline"
        >
          Return to Movement Ledger
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
            href="/admin/inventory/movements"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Movement Ledger</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-[#172B15]">
              Movement Entry <span className="font-mono text-[#639E1F]">#{movement.id}</span>
            </h1>
            {getMovementBadge(movement.movement_type)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Snapshot & Delta Cards */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quantity Balance Snapshot */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-[#172B15]">
                  Balance Quantity Transition
                </h2>
                <p className="text-xs text-neutral-500">
                  State change recorded during this transaction.
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#639E1F]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Before Balance
                </span>
                <span className="font-mono text-xl font-bold text-[#172B15]">
                  {Number(movement.before_quantity).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Delta Units
                </span>
                <span className="font-mono text-xl font-bold text-[#2D5A1E]">
                  {movement.movement_type === "STOCK_OUT" || movement.movement_type === "SALE"
                    ? `-${Number(movement.quantity).toLocaleString("en-IN")}`
                    : `+${Number(movement.quantity).toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#8CC63F]/10 border border-[#8CC63F]/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A1E] block">
                  After Balance
                </span>
                <span className="font-mono text-xl font-bold text-[#172B15]">
                  {Number(movement.after_quantity).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Reference & Audit Notes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-[#172B15]">
              Audit References & Notes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600">
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Reference Type
                </span>
                <span className="font-mono font-bold text-[#172B15]">
                  {movement.reference_type || "INTERNAL_OPERATION"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Reference ID
                </span>
                <span className="font-mono font-bold text-[#172B15] break-all">
                  {movement.reference_id || "—"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Audit Note / Reason
              </span>
              <p className="text-xs text-[#172B15] leading-relaxed">
                {movement.note || "No audit comment attached to this operation."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Entity Context */}
        <div className="lg:col-span-4 space-y-6">
          {/* Formulation Details */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-[#639E1F]" />
              <h3 className="text-sm font-serif font-bold text-[#172B15]">
                Formulation & Variant
              </h3>
            </div>

            <div className="text-xs space-y-2 border-t border-neutral-100 pt-3">
              <div className="flex justify-between">
                <span className="text-neutral-500">Product Name</span>
                <span className="font-bold text-[#172B15]">{movement.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Flavour / Spec</span>
                <span className="font-medium text-[#172B15]">{movement.flavour}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">SKU</span>
                <span className="font-mono font-bold text-[#172B15]">{movement.sku}</span>
              </div>
            </div>
          </div>

          {/* Facility Details */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#639E1F]" />
              <h3 className="text-sm font-serif font-bold text-[#172B15]">
                Storage Facility
              </h3>
            </div>

            <div className="text-xs space-y-2 border-t border-neutral-100 pt-3">
              <div className="flex justify-between">
                <span className="text-neutral-500">Warehouse Name</span>
                <span className="font-bold text-[#172B15]">{movement.warehouse_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Warehouse Code</span>
                <span className="font-mono font-bold text-[#172B15]">{movement.warehouse_code}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-3 text-xs text-neutral-600">
            <div className="flex items-center space-x-2 text-[#172B15] font-serif font-bold mb-1">
              <Calendar className="w-4 h-4 text-[#639E1F]" />
              <span>Timestamp Metadata</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2">
              <span className="text-neutral-500">Executed At</span>
              <span className="font-mono text-neutral-800">
                {new Date(movement.created_at).toLocaleString("en-IN", {
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