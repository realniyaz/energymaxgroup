"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, MapPin, ChevronDown, User, Menu, X, HelpCircle, Download, BookOpen, Globe, Users, Baby, ShieldAlert, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const productCategories = [
  { title: "Men's Vitality", description: "Targeted endurance & metabolic probiotics", href: "/shop/men" },
  { title: "Women's Harmony", description: "Gut-skin barrier & hormonal balance", href: "/shop/women" },
  { title: "Kids & Growth", description: "Gentle daily microflora & immunity", href: "/shop/kids" },
  { title: "Family Bundles", description: "All-in-one household wellness packs", href: "/shop/family" },
  { title: "Senior / Old Age", description: "High-CFU support for older adults", href: "/shop/senior" },
];

export default function LuxuryNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm font-sans">
      
      {/* =========================================================
          TIER 1: TOP UTILITY BAR (Deep Rich Olive/Forest Tone)
         ========================================================= */}
      <div className="bg-[#1C3119] text-[#F2F7EC] text-xs py-2 px-4 sm:px-8 lg:px-12 border-b border-[#2D5A1E]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left Utility Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#resources" className="flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
              <Download className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span className="font-medium tracking-wider uppercase text-[10px]">Resources & Downloads</span>
            </a>
            <span className="text-white/20">&bull;</span>
            <a href="#library" className="flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
              <BookOpen className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span className="font-medium tracking-wider uppercase text-[10px]">Content Library</span>
            </a>
            <span className="text-white/20">&bull;</span>
            <a href="/about-us" className="flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
              <Globe className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span className="font-medium tracking-wider uppercase text-[10px]">About EnergyMax</span>
            </a>
          </div>

          <div className="flex md:hidden items-center text-[10px] text-white/80 tracking-wider uppercase font-medium">
            <span>Global Wellness Enterprise</span>
          </div>

          {/* Right Utility Controls */}
          <div className="flex items-center justify-end space-x-3 sm:space-x-6 text-[11px]">
            <button suppressHydrationWarning className="hidden sm:flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span className="underline underline-offset-4 decoration-[#8CC63F]/50 font-medium">Select delivery address</span>
            </button>

            <span className="text-white/20 hidden sm:inline">&bull;</span>

            <Link href="/help-centre" className="hidden sm:flex items-center space-x-1 hover:text-[#8CC63F] transition-colors cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span className="font-medium">Help Centre</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </Link>

            <span className="text-white/20 hidden sm:inline">&bull;</span>

            <a href="#signin" className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#8CC63F] text-[#172B15] font-bold tracking-wider uppercase text-[10px] shadow-sm hover:bg-[#7AB82A] transition-all">
              <User className="w-3 h-3" />
              <span>Sign In</span>
            </a>
          </div>

        </div>
      </div>

      {/* =========================================================
          TIER 2: MAIN BRAND NAVIGATION BAR (Luminous Pearl & Glass)
         ========================================================= */}
      <div className="bg-[#FAFAF7]/95 backdrop-blur-xl border-b border-[#2D5A1E]/10 px-4 sm:px-8 lg:px-12 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Typography */}
          <a href="/" className="flex items-center space-x-2 sm:space-x-2.5 group">
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
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            
            {/* PRODUCTS WITH HOVER DROPDOWN FOR CATEGORIES */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <button className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors flex items-center space-x-1 focus:outline-none cursor-pointer">
                <span>Products</span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${isProductsOpen ? "rotate-180" : ""}`} />
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
                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#639E1F]">Demographic Categories</span>
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

            <a href="#Shop" className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors flex items-center space-x-1">
              <span>Shop</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </a>
            <a href="/science" className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors">
              Discover Science
            </a>
            <a href="#promotions" className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors">
              Promotions
            </a>
          </nav>

          {/* Search Bar & Shopping Bag Cart */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search products or SKU..."
                className="w-52 lg:w-72 pl-4 pr-10 py-2.5 rounded-full bg-white border border-[#2D5A1E]/20 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] shadow-sm transition-all"
              />
              <button aria-label="Search" className="absolute right-3 text-[#2D5A1E] hover:text-[#639E1F] transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>

            <a href="#cart" aria-label="Shopping Cart" className="relative p-2.5 rounded-full bg-[#2D5A1E]/5 hover:bg-[#2D5A1E]/10 text-[#172B15] transition-colors">
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 rounded-full bg-[#639E1F] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                2
              </span>
            </a>

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
          MOBILE RESPONSIVE NAVIGATION DRAWER
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

            <div className="flex flex-col space-y-3.5 text-xs font-bold uppercase tracking-wider text-[#172B15]">
              <div className="space-y-2 py-1 border-b border-neutral-200">
                <span className="text-[#639E1F]">Products Categories</span>
                <div className="grid grid-cols-1 gap-2 pl-2 pt-1">
                  {productCategories.map((cat, idx) => (
                    <Link key={idx} href={cat.href} onClick={() => setIsMobileMenuOpen(false)} className="text-[11px] font-medium text-neutral-700 hover:text-[#639E1F] py-0.5">
                      &bull; {cat.title}
                    </Link>
                  ))}
                </div>
              </div>
              <a href="#Shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">Shop</a>
              <a href="/science" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">Discover Science</a>
              <a href="#promotions" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">Promotions</a>
              <a href="#resources" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">Resources & Downloads</a>
              <a href="#library" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">Content Library</a>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex flex-col space-y-3.5 text-xs text-neutral-700">
              <button className="flex items-center space-x-2 text-left">
                <MapPin className="w-4 h-4 text-[#639E1F]" />
                <span className="underline font-medium">Select delivery address</span>
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
  );
}