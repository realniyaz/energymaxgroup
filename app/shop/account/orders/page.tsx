"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
  Search,
  ExternalLink,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { customerClient } from "@/lib/customer-client";

interface OrderSummaryItem {
  public_id: string;
  order_number: string;
  status: string;
  total_amount: string | number;
  created_at: string;
  items_count?: number;
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual Tracking search
  const [trackingNumberInput, setTrackingNumberInput] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/shop/auth/login?redirect=/shop/account/orders");
      return;
    }

    async function fetchOrders() {
      setLoading(true);
      try {
        // Fetch customer orders list
        const res = await customerClient.get<{ items: OrderSummaryItem[] } | OrderSummaryItem[]>(
          "/api/v1/shop/orders"
        );
        const list = Array.isArray(res.data) ? res.data : res.data.items || [];
        setOrders(list);
      } catch (err: any) {
        // If the customer has no orders endpoint or list is empty, default gracefully
        if (err.response?.status === 404) {
          setOrders([]);
        } else {
          const detail = err.response?.data?.detail;
          setError(typeof detail === "string" ? detail : "Unable to retrieve formulation orders.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isAuthenticated, authLoading, router]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumberInput.trim()) return;
    router.push(`/shop/orders/track?number=${encodeURIComponent(trackingNumberInput.trim())}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40">
            Paid & Verified
          </span>
        );
      case "pending_payment":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            Payment Pending
          </span>
        );
      case "shipped":
      case "in_transit":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            In Cold-Chain Transit
          </span>
        );
      case "delivered":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            Delivered
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
            {status.replace("_", " ")}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold">
          Retrieving Customer Allocation History...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Patron Account Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#172B15]">
              Formulation Orders
            </h1>
          </div>

          {/* Quick Tracking Search Bar */}
          <form onSubmit={handleTrackSubmit} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={trackingNumberInput}
                onChange={(e) => setTrackingNumberInput(e.target.value)}
                placeholder="Track by Order # (e.g. EMX-...)"
                className="bg-white border border-[#2D5A1E]/15 rounded-xl pl-9 pr-4 py-2 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all cursor-pointer"
            >
              Track
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#2D5A1E]/15 shadow-sm text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center mx-auto text-[#2D5A1E]">
              <Package className="w-7 h-7 text-[#639E1F]" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#172B15]">No Formulations Dispatched Yet</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              You have no active or completed order allocations on file. Explore our live probiotic batches in the catalog.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-md shadow-[#2D5A1E]/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Boutique</span>
            </Link>
          </div>
        ) : (
          /* Orders Card List */
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.public_id}
                className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm hover:border-[#639E1F]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#172B15]">
                      {ord.order_number}
                    </span>
                    {getStatusBadge(ord.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                    <span>•</span>
                    <span className="font-serif font-semibold text-[#172B15]">
                      Total: ₹{Number(ord.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    href={`/shop/account/orders/${ord.public_id}`}
                    className="px-5 py-2.5 rounded-2xl bg-[#FAFAF7] hover:bg-[#2D5A1E] hover:text-white border border-[#2D5A1E]/15 text-[#172B15] text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 group cursor-pointer shadow-sm"
                  >
                    <span>View Tracking & Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quality Guarantee Footnote */}
        <div className="p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#639E1F]" />
          </div>
          <div className="text-xs text-neutral-600 space-y-0.5">
            <span className="font-bold text-[#172B15] block">Cold-Chain Batch Viability Enforced</span>
            <span>Every formulation is handled under strictly monitored pharmaceutical cold-storage protocols until delivered to your door.</span>
          </div>
        </div>

      </div>
    </div>
  );
}