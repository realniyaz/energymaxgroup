// components/shop/WishlistHeartButton.tsx
"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";

interface WishlistHeartButtonProps {
  productId: number;
  productIdentifier: string; // product.public_id or slug
  className?: string;
  iconClassName?: string;
}

export default function WishlistHeartButton({
  productId,
  productIdentifier,
  className = "",
  iconClassName = "w-4 h-4",
}: WishlistHeartButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const active = isInWishlist(productIdentifier);
  const [animating, setAnimating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAnimating(true);
    // Cycle: First click adds -> Second click removes
    await toggleWishlist(productId, productIdentifier);
    setTimeout(() => setAnimating(false), 250);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md active:scale-90 ${
        active
          ? "bg-red-50/95 border-red-200 text-red-500 shadow-sm"
          : "bg-white/90 border-[#2D5A1E]/15 text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-white shadow-xs"
      } ${animating ? "scale-125" : "scale-100"} ${className}`}
    >
      <Heart
        className={`${iconClassName} transition-colors ${
          active ? "fill-red-500 text-red-500" : "fill-transparent"
        }`}
      />
    </button>
  );
}