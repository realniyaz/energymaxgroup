// app/admin/inventory/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Building2,
  Lock,
  History,
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import {
  getAdminInventoryBalances,
  InventoryBalanceItem,
  getAdminInventoryMovements,
  InventoryMovementItem,
} from "@/lib/services/adminInventoryService";
import {
  getAdminWarehouses,
  WarehouseItem,
} from "@/lib/services/adminWarehouseService";
import {
  getAdminReservations,
  ReservationItem,
} from "@/lib/services/adminReservationService";
import {
  getAdminStockAdjustments,
  StockAdjustmentItem,
} from "@/lib/services/adminAdjustmentService";

export default function InventoryDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subsystem Data States
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [balances, setBalances] = useState<InventoryBalanceItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovementItem[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustmentItem[]>([]);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      const [whRes, balRes, resRes, movRes, adjRes] = await Promise.all([
        getAdminWarehouses(),
        getAdminInventoryBalances(),
        getAdminReservations({ limit: 5 }),
        getAdminInventoryMovements({ limit: 5 }),
        getAdminStockAdjustments({ limit: 5 }),
      ]);

      setWarehouses(whRes.items || []);
      setBalances(balRes.items || []);
      setReservations(resRes.items || []);
      setMovements(movRes.items || []);
      setAdjustments(adjRes.items || []);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Unable to aggregate real-time inventory metrics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Aggregated KPIs
  const totalOnHand = balances.reduce((acc, b) => acc + Number(b.on_hand || 0), 0);
  const totalReserved = balances.reduce((acc, b) => acc + Number(b.reserved || 0), 0);
  const totalDamaged = balances.reduce((acc, b) => acc + Number(b.damaged || 0), 0);
  const totalAvailable = balances.reduce((acc, b) => acc + Number(b.available || 0), 0);
  const activeReservationsCount = reservations.filter((r) => r.status === "ACTIVE").length;

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Aggregating Cold-Chain Hub Data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Cold-Chain Logistics Management
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#172B15]">
            Inventory Operations Hub
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-white border border-[#2D5A1E]/20 text-neutral-700 hover:text-[#2D5A1E] text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync Stats</span>
          </button>
          <Link
            href="/admin/inventory/stock"
            className="px-4 py-2 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all shadow-md"
          >
            Stock In / Out
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#2D5A1E]/15 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Viable Available
          </span>
          <span className="font-mono text-2xl font-bold text-[#2D5A1E]">
            {totalAvailable.toLocaleString("en-IN")}
          </span>
          <p className="text-[11px] text-neutral-400">Order-ready stock</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#2D5A1E]/15 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Total On Hand
          </span>
          <span className="font-mono text-2xl font-bold text-[#172B15]">
            {totalOnHand.toLocaleString("en-IN")}
          </span>
          <p className="text-[11px] text-neutral-400">Physical hub units</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#2D5A1E]/15 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Reserved Units
          </span>
          <span className="font-mono text-2xl font-bold text-amber-600">
            {totalReserved.toLocaleString("en-IN")}
          </span>
          <p className="text-[11px] text-neutral-400">Locked for checkouts</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#2D5A1E]/15 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
            Damaged / Quarantined
          </span>
          <span className="font-mono text-2xl font-bold text-red-600">
            {totalDamaged.toLocaleString("en-IN")}
          </span>
          <p className="text-[11px] text-neutral-400">Cold-chain breaches</p>
        </div>

        <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-white p-5 rounded-3xl border border-[#2D5A1E]/15 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Storage Facilities
          </span>
          <span className="font-mono text-2xl font-bold text-[#172B15]">
            {warehouses.filter((w) => w.is_active).length} / {warehouses.length}
          </span>
          <p className="text-[11px] text-neutral-400">Active warehouses</p>
        </div>
      </div>

      {/* Primary Operations Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Balances by Variant & Warehouse */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-[#172B15]">
                  Active Inventory Balances ({balances.length})
                </h2>
                <p className="text-xs text-neutral-400">
                  Real-time storage status by SKU and warehouse
                </p>
              </div>
              <Link
                href="/admin/inventory/stock"
                className="text-xs font-bold text-[#2D5A1E] hover:underline flex items-center space-x-1"
              >
                <span>Stock Operations</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {balances.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No inventory balances established. Run Stock In to seed inventory.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#172B15]">
                  <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-6 py-3.5">Product & SKU</th>
                      <th className="px-6 py-3.5">Facility</th>
                      <th className="px-6 py-3.5 text-center">On Hand</th>
                      <th className="px-6 py-3.5 text-center">Reserved</th>
                      <th className="px-6 py-3.5 text-center font-bold text-[#2D5A1E]">
                        Available
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {balances.slice(0, 6).map((b, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF7]/50">
                        <td className="px-6 py-3.5">
                          <p className="font-bold text-[#172B15]">{b.product_name}</p>
                          <span className="font-mono text-[10px] text-neutral-400">
                            {b.sku} • {b.flavour}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-neutral-800">{b.warehouse_name}</p>
                          <span className="font-mono text-[10px] text-neutral-400">
                            {b.warehouse_code}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center font-mono font-medium">
                          {Number(b.on_hand).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3.5 text-center font-mono text-amber-600 font-medium">
                          {Number(b.reserved).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3.5 text-center font-mono font-bold text-[#2D5A1E]">
                          {Number(b.available).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Audit Movements */}
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-[#172B15]">
                  Recent Movement Audits
                </h2>
                <p className="text-xs text-neutral-400">
                  Latest system and order-driven balance adjustments
                </p>
              </div>
              <Link
                href="/admin/inventory/movements"
                className="text-xs font-bold text-[#2D5A1E] hover:underline flex items-center space-x-1"
              >
                <span>View Full Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-neutral-100 text-xs">
              {movements.map((m) => (
                <div key={m.id} className="p-4 sm:px-6 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#172B15]">{m.movement_type}</span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {m.warehouse_code}
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px]">
                      {m.product_name} ({m.sku})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs">
                      {m.movement_type === "STOCK_OUT" || m.movement_type === "SALE"
                        ? `-${Number(m.quantity)}`
                        : `+${Number(m.quantity)}`}
                    </span>
                    <span className="block text-[10px] text-neutral-400 font-mono">
                      {new Date(m.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Warehouses, Reservations & Quick Links */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Reservations Widget */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-serif font-bold text-[#172B15]">
                  Checkout Reservations
                </h3>
              </div>
              <Link
                href="/admin/inventory/reservations"
                className="text-[11px] font-bold text-[#2D5A1E] hover:underline"
              >
                All Holds
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {reservations.length === 0 ? (
                <p className="text-xs text-neutral-400">No recent reservations.</p>
              ) : (
                reservations.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-2xl bg-[#FAFAF7] border border-neutral-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#172B15]">#{r.id} • {r.reference_id}</p>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {r.status}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#2D5A1E]">
                      {Number(r.quantity)} units
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-3">
            <h3 className="text-sm font-serif font-bold text-[#172B15]">
              Subsystem Desks
            </h3>

            <div className="space-y-2 pt-1 text-xs font-semibold">
              <Link
                href="/admin/inventory/warehouses"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAFAF7] border border-transparent hover:border-neutral-100 transition-all text-neutral-700 hover:text-[#172B15]"
              >
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-4 h-4 text-[#639E1F]" />
                  <span>Warehouses & Facilities ({warehouses.length})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </Link>

              <Link
                href="/admin/inventory/adjustments"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAFAF7] border border-transparent hover:border-neutral-100 transition-all text-neutral-700 hover:text-[#172B15]"
              >
                <div className="flex items-center space-x-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#639E1F]" />
                  <span>Cycle Count Adjustments</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </Link>

              <Link
                href="/admin/inventory/movements"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAFAF7] border border-transparent hover:border-neutral-100 transition-all text-neutral-700 hover:text-[#172B15]"
              >
                <div className="flex items-center space-x-2.5">
                  <History className="w-4 h-4 text-[#639E1F]" />
                  <span>Audit Trail Ledger</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}