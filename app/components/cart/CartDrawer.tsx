"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Loader2
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
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
              <div className="p-6 bg-white border-b border-[#2D5A1E]/10 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#8CC63F]/15 flex items-center justify-center text-[#2D5A1E]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
                      Wellness Bag
                    </span>
                    <h2 className="text-base font-serif tracking-tight text-[#172B15]">
                      Your Formulations ({totalItems})
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-[#172B15] hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading && items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 space-y-3">
                    <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                      Synchronizing bag...
                    </p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white border border-[#2D5A1E]/15 flex items-center justify-center text-neutral-300 shadow-sm">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-light text-[#172B15]">Your bag is empty</h3>
                      <p className="text-xs text-neutral-500 max-w-xs">
                        Explore our probiotic formulations to elevate your body's microbiome balance.
                      </p>
                    </div>
                    <Link
                      href="/shop"
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2.5 rounded-full bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-sm"
                    >
                      Explore Catalog
                    </Link>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.public_id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-[#FAFAF7] border border-neutral-200/60 flex items-center justify-center text-[#2D5A1E] shrink-0">
                            <Sparkles className="w-5 h-5 text-[#8CC63F]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-[#172B15] line-clamp-1">
                              {item.name || "Microbiome Formulation"}
                            </h4>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              ₹{Number(item.unit_price).toLocaleString("en-IN")} each
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.public_id)}
                          className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quantity Stepper & Subtotal */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                        <div className="flex items-center space-x-2 bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.public_id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-[#172B15] disabled:opacity-40"
                            disabled={loading}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-[#172B15] px-2">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.public_id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-[#172B15] disabled:opacity-40"
                            disabled={loading || item.quantity >= 100}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-serif font-medium text-[#172B15]">
                          ₹{Number(item.subtotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {items.length > 0 && (
                <div className="p-6 bg-white border-t border-[#2D5A1E]/10 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Order Subtotal</span>
                      <span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Shipping & Cold-Chain Delivery</span>
                      <span className="text-[#639E1F] font-bold uppercase text-[10px]">Complimentary</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-serif text-[#172B15] pt-2 border-t border-neutral-100">
                      <span>Estimated Investment</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Link
                        href={isAuthenticated ? "/checkout" : "/shop/auth/login?redirect=/checkout"}
                        onClick={() => setIsOpen(false)}
                        className="w-full py-3.5 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#2D5A1E]/20"
                        >
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                        </Link>

                    <button
                      type="button"
                      onClick={() => clearCart()}
                      className="w-full py-2 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      Clear Bag
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#639E1F]" />
                    <span>Bio-preserved packaging guaranteed</span>
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