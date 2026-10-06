// app/shop/account/orders/[order_id]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Lock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { getOrderTracking, OrderTrackingResponse } from "@/lib/services/orderService";
import {
  createPaymentFromOrder,
  verifyPayment,
  requestRefund,
  PaymentResponse,
} from "@/lib/services/paymentService";
import { loadCashfreeSDK } from "@/lib/cashfree";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.order_id;

  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccessQuery = searchParams.get("payment_success") === "true";

  const { isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [order, setOrder] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment states
  const [retryingPayment, setRetryingPayment] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<string | null>(null);

  // Refund states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundMessage, setRefundMessage] = useState<string | null>(null);

  const fetchTracking = async () => {
    try {
      const data = await getOrderTracking(orderId);
      setOrder(data);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to retrieve order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/shop/auth/login?redirect=/shop/account/orders/${orderId}`);
      return;
    }
    fetchTracking();
  }, [orderId, isAuthenticated, authLoading, router]);

  // Retry Payment via Cashfree
  const handleRetryPayment = async () => {
    setRetryingPayment(true);
    setError(null);

    try {
      setPaymentPhase("Initializing payment gateway...");
      const payment: PaymentResponse = await createPaymentFromOrder(orderId);

      if (!payment.payment_session_id) {
        throw new Error("Missing Cashfree payment session.");
      }

      const CashfreeSDK = await loadCashfreeSDK();
      const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
      const cashfree = CashfreeSDK({ mode: isProduction ? "production" : "sandbox" });

      cashfree.checkout({
        paymentSessionId: payment.payment_session_id,
        redirectTarget: "_modal",
      }).then(async (result: any) => {
        if (result.error) {
          setError(result.error.message || "Payment cancelled.");
          setRetryingPayment(false);
          setPaymentPhase(null);
          return;
        }

        setPaymentPhase("Verifying transaction...");
        await verifyPayment(payment.public_id, {
          provider_payment_id: result.paymentDetails?.paymentMessage || undefined,
        });

        await fetchTracking();
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Payment attempt failed.");
    } finally {
      setRetryingPayment(false);
      setPaymentPhase(null);
    }
  };

  // Submit Refund
  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRefund(true);
    setError(null);

    try {
      // Fetch or use payment reference
      const payment: PaymentResponse = await createPaymentFromOrder(orderId);

      await requestRefund(payment.public_id, {
        amount: refundAmount ? parseFloat(refundAmount) : undefined,
        reason: refundReason.trim() || undefined,
      });

      setRefundMessage("Refund initiated successfully with payment provider.");
      setShowRefundModal(false);
      await fetchTracking();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to initiate refund.");
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold">
          Consulting Batch Dispatch Logistics...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-4">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-[#172B15]">Order Not Found</h2>
          <p className="text-xs text-neutral-500">We could not locate this order allocation.</p>
          <Link
            href="/shop"
            className="inline-block px-5 py-2.5 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider"
          >
            Return to Boutique
          </Link>
        </div>
      </div>
    );
  }

  const isPending = order.current_status === "pending_payment";
  const isPaid = order.current_status === "paid";

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
          <div className="space-y-1">
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] flex items-center space-x-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Boutique</span>
            </Link>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#172B15]">
                Order <span className="font-mono text-[#639E1F]">{order.order_number}</span>
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPaid ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40" : "bg-amber-100 text-amber-800"
              }`}>
                {order.current_status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            {isPending && (
              <button
                onClick={handleRetryPayment}
                disabled={retryingPayment}
                className="px-5 py-2.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {retryingPayment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{paymentPhase || "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Complete Payment</span>
                  </>
                )}
              </button>
            )}

            {isPaid && (
              <button
                onClick={() => setShowRefundModal(true)}
                className="px-4 py-2 rounded-2xl bg-white border border-[#2D5A1E]/20 text-neutral-600 hover:text-red-700 hover:border-red-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Request Refund</span>
              </button>
            )}
          </div>
        </div>

        {paymentSuccessQuery && (
          <div className="p-4 rounded-2xl bg-[#8CC63F]/15 border border-[#8CC63F]/40 text-[#172B15] text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-[#2D5A1E] shrink-0" />
            <span>Payment successfully confirmed. Laboratory batch preparation has commenced.</span>
          </div>
        )}

        {refundMessage && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{refundMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Cold-Chain Dispatch Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#172B15]">
                Logistics & Formulation Timeline
              </h2>
              <p className="text-xs text-neutral-500">
                Live verification of cold-chain microbiology preparation and dispatch.
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#639E1F]" />
          </div>

          <div className="relative pl-6 border-l-2 border-[#2D5A1E]/15 space-y-8 my-4">
            {order.timeline.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Node icon */}
                <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                  step.current
                    ? "border-[#639E1F] bg-[#639E1F] ring-4 ring-[#8CC63F]/20"
                    : "border-[#2D5A1E]/30"
                }`}>
                  {step.current && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${step.current ? "text-[#2D5A1E]" : "text-neutral-700"}`}>
                      {step.label}
                    </span>
                    {step.timestamp && (
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(step.timestamp).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  {step.note && <p className="text-xs text-neutral-500">{step.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Probiotic Transit Viability Guarantee */}
        <div className="p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#639E1F]" />
          </div>
          <div className="text-xs text-neutral-600 space-y-0.5">
            <span className="font-bold text-[#172B15] block">Batch Quality Verification</span>
            <span>All maXilin formulations are dispatched with serialized temperature indicators guaranteeing 1 Trillion CFU cellular potency.</span>
          </div>
        </div>

      </div>

      {/* REFUND MODAL */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#172B15]">Request Payment Refund</h3>
            <p className="text-xs text-neutral-500">
              Submit a refund request for Order #{order.order_number}. Cashfree reconciliation will process the reversal.
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Refund Amount (Optional, leave blank for full refund)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Full Amount"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2.5 text-xs text-[#172B15]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-500">
                  Reason for Refund
                </label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Detail the reason for return or cancellation..."
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2 text-xs text-[#172B15]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="px-5 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold hover:bg-[#2D5A1E] disabled:opacity-50 cursor-pointer"
                >
                  {submittingRefund ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}