// context/wishlist-context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  WishlistItem,
} from "@/lib/services/wishlistService";

interface WishlistContextType {
  wishlist: WishlistItem[];
  totalItems: number;
  loading: boolean;
  isInWishlist: (productSlugOrPublicId: string) => boolean;
  toggleWishlist: (productId: number, productSlugOrPublicId?: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const res = await getMyWishlist();
      setWishlist(res.items || []);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error("Failed to fetch customer wishlist:", err);
      }
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      refreshWishlist();
    }
  }, [authLoading, refreshWishlist]);

  // Fast lookup for product public_id or slug
  const isInWishlist = useCallback(
    (identifier: string) => {
      if (!identifier) return false;
      return wishlist.some(
        (item) =>
          item.product?.public_id === identifier ||
          item.product?.slug === identifier
      );
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (productId: number, identifier?: string): Promise<boolean> => {
      if (!isAuthenticated) {
        window.location.href = `/shop/auth/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
        return false;
      }

      // Check if item is already in local state
      const existingItem = wishlist.find(
        (i) =>
          (identifier && (i.product?.public_id === identifier || i.product?.slug === identifier)) ||
          (productId > 0 && ((i.product as any)?.id === productId || (i as any)?.product_id === productId))
      );

      const currentlyIn = Boolean(existingItem);

      // Resolve numeric ID
      const targetNumericId =
        productId > 0
          ? productId
          : (existingItem?.product as any)?.id ||
            (existingItem as any)?.product_id ||
            0;

      try {
        if (currentlyIn) {
          // Optimistic remove
          setWishlist((prev) =>
            prev.filter(
              (i) =>
                (identifier ? (i.product?.public_id !== identifier && i.product?.slug !== identifier) : true) &&
                (targetNumericId > 0 ? (i.product as any)?.id !== targetNumericId && (i as any)?.product_id !== targetNumericId : true)
            )
          );

          if (targetNumericId > 0) {
            try {
              await removeFromWishlist(targetNumericId);
            } catch (err: any) {
              if (err.response?.status !== 404) {
                console.error("Failed to remove item from wishlist:", err);
              }
            }
          }
          return false;
        } else {
          if (targetNumericId <= 0) {
            console.error("Cannot add to wishlist: Invalid numeric product ID.");
            return false;
          }

          // Optimistically show as added
          const res = await addToWishlist(targetNumericId);
          if (res.item) {
            // Attach numeric ID onto item.product so second click can read it
            const enrichedItem: WishlistItem = {
              ...res.item,
              product: {
                ...res.item.product,
                id: targetNumericId,
              } as any,
            };
            setWishlist((prev) => [enrichedItem, ...prev]);
          } else {
            await refreshWishlist();
          }
          return true;
        }
      } catch (err) {
        console.error("Wishlist toggle failure:", err);
        await refreshWishlist();
        return currentlyIn;
      }
    },
    [isAuthenticated, wishlist, refreshWishlist]
  );

  const value = useMemo(
    () => ({
      wishlist,
      totalItems: wishlist.length,
      loading,
      isInWishlist,
      toggleWishlist,
      refreshWishlist,
    }),
    [wishlist, loading, isInWishlist, toggleWishlist, refreshWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};