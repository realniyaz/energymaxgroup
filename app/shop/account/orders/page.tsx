"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Truck,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Loader2,
  AlertCircle,
  PackageCheck,
} from "lucide-react";
import { customerClient } from "@/lib/customer-client";

export default function CustomerOrdersLookupPage() {
  const router = useRouter();
  const [orderQuery, setOrderQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderQuery.trim().toUpperCase();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      // Calls: GET /api/v1/shop/orders/track/{order_number}
      const res = await customerClient.get(
        `/api/v1/shop/orders/track/${encodeURIComponent(query)}`
      );

      if (res.data?.public_id) {
        // Direct patron into their detailed tracking and order management view
        router.push(`/shop/account/orders/${res.data.public_id}`);
      } else {
        setError("Formulation record found, but identifier is missing.");
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Order allocation not found. Please verify your formulation order number."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="border-b border-[#2D5A1E]/15 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Patron Account Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#172B15]">
            Order & Dispatch Tracking
          </h1>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Lookup Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#2D5A1E]/15 shadow-sm space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-[#639E1F]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-serif font-bold text-[#172B15]">
                Locate Active Batch Dispatch
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Enter your formulation allocation reference (e.g.,{" "}
                <code className="font-mono text-[#2D5A1E] font-bold">EMX-...</code>) to view live microbiological cold-chain verification, carrier transit milestones, and payment status.
              </p>
            </div>
          </div>

          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter reference (e.g. EMX-A1B2C3D4E5F6)"
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl pl-11 pr-4 py-3 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderQuery.trim()}
              className="px-6 py-3 rounded-2xl bg-[#172B15] hover:bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-[#172B15]/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locating Batch...</span>
                </>
              ) : (
                <>
                  <span>Track Allocation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Cold-Chain Transit Viability Notice */}
        <div className="p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#639E1F]" />
          </div>
          <div className="text-xs text-neutral-600 space-y-0.5">
            <span className="font-bold text-[#172B15] block">
              Cold-Chain Batch Viability Enforced
            </span>
            <span>
              All maXilin probiotic cultures are monitored under pharmaceutical cold-storage protocols from laboratory seal to final delivery.
            </span>
          </div>
        </div>

        {/* Boutique Catalog Link */}
        <div className="text-center pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#639E1F] hover:underline"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Return to Boutique Formulations</span>
          </Link>
        </div>

      </div>
    </div>
  );
}