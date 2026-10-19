// app/admin/inventory/warehouses/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Check,
  X,
  ExternalLink,
  Truck,
  ShieldCheck,
} from "lucide-react";
import {
  getAdminWarehouses,
  createAdminWarehouse,
  updateAdminWarehouse,
  WarehouseItem,
} from "@/lib/services/adminWarehouseService";

const SHIPROCKET_DEFAULT_NICKNAME = "warehouse";

export default function AdminWarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter & Search
  const [search, setSearch] = useState("");

  // Create Warehouse Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formAddress, setFormAddress] = useState("");

  const fetchWarehouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminWarehouses();
      setWarehouses(data.items || []);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to load warehouses list."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setError("Warehouse Name and Code are required.");
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      await createAdminWarehouse({
        name: formName.trim(),
        code: formCode.trim().toLowerCase(),
        address: formAddress.trim() || null,
      });

      setSuccess(`Warehouse ${formCode.toLowerCase()} registered successfully.`);
      setIsModalOpen(false);
      setFormName("");
      setFormCode("");
      setFormAddress("");
      await fetchWarehouses();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to create warehouse hub."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (warehouse: WarehouseItem) => {
    try {
      await updateAdminWarehouse(warehouse.public_id, {
        is_active: !warehouse.is_active,
      });
      await fetchWarehouses();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to update warehouse status."
      );
    }
  };

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase()) ||
      (w.address && w.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Cold-Chain Logistics
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B15]">
            Warehouses & Facilities ({warehouses.length})
          </h1>
          <p className="text-xs text-neutral-500 pt-0.5">
            Manage inventory hubs and verify the active Shiprocket carrier pickup location.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setSuccess(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Facility</span>
        </button>
      </div>

      {/* Shiprocket Sync Alert Notice */}
      <div className="p-4 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs text-neutral-600">
          <div className="w-8 h-8 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-[#639E1F]" />
          </div>
          <div>
            <span className="font-bold text-[#172B15] block">
              Active Shiprocket Pickup Location: &ldquo;{SHIPROCKET_DEFAULT_NICKNAME}&rdquo;
            </span>
            <span>
              Orders dispatched via Shiprocket automatically assign pickups to the facility matching code &ldquo;{SHIPROCKET_DEFAULT_NICKNAME}&rdquo;.
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter facilities by name, code, or address..."
          className="w-full bg-white border border-[#2D5A1E]/15 rounded-xl pl-9 pr-4 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-mono"
        />
      </div>

      {/* Warehouse Listing Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Accessing Facility Registry...
            </span>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Building2 className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">
              No warehouse facilities found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Facility Code</th>
                  <th className="px-6 py-4">Facility Name</th>
                  <th className="px-6 py-4">Carrier Integration</th>
                  <th className="px-6 py-4">Address / Cold-Chain Spec</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {filteredWarehouses.map((wh) => {
                  const isShiprocketDefault =
                    wh.code.toLowerCase() === SHIPROCKET_DEFAULT_NICKNAME;

                  return (
                    <tr
                      key={wh.public_id}
                      className="hover:bg-[#FAFAF7]/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-[#172B15]">
                        {wh.code}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#172B15]">{wh.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        {isShiprocketDefault ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40">
                            <Truck className="w-3 h-3 text-[#639E1F]" />
                            <span>Shiprocket Primary</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">
                            Internal Hub
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {wh.address ? (
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate max-w-xs">{wh.address}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic">No address on file</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(wh)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                            wh.is_active
                              ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {wh.is_active ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              <span>Quarantined</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/inventory/warehouses/${wh.public_id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 hover:bg-[#172B15] hover:text-white transition-all text-neutral-700 font-bold text-[11px]"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#639E1F] block">
                Cold-Chain Facility
              </span>
              <h3 className="text-lg font-serif font-bold text-[#172B15]">
                Register Warehouse Facility
              </h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-neutral-500">
                    Warehouse Code *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormCode(SHIPROCKET_DEFAULT_NICKNAME)}
                    className="text-[10px] text-[#639E1F] font-bold hover:underline"
                  >
                    Set as &ldquo;{SHIPROCKET_DEFAULT_NICKNAME}&rdquo;
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${SHIPROCKET_DEFAULT_NICKNAME} or WH-BLR-01`}
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15] font-mono lowercase"
                />
                <span className="text-[10px] text-neutral-400 block">
                  Must match your Shiprocket registered pickup address nickname[cite: 5].
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EnergyMax Central Cold-Chain Hub"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Street Address / Specifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Storage units, refrigeration temp limits (2–8°C)..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
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
                  className="px-5 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold hover:bg-[#2D5A1E] transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Warehouse"
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