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
  MapPin,
  Save,
  Check,
  X,
} from "lucide-react";
import {
  getAdminWarehouse,
  updateAdminWarehouse,
  WarehouseItem,
} from "@/lib/services/adminWarehouseService";

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
        code: code.trim().toUpperCase(),
        address: address.trim() || null,
        is_active: isActive,
      });
      setWarehouse(updated);
      setSuccess("Warehouse details saved successfully.");
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
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Inspecting Facility Specs...
        </span>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="p-8 text-center space-y-3">
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

  return (
    <div className="space-y-6">
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
              <label className="text-[10px] font-bold uppercase text-neutral-500">
                Facility Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-500">
                Facility Name
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
                Mark warehouse as active and available for order allocations
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
                    <span>Saving...</span>
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
              Logistics Metadata
            </h3>
            <div className="space-y-2 text-xs text-neutral-600">
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