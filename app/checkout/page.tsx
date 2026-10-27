// app/checkout/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { createCheckout } from "@/lib/services/checkoutService";

export default function CheckoutEntryPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();
  const [error, setError] = useState<string | null>(null);
  const [isEmptyCart, setIsEmptyCart] = useState<boolean>(false);

  // Guard against duplicate execution in React StrictMode
  const hasTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Wait until customer authentication resolves
    if (authLoading) return;

    // 2. Redirect guests to login immediately with return callback
    if (!isAuthenticated) {
      router.replace("/shop/auth/login?redirect=/checkout");
      return;
    }

    // 3. Prevent duplicate requests in StrictMode
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    let isMounted = true;

    async function initializeCheckout() {
      try {
        const checkout = await createCheckout();

        if (!isMounted) return;

        if (checkout?.public_id) {
          router.replace(`/checkout/${checkout.public_id}`);
        } else {
          throw new Error("No checkout session ID received from server.");
        }
      } catch (err: any) {
        if (!isMounted) return;

        // Reset guard so user can retry
        hasTriggeredRef.current = false;

        const detail = err.response?.data?.detail;
        const message =
          typeof detail === "string"
            ? detail
            : detail?.[0]?.msg || err.message || "Unable to initiate checkout session.";

        if (message.toLowerCase().includes("empty")) {
          setIsEmptyCart(true);
        } else {
          setError(message);
        }
      }
    }

    initializeCheckout();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading, router]);

  // View: Empty Cart State
  if (isEmptyCart) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7 text-[#639E1F]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-serif font-bold text-[#172B15]">
              Your Cart is Empty
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              You must have at least one formulation in your shopping bag before initiating checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="w-full py-3.5 rounded-2xl bg-[#172B15] hover:bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <span>Explore Formulations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // View: Backend or Validation Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-serif font-bold text-[#172B15]">
              Checkout Unavailable
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">{error}</p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                hasTriggeredRef.current = false;
                window.location.reload();
              }}
              className="w-full py-3.5 rounded-2xl bg-[#2D5A1E] hover:bg-[#234717] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Retry Checkout
            </button>
            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View: Loading State
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold">
        Securing Checkout Session...
      </p>
    </div>
  );
}