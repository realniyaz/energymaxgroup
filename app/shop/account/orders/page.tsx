// app/shop/account/orders/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Calendar,
  ArrowRight,
  Loader2,
  Clock,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { customerClient } from "@/lib/customer-client";
import { OrderResponse } from "@/lib/services/orderService";

export default function CustomerOrdersListPage() {
  const router = useRouter();
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (authLoading) return;
      if (!isAuthenticated) {
        router.push("/shop/auth/login?redirect=/shop/account/orders");
        return;
      }

      setLoading(true);
      try {
        const res = await customerClient.get<{ orders: OrderResponse[] }>(
          "/api/v1/shop/orders"
        );
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Orders list fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold">
          Loading Orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Formulation History
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#172B15]">
              My Orders & Strains
            </h1>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] shadow-sm transition-all"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
              <Package className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-[#172B15]">No orders placed yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Explore our clinically formulated superprobiotic strains to place your first reservation.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 rounded-full bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const dateStr = new Date(o.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={o.public_id}
                  className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2D5A1E]/30 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-serif font-bold text-[#172B15] text-base">
                        {o.order_number}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E]">
                        {o.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-neutral-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                      </span>
                      <span>&bull;</span>
                      <span>{o.items?.length || 0} items</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-6 pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                        Amount
                      </span>
                      <span className="text-base font-serif font-bold text-[#172B15]">
                        ₹{Number(o.total_amount).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <Link
                      href={`/shop/account/orders/${o.public_id}`}
                      className="px-4 py-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs font-bold text-[#172B15] hover:border-[#639E1F] flex items-center space-x-1.5 transition-all"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#639E1F]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}