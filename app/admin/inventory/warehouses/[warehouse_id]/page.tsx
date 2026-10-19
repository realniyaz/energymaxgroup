// app/admin/inventory/warehouses/[warehouse_id]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Save,
  Truck,
  ShieldCheck,
} from "lucide-react";
import {
  getAdminWarehouse,
  updateAdminWarehouse,
  WarehouseItem,
} from "@/lib/services/adminWarehouseService";

const SHIPROCKET_DEFAULT_NICKNAME = "warehouse";

export default function WarehouseDetailPage({
  params,
}: {
  params: Promise<{ warehouse_id: string }>;
}) {
  const resolvedParams = use(params);
  const warehouseId = resolvedParams.warehouse_id;

  const [warehouse, setWarehouse] = useState<WarehouseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchWarehouse = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminWarehouse(warehouseId);
      setWarehouse(data);
      setName(data.name);
      setCode(data.code);
      setAddress(data.address || "");
      setIsActive(data.is_active);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Unable to load warehouse details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, [warehouseId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateAdminWarehouse(warehouseId, {
        name: name.trim(),
        code: code.trim().toLowerCase(),
        address: address.trim() || null,
        is_active: isActive,
      });
      setWarehouse(updated);
      setSuccess("Facility details and carrier bindings updated successfully.");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to update warehouse details."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Inspecting Facility Specs...
        </span>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="p-8 text-center space-y-3 font-sans">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-xs text-neutral-500 font-bold">
          Warehouse not found.
        </p>
        <Link
          href="/admin/inventory/warehouses"
          className="text-xs font-bold text-[#639E1F] hover:underline"
        >
          Return to Warehouses
        </Link>
      </div>
    );
  }

  const isShiprocketPrimary =
    code.trim().toLowerCase() === SHIPROCKET_DEFAULT_NICKNAME;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <div>
          <Link
            href="/admin/inventory/warehouses"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Warehouses Overview</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-[#172B15]">
              {warehouse.name}
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
              {warehouse.code}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isShiprocketPrimary && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40">
              <Truck className="w-3 h-3 text-[#639E1F]" />
              <span>Shiprocket Pickup Hub</span>
            </span>
          )}

          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              warehouse.is_active
                ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {warehouse.is_active ? "Operational" : "Quarantined"}
          </span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editable Configuration */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
          <h2 className="text-base font-serif font-bold text-[#172B15]">
            Facility Profile & Specs
          </h2>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Facility Code *
                </label>
                <button
                  type="button"
                  onClick={() => setCode(SHIPROCKET_DEFAULT_NICKNAME)}
                  className="text-[10px] text-[#639E1F] font-bold hover:underline"
                >
                  Bind to &ldquo;{SHIPROCKET_DEFAULT_NICKNAME}&rdquo;
                </button>
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] font-mono lowercase"
              />
              <span className="text-[10px] text-neutral-400 block">
                Must match the pickup nickname in your Shiprocket account for warehouse pickup generation to succeed[cite: 5].
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-500">
                Facility Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-500">
                Storage Address / Details
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2 text-xs text-[#172B15]"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_active_toggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#2D5A1E] rounded accent-[#2D5A1E]"
              />
              <label
                htmlFor="is_active_toggle"
                className="text-xs font-semibold text-[#172B15]"
              >
                Mark facility as active and available for inventory allocations
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Metadata */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#172B15]">
              Logistics & Integration Status
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#639E1F]" />
                <span className="font-bold text-[#172B15]">Shiprocket Carrier Contract</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Pickup schedules generated from the Admin Orders Desk call Shiprocket using location nickname: <span className="font-mono font-bold text-[#172B15]">&ldquo;{SHIPROCKET_DEFAULT_NICKNAME}&rdquo;</span>[cite: 5]. Ensure this matches the registered warehouse address inside Shiprocket Settings &rarr; Manage Pickup Addresses[cite: 5].
              </p>
            </div>

            <div className="space-y-2 text-xs text-neutral-600 pt-2">
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Created At</span>
                <span className="font-mono text-neutral-800">
                  {new Date(warehouse.created_at).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Last Updated</span>
                <span className="font-mono text-neutral-800">
                  {new Date(warehouse.updated_at).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Public UUID</span>
                <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[140px]">
                  {warehouse.public_id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}