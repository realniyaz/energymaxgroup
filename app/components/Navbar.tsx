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
  BookOpen,
  Globe,
  LogOut,
  Package,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  ArrowBigRight,
  ArrowRight,
  Heart,
  Bell,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useCart } from "@/context/cart-context";
import { useCustomerNotifications } from "@/context/customer-notification-context";
import CartDrawer from "./cart/CartDrawer";
import NotificationBell from "./notifications/NotificationBell";
import { CATALOG_PRODUCTS, CatalogProduct } from "@/data/catalogProducts";

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
  const router = useRouter();
  const { customer, logout } = useCustomerAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { unreadCount } = useCustomerNotifications();

  // Navigation UI states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

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

  // Filter products by search query
  const searchResults: CatalogProduct[] = searchQuery.trim()
    ? CATALOG_PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          p.subtitle.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : [];

  useEffect(() => {
    setMounted(true);
    const savedPin = localStorage.getItem("em_delivery_pincode");
    const savedLoc = localStorage.getItem("em_delivery_location");
    if (savedPin) {
      setActivePincode(savedPin);
      setActiveLocation(savedLoc || "India");
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile drawer or pincode modal is open
  useEffect(() => {
    if (isMobileMenuOpen || isPincodeModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isPincodeModalOpen]);

  const handleSelectProduct = (slug: string) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
    router.push(`/shop/${slug}`);
  };

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
      <header className="w-full sticky top-0 z-40 shadow-sm font-sans max-w-full">
        {/* Tier 1: Utility Bar */}
        <div className="bg-[#1C3119] text-[#F2F7EC] text-xs py-1.5 sm:py-2 px-3 sm:px-8 lg:px-12 border-b border-[#2D5A1E]/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/privacy-policy" className="flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
                <ArrowBigRight className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="font-medium tracking-wider uppercase text-[10px]">Privacy Policy</span>
              </Link>
              <span className="text-white/20">&bull;</span>
              <Link href="/terms-and-conditions" className="flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="font-medium tracking-wider uppercase text-[10px]">Terms of Service</span>
              </Link>
              <span className="text-white/20">&bull;</span>
              <Link href="/about-us" className="flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
                <Globe className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="font-medium tracking-wider uppercase text-[10px]">About EnergyMax</span>
              </Link>
            </div>

            <div className="flex md:hidden items-center text-[10px] text-white/90 tracking-wider uppercase font-semibold shrink-0">
              <span className="truncate max-w-[120px] xs:max-w-none">EnergyMax Group</span>
            </div>

            <div className="flex items-center justify-end space-x-2 sm:space-x-6 text-[10px] sm:text-[11px] min-w-0">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setIsPincodeModalOpen(true)}
                className="flex items-center space-x-1 text-neutral-200 hover:text-[#8CC63F] transition-colors cursor-pointer group min-w-0 truncate"
              >
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8CC63F] shrink-0" />
                <span className="font-medium tracking-tight sm:tracking-wide truncate">
                  {mounted && activePincode ? (
                    <span className="text-[#8CC63F] truncate">
                      PIN: <span className="font-mono font-bold text-white underline underline-offset-2">{activePincode}</span>
                    </span>
                  ) : (
                    <span className="underline underline-offset-2 decoration-[#8CC63F]/50 truncate">
                      Pincode
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

              {mounted && customer ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-[10px] sm:text-[11px] transition-all cursor-pointer border border-white/15"
                  >
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#8CC63F] text-[#172B15] flex items-center justify-center font-bold text-[8px] sm:text-[9px]">
                      {customer.first_name?.[0]?.toUpperCase() || "C"}
                    </div>
                    <span className="max-w-[70px] sm:max-w-[100px] truncate text-[#8CC63F] font-bold">
                      {customer.first_name}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-60 sm:w-64 bg-white text-[#172B15] rounded-2xl shadow-2xl border border-[#2D5A1E]/15 p-2 z-50 overflow-hidden"
                      >
                        <div className="px-3 py-2.5 border-b border-neutral-100 bg-[#FAFAF7] rounded-xl mb-1">
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
                            href="/shop/account/notifications"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F2F8ED] text-neutral-700 hover:text-[#172B15] transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Bell className="w-3.5 h-3.5 text-[#639E1F]" />
                              <span>Notifications</span>
                            </div>
                            {unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#8CC63F]/20 text-[#2D5A1E]">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
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
                            <span>My Orders</span>
                          </Link>
                          <Link
                            href="/shop/account/wishlist"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-[#F2F8ED] text-neutral-700 hover:text-[#172B15] transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5 text-[#639E1F]" />
                            <span>My Wishlist</span>
                          </Link>
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
                  className="flex items-center space-x-1 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#8CC63F] text-[#172B15] font-bold tracking-wider uppercase text-[9px] sm:text-[10px] shadow-sm hover:bg-[#7AB82A] transition-all cursor-pointer shrink-0"
                >
                  <User className="w-3 h-3" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: Main Brand Navigation */}
        <div className="bg-[#FAFAF7]/95 backdrop-blur-xl border-b border-[#2D5A1E]/10 px-3 sm:px-8 lg:px-12 py-2.5 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center space-x-2 group shrink-0">
              <div className="relative w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center">
                <Image
                  src="/logo1.png"
                  alt="EnergyMax Group Logo"
                  fill
                  priority
                  className="object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex items-center space-x-1 tracking-tight font-serif text-[#172B15]">
                <span className="text-xs sm:text-lg lg:text-xl font-bold uppercase">ENERGYMAX</span>
                <span className="text-xs sm:text-lg lg:text-xl font-bold uppercase text-[#2D5A1E]">GROUP</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              <div
                className="relative py-2"
                onMouseEnter={() => setIsProductsOpen(true)}
                onMouseLeave={() => setIsProductsOpen(false)}
              >
                <button
                  suppressHydrationWarning
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
              <Link
                href="/about-us"
                className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors"
              >
                About
              </Link>
            </nav>

            {/* Right Nav Action Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
              {/* Desktop Search Bar */}
              <div className="hidden md:flex items-center relative" ref={searchContainerRef}>
                <div className="relative">
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products or SKU..."
                    className="w-52 lg:w-72 pl-4 pr-10 py-2.5 rounded-full bg-white border border-[#2D5A1E]/20 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] shadow-xs transition-all"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D5A1E]" />
                  )}
                </div>

                <AnimatePresence>
                  {isSearchFocused && searchQuery.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#2D5A1E]/15 p-2 z-50 overflow-hidden max-h-96 overflow-y-auto"
                    >
                      {searchResults.length > 0 ? (
                        <div className="space-y-1">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleSelectProduct(product.slug)}
                              className="w-full p-2.5 rounded-xl hover:bg-[#F2F8ED] flex items-center space-x-3 text-left transition-colors group cursor-pointer"
                            >
                              <div className="relative w-10 h-10 rounded-lg bg-[#FAFAF7] border border-neutral-100 flex items-center justify-center overflow-hidden shrink-0">
                                <Image
                                  src={product.image}
                                  alt={product.title}
                                  fill
                                  sizes="40px"
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-[#172B15] group-hover:text-[#2D5A1E] truncate">
                                  {product.title}
                                </h4>
                                <p className="text-[10px] text-neutral-500 truncate">
                                  {product.subtitle}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-[#172B15] shrink-0 font-mono">
                                ₹{product.price.toLocaleString("en-IN")}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-xs text-neutral-500">No matching products found.</p>
                          <Link
                            href="/shop"
                            onClick={() => {
                              setIsSearchFocused(false);
                              setSearchQuery("");
                            }}
                            className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#2D5A1E] mt-2 hover:underline"
                          >
                            <span>Browse full catalog</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* In-App Customer Notifications Bell */}
              {mounted && customer && <NotificationBell />}

              {/* Shopping Bag Button */}
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="Open Shopping Bag"
                className="relative p-2 sm:p-2.5 rounded-full bg-[#2D5A1E]/5 hover:bg-[#2D5A1E]/10 text-[#172B15] transition-all cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-[#172B15]" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 sm:top-0.5 sm:right-0.5 w-4 h-4 rounded-full bg-[#8CC63F] text-[#172B15] text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                suppressHydrationWarning
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#172B15] hover:bg-[#2D5A1E]/10 active:scale-95 transition-all focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden bg-[#FAFAF7] border-b border-[#2D5A1E]/15 shadow-2xl max-h-[calc(100dvh-95px)] overflow-y-auto overscroll-contain"
            >
              <div className="px-4 py-5 space-y-5">
                {/* Mobile Search Input */}
                <div className="relative w-full" ref={mobileSearchContainerRef}>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products or SKU..."
                      className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white border border-[#2D5A1E]/20 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] shadow-2xs"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    )}
                  </div>

                  {searchQuery.trim().length > 0 && (
                    <div className="mt-2 bg-white rounded-2xl border border-[#2D5A1E]/15 p-2 shadow-lg max-h-56 overflow-y-auto space-y-1">
                      {searchResults.length > 0 ? (
                        searchResults.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSelectProduct(product.slug)}
                            className="w-full p-2.5 rounded-xl hover:bg-[#F2F8ED] active:bg-[#F2F8ED] flex items-center space-x-3 text-left transition-colors"
                          >
                            <div className="relative w-9 h-9 rounded-lg bg-[#FAFAF7] border border-neutral-100 flex items-center justify-center overflow-hidden shrink-0">
                              <Image
                                src={product.image}
                                alt={product.title}
                                fill
                                sizes="36px"
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-[#172B15] truncate">
                                {product.title}
                              </h4>
                              <p className="text-[10px] text-neutral-500 truncate">
                                {product.subtitle}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#172B15] font-mono shrink-0">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="p-3 text-center text-xs text-neutral-500">
                          No matching products found.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Customer Status Card */}
                {customer ? (
                  <div className="p-3.5 bg-white rounded-2xl border border-[#2D5A1E]/15 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase text-[#639E1F] tracking-wider block">Logged In As</span>
                        <span className="text-xs font-bold text-[#172B15] truncate block">
                          {customer.first_name} {customer.last_name || ""}
                        </span>
                      </div>
                      <button
                        onClick={() => logout()}
                        className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-bold uppercase shrink-0"
                      >
                        Logout
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-[11px] font-semibold text-[#172B15]">
                      <Link
                        href="/account/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-center hover:bg-[#F2F8ED]"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/shop/account/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-center hover:bg-[#F2F8ED]"
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/account/addresses"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-center hover:bg-[#F2F8ED]"
                      >
                        Addresses
                      </Link>
                      <Link
                        href="/shop/account/notifications"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-center hover:bg-[#F2F8ED] flex items-center justify-center space-x-1"
                      >
                        <span>Notifications</span>
                        {mounted && unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#8CC63F] text-[#172B15] text-[9px] font-bold flex items-center justify-center">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/shop/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <User className="w-3.5 h-3.5 text-[#8CC63F]" />
                    <span>Customer Sign In</span>
                  </Link>
                )}

                {/* Mobile Navigation List */}
                <div className="flex flex-col space-y-1 text-xs font-bold uppercase tracking-wider text-[#172B15]">
                  <div className="py-2 border-b border-neutral-200/80">
                    <span className="text-[10px] text-[#639E1F] tracking-widest uppercase block mb-1.5 font-bold">
                      Products Categories
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 pl-1">
                      {productCategories.map((cat, idx) => (
                        <Link
                          key={idx}
                          href={cat.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between py-1.5 px-2 rounded-xl text-[11px] font-semibold text-neutral-700 active:bg-[#F2F8ED]"
                        >
                          <span>{cat.title}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">Explore →</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-[#639E1F] py-2.5 border-b border-neutral-200/80 flex items-center justify-between"
                  >
                    <span>Shop All Products</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Link>

                  <Link
                    href="/science"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-[#639E1F] py-2.5 border-b border-neutral-200/80 flex items-center justify-between"
                  >
                    <span>Discover Science</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Link>

                  <Link
                    href="/about-us"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-[#639E1F] py-2.5 border-b border-neutral-200/80 flex items-center justify-between"
                  >
                    <span>About EnergyMax</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Link>
                </div>

                {/* Mobile Footer Utility Row */}
                <div className="pt-2 flex flex-col space-y-2.5 text-xs text-neutral-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsPincodeModalOpen(true);
                    }}
                    className="flex items-center space-x-2 text-left p-2.5 rounded-xl bg-white border border-[#2D5A1E]/15 shadow-2xs"
                  >
                    <MapPin className="w-4 h-4 text-[#639E1F] shrink-0" />
                    <span className="font-medium text-xs truncate">
                      {activePincode ? `Deliver to: ${activePincode} (${activeLocation})` : "Select delivery pincode"}
                    </span>
                  </button>

                  <Link
                    href="/help-centre"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-left p-2.5 rounded-xl bg-white border border-[#2D5A1E]/15 shadow-2xs"
                  >
                    <HelpCircle className="w-4 h-4 text-[#639E1F] shrink-0" />
                    <span className="font-medium text-xs">Help Centre &amp; FAQs</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* Fully Mobile-Optimized Pincode Modal */}
      <AnimatePresence>
        {isPincodeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPincodeModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#2D5A1E]/20 text-[#172B15] z-10 space-y-5 max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#639E1F]" />
                    <span>Cold-Chain Fulfillment</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#172B15]">
                    Select Delivery Location
                  </h3>
                  <p className="text-xs text-neutral-500 leading-snug">
                    Enter postal code to verify live stock and shipping speeds.
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
                <div className="p-3 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-[#639E1F] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172B15] truncate">
                        Delivering to {activePincode}
                      </p>
                      <p className="text-[10px] text-neutral-600 truncate">
                        {activeLocation || "Standard Delivery Zone"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPincode}
                    className="text-[10px] font-bold text-red-600 hover:underline uppercase shrink-0 ml-2"
                  >
                    Reset
                  </button>
                </div>
              )}

              <form onSubmit={handlePincodeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Enter 6-Digit PIN Code *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 110001, 400001"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-3 pl-11 text-sm font-mono tracking-wider text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-all"
                    />
                  </div>
                </div>

                {pincodeError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pincodeError}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2.5 pt-1 pb-2 sm:pb-0">
                  <button
                    type="submit"
                    disabled={pincodeLoading || pincode.length < 6}
                    className="flex-1 py-3.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    {pincodeLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Apply Pincode</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPincodeModalOpen(false)}
                    className="px-4 py-3.5 rounded-2xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase hover:bg-neutral-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}