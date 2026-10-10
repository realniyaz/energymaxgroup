"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Loader2,
  PackageCheck
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useCustomerAuth } from "@/context/customer-auth-context";

export default function CartDrawer() {
  const { 
    items, 
    totalItems, 
    subtotal, 
    isOpen, 
    setIsOpen, 
    updateQuantity, 
    removeItem, 
    clearCart,
    loading 
  } = useCart();
  
  const { isAuthenticated } = useCustomerAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-[#FAFAF7] text-[#172B15] shadow-2xl flex flex-col justify-between border-l border-[#2D5A1E]/15"
            >
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 bg-white border-b border-[#2D5A1E]/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-[#639E1F]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#172B15] tracking-tight">
                      Your Cart
                    </h2>
                    <span className="text-xs text-neutral-500 font-medium">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close cart"
                  className="p-2 rounded-xl text-neutral-400 hover:text-[#172B15] hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List Area */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
                {loading && items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-24 space-y-3">
                    <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Loading your items...
                    </p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-[#2D5A1E]/15 flex items-center justify-center text-neutral-300 shadow-sm">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-[#172B15]">Your cart is empty</h3>
                      <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                        Explore our products to find the right supplements for your daily health routine.
                      </p>
                    </div>
                    <Link
                      href="/shop"
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-3 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#172B15] transition-all shadow-md"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  items.map((item) => {
                    const unitPrice = Number(item.unit_price) || 0;
                    const itemSubtotal = Number(item.subtotal) || unitPrice * item.quantity;

                    return (
                      <motion.div
                        key={item.public_id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-[#172B15] truncate">
                              {item.name || "Product"}
                            </h4>
                            <span className="text-[11px] text-neutral-500 font-mono block">
                              ₹{unitPrice.toLocaleString("en-IN")} each
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.public_id)}
                            className="text-neutral-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quantity Stepper & Subtotal */}
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                          <div className="flex items-center space-x-2 bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.public_id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-[#172B15] disabled:opacity-40 cursor-pointer"
                              disabled={loading}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-[#172B15] px-2 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.public_id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-[#172B15] disabled:opacity-40 cursor-pointer"
                              disabled={loading || item.quantity >= 99}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-[#172B15]">
                            ₹{itemSubtotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {items.length > 0 && (
                <div className="p-5 sm:p-6 bg-white border-t border-[#2D5A1E]/10 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold text-[#172B15]">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>Shipping</span>
                      <span className="text-[#639E1F] font-bold uppercase text-[11px]">Free</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-bold text-[#172B15] pt-2 border-t border-neutral-100">
                      <span>Total</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <Link
                      href={isAuthenticated ? "/checkout" : "/shop/auth/login?redirect=/checkout"}
                      onClick={() => setIsOpen(false)}
                      className="w-full py-4 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#172B15] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#2D5A1E]/15 cursor-pointer"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => clearCart()}
                      className="w-full py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Clear Cart
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-500 pt-1">
                    <ShieldCheck className="w-4 h-4 text-[#639E1F]" />
                    <span>Safe packaging & cold-chain delivery</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}