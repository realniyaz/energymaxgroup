// app/shop/account/wishlist/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Home,
  Loader2,
} from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCustomerAuth } from "@/context/customer-auth-context";

export default function CustomerWishlistPage() {
  const { authLoading } = useCustomerAuth() as any;
  const { wishlist, loading, toggleWishlist } = useWishlist();

  if (authLoading || (loading && wishlist.length === 0)) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold">
          Loading Saved Products...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-8 sm:py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-3 pb-2">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white border border-[#2D5A1E]/15 text-xs font-semibold text-[#172B15] hover:bg-[#F2F8ED] transition-all shadow-xs"
          >
            <Home className="w-3.5 h-3.5 text-[#639E1F] shrink-0" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#2D5A1E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#172B15] transition-all shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>Browse Catalog</span>
          </Link>
        </div>

        {/* Page Title */}
        <div className="border-b border-[#2D5A1E]/15 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Customer Sanctuary
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#172B15]">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Keep track of custom formulations and items for your regimen.
          </p>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#2D5A1E]/15 shadow-sm text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500">
              <Heart className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#172B15]">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Explore our laboratory-tested collections and save your favorite formulations for later.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#172B15] transition-all shadow-md"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Grid View of Wishlist Items */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const product = item.product;
              const numericPrice = product?.price ? Number(product.price) : 0;
              const numericMrp = product?.mrp ? Number(product.mrp) : 0;
              
              // Resolve numeric product ID correctly
              const resolvedProductId =
                (product as any)?.id ||
                (item as any)?.product_id ||
                0;

              return (
                <div
                  key={item.public_id}
                  className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Image Area */}
                    <Link
                      href={`/shop/${product?.slug || product?.public_id}`}
                      className="relative w-full h-[220px] bg-[#F2F8ED]/60 flex items-center justify-center p-4 border-b border-[#2D5A1E]/10 block"
                    >
                      <Image
                        src={product?.primary_image_url || "/prod1.png"}
                        alt={product?.name || "Product Image"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                      />
                    </Link>

                    {/* Content Details */}
                    <div className="p-5 space-y-2">
                      <Link href={`/shop/${product?.slug || product?.public_id}`}>
                        <h3 className="text-base font-medium text-[#172B15] group-hover:text-[#639E1F] transition-colors line-clamp-1">
                          {product?.name}
                        </h3>
                      </Link>

                      <div className="flex items-baseline space-x-2">
                        <span className="text-base font-serif font-bold text-[#172B15]">
                          ₹{numericPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        {numericMrp > numericPrice && (
                          <span className="text-xs text-neutral-400 line-through">
                            ₹{numericMrp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-5 pt-0 flex items-center gap-2">
                    <Link
                      href={`/shop/${product?.slug || product?.public_id}`}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#172B15] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 hover:bg-[#2D5A1E] transition-colors"
                    >
                      <span>View Item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => toggleWishlist(resolvedProductId, product?.public_id)}
                      className="p-2.5 rounded-xl border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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