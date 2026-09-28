"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useCustomerAuth } from "./customer-auth-context";
import * as guestCartService from "@/lib/services/guestCartService";
import * as customerCartService from "@/lib/services/customerCartService";

export interface UnifiedCartItem {
  public_id: string;
  product_public_id: string;
  name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface CartContextType {
  items: UnifiedCartItem[];
  totalItems: number;
  subtotal: number;
  loading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (productPublicId: string, quantity?: number, fallbackName?: string, fallbackPrice?: number) => Promise<void>;
  updateQuantity: (itemPublicId: string, quantity: number) => Promise<void>;
  removeItem: (itemPublicId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();
  const [items, setItems] = useState<UnifiedCartItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Synchronize cart items depending on auth mode
  const refreshCart = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);

    try {
      if (isAuthenticated) {
        // Authenticated customer cart
        const cart = await customerCartService.getCustomerCart();
        const formatted: UnifiedCartItem[] = cart.items.map((i) => {
          const unit = Number(i.unit_price) || 0;
          return {
            public_id: i.public_id,
            product_public_id: i.product_public_id,
            name: "Formulation Item",
            quantity: i.quantity,
            unit_price: unit,
            subtotal: unit * i.quantity,
          };
        });

        setItems(formatted);
        setTotalItems(cart.total_items || 0);
        setSubtotal(Number(cart.subtotal) || 0);
      } else {
        // Guest cart
        const cart = await guestCartService.getGuestCart();
        const formatted: UnifiedCartItem[] = cart.items.map((i) => ({
          public_id: i.public_id,
          product_public_id: i.product_public_id,
          name: i.product_name,
          quantity: i.quantity,
          unit_price: Number(i.unit_price) || 0,
          subtotal: Number(i.subtotal) || 0,
        }));

        setItems(formatted);
        setTotalItems(cart.total_items || 0);
        setSubtotal(Number(cart.total_amount) || 0);
      }
    } catch (err) {
      console.error("Cart synchronization error:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Merge Guest Cart into Customer Cart on initial sign-in
  useEffect(() => {
    async function handleAuthTransition() {
      if (isAuthenticated) {
        setLoading(true);
        try {
          await customerCartService.mergeGuestCartIntoCustomerCart();
        } catch (err) {
          console.warn("Cart auto-merge warning:", err);
        } finally {
          await refreshCart();
        }
      } else if (!authLoading) {
        await refreshCart();
      }
    }

    handleAuthTransition();
  }, [isAuthenticated, authLoading, refreshCart]);

  // Add Item
  const addItem = async (
    productPublicId: string,
    quantity: number = 1,
    fallbackName?: string,
    fallbackPrice?: number
  ) => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        await customerCartService.addCustomerCartItem(productPublicId, quantity);
      } else {
        await guestCartService.addGuestCartItem(productPublicId, quantity);
      }
      await refreshCart();
      setIsOpen(true); // Open drawer to show product added
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Could not add item to cart.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // Update Quantity
  const updateQuantity = async (itemPublicId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemPublicId);
      return;
    }

    setLoading(true);
    try {
      if (isAuthenticated) {
        await customerCartService.updateCustomerCartItem(itemPublicId, quantity);
      } else {
        await guestCartService.updateGuestCartItem(itemPublicId, quantity);
      }
      await refreshCart();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Could not update item quantity.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // Remove Item
  const removeItem = async (itemPublicId: string) => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        await customerCartService.removeCustomerCartItem(itemPublicId);
      } else {
        await guestCartService.removeGuestCartItem(itemPublicId);
      }
      await refreshCart();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Could not remove item from cart.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // Clear Cart
  const clearCart = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        await customerCartService.clearCustomerCart();
      } else {
        await guestCartService.clearGuestCart();
      }
      setItems([]);
      setTotalItems(0);
      setSubtotal(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        loading,
        isOpen,
        setIsOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};