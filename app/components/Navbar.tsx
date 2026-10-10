// components/Navbar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  MapPin,
  ChevronDown,
  User,
  Menu,
  X,
  HelpCircle,
  Download,
  BookOpen,
  Globe,
  LogOut,
  Package,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  ArrowBigRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useCart } from "@/context/cart-context";
import CartDrawer from "./cart/CartDrawer";

// Demographic Collections for Products Dropdown
const productCategories = [
  {
    title: "Men's Vitality",
    description: "Targeted endurance & metabolic probiotics",
    href: "/shop/men",
  },
  {
    title: "Women's Harmony",
    description: "Gut-skin barrier & hormonal balance",
    href: "/shop/women",
  },
  {
    title: "Kids & Growth",
    description: "Gentle daily microflora & immunity",
    href: "/shop/kids",
  },
  {
    title: "Family Bundles",
    description: "All-in-one household wellness packs",
    href: "/shop/family",
  },
  {
    title: "Senior / Old Age",
    description: "High-CFU support for older adults",
    href: "/shop/senior",
  },
];

export default function LuxuryNavbar() {
  const { customer, logout } = useCustomerAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();

  // Navigation UI states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Delivery Pincode Modal states
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [activePincode, setActivePincode] = useState<string | null>(null);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Hydration safety check
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load saved delivery pincode from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedPin = localStorage.getItem("em_delivery_pincode");
    const savedLoc = localStorage.getItem("em_delivery_location");
    if (savedPin) {
      setActivePincode(savedPin);
      setActiveLocation(savedLoc || "India");
    }

    // Close user dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Delivery Pincode Verification & Storage
  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeError(null);

    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPincodeError("Please enter a valid 6-digit Indian postal PIN code.");
      return;
    }

    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      const data = await res.json();

      if (data && data[0]?.Status === "Success") {
        const district = data[0]?.PostOffice?.[0]?.District || "Verified Location";
        const state = data[0]?.PostOffice?.[0]?.State || "";
        const locationName = `${district}${state ? `, ${state}` : ""}`;

        setActivePincode(cleanPin);
        setActiveLocation(locationName);
        localStorage.setItem("em_delivery_pincode", cleanPin);
        localStorage.setItem("em_delivery_location", locationName);
        setIsPincodeModalOpen(false);
        setPincode("");
      } else {
        setActivePincode(cleanPin);
        setActiveLocation("Standard Express Hub");
        localStorage.setItem("em_delivery_pincode", cleanPin);
        localStorage.setItem("em_delivery_location", "Standard Express Hub");
        setIsPincodeModalOpen(false);
        setPincode("");
      }
    } catch {
      setActivePincode(cleanPin);
      setActiveLocation("Express Shipping Area");
      localStorage.setItem("em_delivery_pincode", cleanPin);
      localStorage.setItem("em_delivery_location", "Express Shipping Area");
      setIsPincodeModalOpen(false);
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleResetPincode = () => {
    setActivePincode(null);
    setActiveLocation(null);
    localStorage.removeItem("em_delivery_pincode");
    localStorage.removeItem("em_delivery_location");
    setIsPincodeModalOpen(false);
  };

  return (
    <>
      <header className="w-full sticky top-0 z-40 shadow-sm font-sans">
        {/* =========================================================
            TIER 1: TOP UTILITY BAR (Deep Forest Tone)
           ========================================================= */}
        <div className="bg-[#1C3119] text-[#F2F7EC] text-xs py-2 px-4 sm:px-8 lg:px-12 border-b border-[#2D5A1E]/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left Utility Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="/privacy-policy" className="flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
                <ArrowBigRight className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="font-medium tracking-wider uppercase text-[10px]">Privacy Policy</span>
              </a>
              <span className="text-white/20">&bull;</span>
              <a href="/terms-and-conditions" className="flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="font-medium tracking-wider uppercase text-[10px]">Terms of Service</span>
              </a>
              <span className="text-white/20">&bull;</span>
              <Link href="/about-us" className="flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
                <Globe className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="font-medium tracking-wider uppercase text-[10px]">About EnergyMax</span>
              </Link>
            </div>

            <div className="flex md:hidden items-center text-[10px] text-white/80 tracking-wider uppercase font-medium">
              <span>Global Wellness Enterprise</span>
            </div>

            {/* Right Utility Controls */}
            <div className="flex items-center justify-end space-x-3 sm:space-x-6 text-[11px]">
              
              {/* PINCODE / DELIVERY SELECTOR BUTTON */}
              <button suppressHydrationWarning
                type="button"
                onClick={() => setIsPincodeModalOpen(true)}
                className="flex items-center space-x-1.5 text-neutral-200 hover:text-[#8CC63F] transition-colors cursor-pointer group"
              >
                <MapPin className="w-3.5 h-3.5 text-[#8CC63F] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-medium tracking-wide">
                  {mounted && activePincode ? (
                    <span className="text-[#8CC63F]">
                      Deliver to: <span className="font-mono font-bold text-white underline underline-offset-4">{activePincode}</span>
                    </span>
                  ) : (
                    <span className="underline underline-offset-4 decoration-[#8CC63F]/50">
                      Select delivery address
                    </span>
                  )}
                </span>
              </button>

              <span className="text-white/20 hidden sm:inline">&bull;</span>

              <Link
                href="/help-centre"
                className="hidden sm:flex items-center space-x-1 hover:text-[#8CC63F] transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="font-medium">Help Centre</span>
              </Link>

              <span className="text-white/20 hidden sm:inline">&bull;</span>

              {/* DYNAMIC CUSTOMER AUTH BUTTON / ACCOUNT DROPDOWN */}
              {mounted && customer ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-[11px] transition-all cursor-pointer border border-white/15"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#8CC63F] text-[#172B15] flex items-center justify-center font-bold text-[9px]">
                      {customer.first_name?.[0]?.toUpperCase() || "C"}
                    </div>
                    <span className="max-w-[100px] truncate text-[#8CC63F] font-bold">
                      {customer.first_name}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Account Popover Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white text-[#172B15] rounded-2xl shadow-2xl border border-[#2D5A1E]/15 p-2 z-50 overflow-hidden"
                      >
                        <div className="px-3.5 py-3 border-b border-neutral-100 bg-[#FAFAF7] rounded-xl mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#639E1F]">
                            Direct Client
                          </p>
                          <p className="text-xs font-bold text-[#172B15] truncate">
                            {customer.first_name} {customer.last_name || ""}
                          </p>
                          <p className="text-[10px] text-neutral-500 truncate font-mono">
                            {customer.email || customer.phone || `@${customer.username}`}
                          </p>
                        </div>

                        <div className="space-y-0.5 py-1 text-xs">
                          <Link
                            href="/account/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-[#F2F8ED] text-neutral-700 hover:text-[#172B15] transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-[#639E1F]" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            href="/account/addresses"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-[#F2F8ED] text-neutral-700 hover:text-[#172B15] transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#639E1F]" />
                            <span>Saved Delivery Addresses</span>
                          </Link>
                          <Link
                            href="/shop/account/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-[#F2F8ED] text-neutral-700 hover:text-[#172B15] transition-colors"
                          >
                            <Package className="w-3.5 h-3.5 text-[#639E1F]" />
                            <span>My Orders & Strains</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsPincodeModalOpen(true);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-[#F2F8ED] text-neutral-700 hover:text-[#172B15] transition-colors text-left"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#639E1F]" />
                            <span>Manage Delivery Pincode</span>
                          </button>
                        </div>

                        <div className="pt-1 mt-1 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-xs font-semibold cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/shop/auth/login"
                  className="flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#8CC63F] text-[#172B15] font-bold tracking-wider uppercase text-[10px] shadow-sm hover:bg-[#7AB82A] transition-all cursor-pointer"
                >
                  <User className="w-3 h-3" />
                  <span>Sign In</span>
                </Link>
              )}

            </div>
          </div>
        </div>

        {/* =========================================================
            TIER 2: MAIN BRAND NAVIGATION BAR
           ========================================================= */}
        <div className="bg-[#FAFAF7]/95 backdrop-blur-xl border-b border-[#2D5A1E]/10 px-4 sm:px-8 lg:px-12 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Brand Logo & Typography */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-2.5 group">
              <div className="relative w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center">
                <Image
                  src="/logo1.png"
                  alt="EnergyMax Group Logo"
                  fill
                  priority
                  className="object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex items-center space-x-1 sm:space-x-1.5 tracking-tight font-serif text-[#172B15]">
                <span className="text-sm sm:text-lg lg:text-xl font-bold uppercase">ENERGYMAX</span>
                <span className="text-sm sm:text-lg lg:text-xl font-bold uppercase">GROUP</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              
              {/* Products Demographic Dropdown */}
              <div
                className="relative py-2"
                onMouseEnter={() => setIsProductsOpen(true)}
                onMouseLeave={() => setIsProductsOpen(false)}
              >
                <button suppressHydrationWarning
                  type="button"
                  className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors flex items-center space-x-1 focus:outline-none cursor-pointer"
                >
                  <span>Products</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${
                      isProductsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isProductsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-0 w-[300px] bg-white text-[#172B15] rounded-3xl shadow-2xl border border-[#2D5A1E]/15 p-3.5 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-1.5 border-b border-neutral-100 mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#639E1F]">
                          Demographic Categories
                        </span>
                      </div>

                      <div className="space-y-1">
                        {productCategories.map((cat, idx) => (
                          <Link
                            key={idx}
                            href={cat.href}
                            onClick={() => setIsProductsOpen(false)}
                            className="block p-2.5 rounded-2xl hover:bg-[#F2F8ED] transition-colors group"
                          >
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B15] group-hover:text-[#639E1F] transition-colors">
                              {cat.title}
                            </h4>
                            <p className="text-[11px] text-neutral-500 font-normal leading-snug">
                              {cat.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/shop"
                className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/science"
                className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors"
              >
                Discover Science
              </Link>
              <a
                href="/about-us"
                className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors"
              >
                About
              </a>
            </nav>

            {/* Search Bar & Dynamic Cart Drawer Trigger */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              <div className="hidden md:flex items-center relative">
                <input
                  type="text"
                  placeholder="Search products or SKU..."
                  className="w-52 lg:w-72 pl-4 pr-10 py-2.5 rounded-full bg-white border border-[#2D5A1E]/20 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] shadow-sm transition-all"
                />
                <button
                  aria-label="Search"
                  className="absolute right-3 text-[#2D5A1E] hover:text-[#639E1F] transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Reactive Shopping Bag Button */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="Open Shopping Bag"
                className="relative p-2.5 rounded-full bg-[#2D5A1E]/5 hover:bg-[#2D5A1E]/10 text-[#172B15] transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#172B15]" />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 rounded-full bg-[#8CC63F] text-[#172B15] text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#172B15] hover:bg-[#2D5A1E]/10 transition-colors focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* =========================================================
            MOBILE NAVIGATION DRAWER
           ========================================================= */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#FAFAF7] border-b border-[#2D5A1E]/15 px-6 py-6 space-y-6 shadow-2xl overflow-hidden"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products or SKU..."
                  className="w-full pl-4 pr-10 py-3 rounded-full bg-white border border-[#2D5A1E]/20 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
                />
                <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400" />
              </div>

              {/* Customer Account Indicator for Mobile */}
              {customer ? (
                <div className="p-3.5 bg-white rounded-2xl border border-[#2D5A1E]/15 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#639E1F] tracking-wider block">Logged In As</span>
                      <span className="text-xs font-bold text-[#172B15]">{customer.first_name} {customer.last_name || ""}</span>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-bold uppercase"
                    >
                      Logout
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-[11px] font-semibold text-[#172B15]">
                    <Link
                      href="/account/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-center"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/account/addresses"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-center"
                    >
                      Addresses
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  href="/shop/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-md"
                >
                  <User className="w-3.5 h-3.5 text-[#8CC63F]" />
                  <span>Customer Sign In</span>
                </Link>
              )}

              <div className="flex flex-col space-y-3.5 text-xs font-bold uppercase tracking-wider text-[#172B15]">
                <div className="space-y-2 py-1 border-b border-neutral-200">
                  <span className="text-[#639E1F]">Products Categories</span>
                  <div className="grid grid-cols-1 gap-2 pl-2 pt-1">
                    {productCategories.map((cat, idx) => (
                      <Link
                        key={idx}
                        href={cat.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[11px] font-medium text-neutral-700 hover:text-[#639E1F] py-0.5"
                      >
                        &bull; {cat.title}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">
                  Shop
                </Link>
                <Link href="/science" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">
                  Discover Science
                </Link>
                <a href="#promotions" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">
                  Promotions
                </a>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex flex-col space-y-3 text-xs text-neutral-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsPincodeModalOpen(true);
                  }}
                  className="flex items-center space-x-2 text-left"
                >
                  <MapPin className="w-4 h-4 text-[#639E1F]" />
                  <span className="underline font-medium">
                    {activePincode ? `Deliver to: ${activePincode} (${activeLocation})` : "Select delivery address"}
                  </span>
                </button>
                <Link href="/help-centre" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 text-left">
                  <HelpCircle className="w-4 h-4 text-[#639E1F]" />
                  <span className="font-medium">Help Centre</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* =========================================================
          DELIVERY PINCODE SELECTION MODAL
         ========================================================= */}
      <AnimatePresence>
        {isPincodeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPincodeModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2D5A1E]/20 text-[#172B15] z-10 space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#639E1F]" />
                    <span>Cold-Chain Fulfillment</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[#172B15]">
                    Select Delivery Location
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Enter your postal code to verify live inventory and express delivery speed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPincodeModalOpen(false)}
                  className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activePincode && (
                <div className="p-3.5 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#639E1F] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#172B15]">
                        Delivering to {activePincode}
                      </p>
                      <p className="text-[10px] text-neutral-600">
                        {activeLocation || "Standard Delivery Zone"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPincode}
                    className="text-[10px] font-bold text-red-600 hover:underline uppercase"
                  >
                    Reset
                  </button>
                </div>
              )}

              <form onSubmit={handlePincodeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Enter 6-Digit Indian PIN Code *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 110001, 201301, 400001"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-3 pl-11 text-sm font-mono tracking-wider text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-all"
                    />
                  </div>
                </div>

                {pincodeError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pincodeError}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-1">
                  <button
                    type="submit"
                    disabled={pincodeLoading || pincode.length < 6}
                    className="flex-1 py-3.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                  >
                    {pincodeLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Hub...</span>
                      </>
                    ) : (
                      <span>Apply Pincode</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPincodeModalOpen(false)}
                    className="px-5 py-3.5 rounded-2xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase hover:bg-neutral-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="text-[11px] text-neutral-500 border-t border-neutral-100 pt-3 space-y-1">
                <p>• Temperature-controlled cold chain for 1 Trillion CFU batches.</p>
                <p>• Free express delivery available for qualifying orders.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}