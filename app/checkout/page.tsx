// app/checkout/page.tsx
"use client";

import React, { useEffect, useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { createCheckout } from "@/lib/services/checkoutService";

export default function CheckoutEntryPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Guard against duplicate checkout initialization in React StrictMode
  const hasTriggeredRef = useRef<boolean>(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Wait until customer auth state is resolved
    if (authLoading) return;

    // Redirect guests to login immediately with redirect callback
    if (!isAuthenticated) {
      startTransition(() => {
        router.replace("/shop/auth/login?redirect=/checkout");
      });
      return;
    }

    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    let isMounted = true;

    async function initializeCheckout() {
      try {
        const checkout = await createCheckout();
        if (!isMounted) return;

        // Warm up and route immediately to the checkout session workspace
        startTransition(() => {
          router.replace(`/checkout/${checkout.public_id}`);
        });
      } catch (err: any) {
        if (!isMounted) return;
        const detail = err.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Unable to initiate checkout session.");
      }
    }

    initializeCheckout();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold text-[#172B15]">Checkout Unavailable</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                router.push("/shop");
              });
            }}
            className="w-full py-3 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all cursor-pointer shadow-xs"
          >
            Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold">
        Securing Checkout Session...
      </p>
    </div>
  );
}