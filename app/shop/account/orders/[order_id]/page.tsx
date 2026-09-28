// app/shop/account/orders/[order_id]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { customerClient } from "@/lib/customer-client";
import { OrderResponse } from "@/lib/services/orderService";

const STATUS_STEPS = [
  { key: "pending_payment", label: "Confirmed", icon: CheckCircle2 },
  { key: "paid", label: "Payment Verified", icon: CreditCard },
  { key: "processing", label: "Cold-Chain Prep", icon: Sparkles },
  { key: "dispatched", label: "In Transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.order_id;

  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (authLoading) return;
      if (!isAuthenticated) {
        router.push(`/shop/auth/login?redirect=/shop/account/orders/${orderId}`);
        return;
      }

      setLoading(true);
      try {
        const res = await customerClient.get<OrderResponse>(
          `/api/v1/shop/orders/${orderId}`
        );
        setOrder(res.data);
      } catch (err: any) {
        const detail = err.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Unable to retrieve order details.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId, isAuthenticated, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold">
          Retrieving Order Records...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold text-[#172B15]">Order Not Found</h2>
          <p className="text-xs text-neutral-500">{error || "Invalid order reference ID."}</p>
          <Link
            href="/shop"
            className="inline-block w-full py-3 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentStepIndex = Math.max(
    0,
    STATUS_STEPS.findIndex((s) => s.key === order.status)
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/shop/account/orders"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] transition-colors"
          >
            &larr; All Orders
          </Link>
          <span className="text-[10px] font-mono uppercase bg-white border border-[#2D5A1E]/15 px-3 py-1 rounded-full text-neutral-600">
            Encrypted Order Record
          </span>
        </div>

        {/* Order Success Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-[#2D5A1E]/15 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#639E1F]" />
                <span>Formulation Order Secured</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#172B15]">
                Order {order.order_number}
              </h1>
              <p className="text-xs text-neutral-500 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Placed on {orderDate} for {order.customer_name}</span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
                Total Allocated
              </span>
              <span className="text-2xl font-serif font-bold text-[#172B15]">
                ₹{Number(order.total_amount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Fulfillment Stepper */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-4">
              Cold-Chain Tracking Timeline
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {STATUS_STEPS.map((step, idx) => {
                const IconComponent = step.icon;
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-2xl border text-center space-y-1.5 transition-all ${
                      isCurrent
                        ? "bg-[#F2F8ED] border-[#639E1F] ring-1 ring-[#639E1F]"
                        : isPassed
                        ? "bg-white border-[#2D5A1E]/20"
                        : "bg-white/40 border-neutral-100 opacity-40"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto ${
                        isPassed
                          ? "bg-[#2D5A1E] text-white"
                          : "bg-neutral-200 text-neutral-400"
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold block text-[#172B15]">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 2-Column Order Specification Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Order Items Breakdown */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h2 className="text-lg font-serif font-bold text-[#172B15]">
                Reserved Formulations ({order.items.length})
              </h2>
              <p className="text-xs text-neutral-500">
                1 Trillion CFU batches prepared under sterile nitrogen-sealed conditions.
              </p>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.public_id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#2D5A1E]">
                      <Sparkles className="w-4 h-4 text-[#8CC63F]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#172B15]">{item.product_name}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        ₹{Number(item.unit_price).toLocaleString("en-IN")} × {item.quantity} units
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-serif font-semibold text-[#172B15]">
                    ₹{Number(item.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Ledger */}
            <div className="space-y-2 pt-4 border-t border-neutral-100 text-xs text-neutral-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-mono">₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cold-Chain Express Shipping</span>
                <span className="text-[#639E1F] font-bold uppercase text-[10px]">Complimentary</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GST & Statutory Taxes</span>
                <span className="font-mono">₹{Number(order.tax_amount).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-base font-serif text-[#172B15] pt-3 border-t border-neutral-100">
                <span>Total Amount</span>
                <span>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Shipping Snapshot & Contact */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-4">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172B15]">
                  Shipping Snapshot
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAFAF7] border text-neutral-600">
                  {order.shipping_address_snapshot.label || "Delivery"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-600">
                <p className="font-bold text-[#172B15] text-sm">
                  {order.shipping_address_snapshot.recipient_name}
                </p>
                <p>{order.shipping_address_snapshot.address_line1}</p>
                {order.shipping_address_snapshot.address_line2 && (
                  <p>{order.shipping_address_snapshot.address_line2}</p>
                )}
                {order.shipping_address_snapshot.landmark && (
                  <p className="text-neutral-400">Landmark: {order.shipping_address_snapshot.landmark}</p>
                )}
                <p className="font-semibold text-[#172B15]">
                  {order.shipping_address_snapshot.city}, {order.shipping_address_snapshot.state} –{" "}
                  {order.shipping_address_snapshot.postal_code}
                </p>
                <p className="text-[11px] text-neutral-400 uppercase tracking-widest pt-1">
                  {order.shipping_address_snapshot.country}
                </p>
                <p className="font-mono text-neutral-500 pt-1">
                  Phone: {order.shipping_address_snapshot.phone}
                </p>
              </div>
            </div>

            {/* Quality & Security Badge */}
            <div className="p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-start space-x-3.5">
              <ShieldCheck className="w-5 h-5 text-[#639E1F] shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-600 space-y-1">
                <span className="font-bold text-[#172B15] block">Quality Control Dispatch</span>
                <p className="text-[11px] leading-relaxed">
                  Every order includes individual lot test certificates verifying strain purity and CFU viability.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}