// app/checkout/[checkout_id]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  Home,
  Briefcase,
  Building,
  Sparkles,
  Lock,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useCart } from "@/context/cart-context";
import {
  getCheckout,
  selectCheckoutAddress,
  confirmCheckout,
  CheckoutResponse,
} from "@/lib/services/checkoutService";
import {
  getCustomerAddresses,
  CustomerAddressResponse,
} from "@/lib/services/customerAddressService";
import { createOrderFromCheckout } from "@/lib/services/orderService";
import {
  createPaymentFromOrder,
  verifyPayment,
} from "@/lib/services/paymentService";
import { loadCashfreeSDK } from "@/lib/cashfree";

const LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home className="w-4 h-4" />,
  Office: <Briefcase className="w-4 h-4" />,
  Work: <Briefcase className="w-4 h-4" />,
  Clinic: <Building className="w-4 h-4" />,
};

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ checkout_id: string }>;
}) {
  const resolvedParams = use(params);
  const checkoutId = resolvedParams.checkout_id;

  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();
  const { refreshCart } = useCart();

  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddressResponse[]>([]);
  const [selectedAddressPublicId, setSelectedAddressPublicId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingAddress, setUpdatingAddress] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Expiry countdown timer string
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [isExpired, setIsExpired] = useState(false);

  // 1. Initial Load: Fetch Checkout & Saved Addresses
  useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      if (!isAuthenticated) {
        router.push(`/shop/auth/login?redirect=/checkout/${checkoutId}`);
        return;
      }

      setLoading(true);
      try {
        const [checkoutData, addressesData] = await Promise.all([
          getCheckout(checkoutId),
          getCustomerAddresses(),
        ]);

        setCheckout(checkoutData);
        setAddresses(addressesData);

        // Pre-select default address if not yet selected on the checkout
        if (!checkoutData.selected_address_id && addressesData.length > 0) {
          const defaultAddr = addressesData.find((a) => a.is_default) || addressesData[0];
          await handleAddressChange(defaultAddr.public_id);
        } else if (checkoutData.selected_address_id) {
          const active = addressesData.find((a) => a.is_default);
          if (active) setSelectedAddressPublicId(active.public_id);
        }
      } catch (err: any) {
        const detail = err.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Failed to load checkout details.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [checkoutId, isAuthenticated, authLoading, router]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!checkout?.expires_at) return;

    const interval = setInterval(() => {
      const remainingMs = new Date(checkout.expires_at).getTime() - Date.now();

      if (remainingMs <= 0) {
        setTimeLeft("00:00");
        setIsExpired(true);
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(
          `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [checkout?.expires_at]);

  // 3. Handle Selecting an Address
  const handleAddressChange = async (addressPublicId: string) => {
    setSelectedAddressPublicId(addressPublicId);
    setUpdatingAddress(true);
    setError(null);

    try {
      const updated = await selectCheckoutAddress(checkoutId, addressPublicId);
      setCheckout(updated);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to select shipping destination.");
    } finally {
      setUpdatingAddress(false);
    }
  };

  // 4. Confirm Checkout -> Create Order -> Cashfree SDK (v3) -> Verify Payment
  const handleConfirmAndPay = async () => {
    if (!selectedAddressPublicId) {
      setError("Please select a delivery address before confirming.");
      return;
    }

    setConfirming(true);
    setError(null);

    let createdOrderPublicId: string | null = null;

    try {
      // Step A: Lock Pricing
      setPaymentPhase("Locking pricing & inventory...");
      await confirmCheckout(checkoutId);

      // Step B: Create Order from Locked Checkout
      setPaymentPhase("Generating order reservation...");
      const order = await createOrderFromCheckout(checkoutId);
      createdOrderPublicId = order.public_id;

      // Step C: Refresh Cart in Background
      await refreshCart();

      // Step D: Initialize Payment Session via FastAPI Backend
      setPaymentPhase("Securing encrypted payment session...");
      const payment = await createPaymentFromOrder(order.public_id);

      // Guard: Ensure payment session ID was generated by the provider
      if (!payment?.payment_session_id) {
        throw new Error(
          "Payment session token was not generated by Cashfree. Please retry."
        );
      }

      // Step E: Load Initialized Cashfree SDK Instance
      setPaymentPhase("Launching Cashfree gateway...");
      const cashfree = await loadCashfreeSDK();

      // Step F: Mount Cashfree Drop-in / Modal Checkout
      cashfree.checkout({
        paymentSessionId: payment.payment_session_id,
        redirectTarget: "_modal",
      }).then(async (result: any) => {
        if (result.error) {
          setError(result.error.message || "Payment cancelled or incomplete.");
          setConfirming(false);
          setPaymentPhase(null);
          return;
        }

        // Step G: Verify Payment on Backend
        setPaymentPhase("Verifying transaction...");
        try {
          const verified = await verifyPayment(payment.public_id, {
            provider_payment_id: result.paymentDetails?.paymentMessage || undefined,
          });

          if (verified.status === "succeeded") {
            router.push(`/shop/account/orders/${order.public_id}?payment_success=true`);
          } else {
            router.push(`/shop/account/orders/${order.public_id}`);
          }
        } catch {
          // If verify API throws, fallback to order details page for polling/retry
          router.push(`/shop/account/orders/${order.public_id}`);
        }
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : detail?.message || err.message || "Could not complete order and payment setup."
      );
      setConfirming(false);
      setPaymentPhase(null);

      // If the order was created but payment launch failed, route to the created order
      if (createdOrderPublicId) {
        setTimeout(() => {
          router.push(`/shop/account/orders/${createdOrderPublicId}`);
        }, 1500);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold">
          Verifying Formulation Session...
        </p>
      </div>
    );
  }

  if (isExpired || checkout?.status === "expired") {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#172B15]">Session Expired</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The 30-minute reservation on these live probiotic formulations has expired. Please initiate a fresh checkout to reserve live inventory.
          </p>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full py-3.5 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all cursor-pointer"
          >
            Create New Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Live Countdown Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Cold-Chain Logistics
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#172B15]">
              Formulation Checkout
            </h1>
          </div>

          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white border border-[#2D5A1E]/20 shadow-sm text-xs font-mono">
            <Clock className="w-4 h-4 text-[#639E1F] animate-pulse" />
            <span className="text-neutral-500">Reserved for:</span>
            <span className="font-bold text-[#172B15]">{timeLeft}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Shipping Address Selector */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#172B15]">
                    1. Shipping Destination
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Select where your cold-chain shipment should be delivered.
                  </p>
                </div>
                <Link
                  href="/account/addresses"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#639E1F] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Address</span>
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#FAFAF7] border border-dashed border-neutral-300 space-y-3">
                  <MapPin className="w-6 h-6 text-neutral-400 mx-auto" />
                  <p className="text-xs text-neutral-500">No delivery addresses found in your account.</p>
                  <Link
                    href="/shop/account/addresses"
                    className="inline-block px-5 py-2 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Add Address Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressPublicId === addr.public_id;
                    return (
                      <div
                        key={addr.public_id}
                        onClick={() => handleAddressChange(addr.public_id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? "border-[#639E1F] bg-[#F2F8ED]/40 ring-1 ring-[#639E1F]"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#639E1F] bg-[#639E1F]" : "border-neutral-400"
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-[#172B15]">{addr.recipient_name}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-600">
                                {addr.label}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600">
                              {addr.address_line1}, {addr.city}, {addr.state} – {addr.postal_code}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-mono">Mobile: {addr.phone}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#639E1F] shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cold Chain Assurance Notice */}
            <div className="p-5 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-center space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#639E1F]" />
              </div>
              <div className="text-xs text-neutral-600 space-y-0.5">
                <span className="font-bold text-[#172B15] block">Guaranteed Viability Transit</span>
                <span>Probiotic cultures are sealed inside vacuum bio-insulated containers to ensure 1 Trillion CFU viability upon delivery.</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Confirm Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-serif font-bold text-[#172B15]">
                  2. Order Summary
                </h2>
                <p className="text-xs text-neutral-500">
                  {checkout?.items.length || 0} formulation items reserved
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {checkout?.items.map((item) => (
                  <div key={item.public_id} className="flex items-center justify-between text-xs py-2 border-b border-neutral-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center text-[#2D5A1E]">
                        <Sparkles className="w-3.5 h-3.5 text-[#8CC63F]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#172B15]">{item.product_name}</p>
                        <p className="text-[10px] text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-serif font-medium text-[#172B15]">
                      ₹{Number(item.subtotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 pt-2 text-xs text-neutral-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{Number(checkout?.subtotal || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cold-Chain Express Delivery</span>
                  <span className="text-[#639E1F] font-bold text-[10px] uppercase">Complimentary</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST & Formulation Taxes</span>
                  <span className="font-mono">₹{Number(checkout?.tax_amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-base font-serif text-[#172B15] pt-3 border-t border-neutral-100">
                  <span>Total Investment</span>
                  <span>₹{Number(checkout?.total_amount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Confirm & Place Order CTA */}
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={confirming || updatingAddress || !selectedAddressPublicId}
                className="w-full py-4 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-lg shadow-[#2D5A1E]/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {confirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{paymentPhase || "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Lock Price & Proceed to Payment</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-neutral-400">
                By confirming, you lock this batch allocation under 256-bit encrypted patron terms.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}