"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, MapPin, ChevronDown, User, Menu, X, HelpCircle, Download, BookOpen, Globe } from "lucide-react";
import Image from "next/image";

export default function LuxuryNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm font-sans">
      
      {/* =========================================================
          TIER 1: TOP UTILITY BAR (Deep Rich Olive/Forest Tone)
         ========================================================= */}
      <div className="bg-[#1C3119] text-[#F2F7EC] text-xs py-2 px-4 sm:px-8 lg:px-12 border-b border-[#2D5A1E]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left Utility Links (Hidden on small mobile for cleanliness) */}
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

          {/* Mobile-Friendly Utility Message / Quick Links */}
          <div className="flex md:hidden items-center text-[10px] text-white/80 tracking-wider uppercase font-medium">
            <span>Global Wellness Enterprise</span>
          </div>

          {/* Right Utility Controls (Location, Help Centre, Sign In) */}
          <div className="flex items-center justify-end space-x-3 sm:space-x-6 text-[11px]">
            {/* Location Selector */}
            <button suppressHydrationWarning className="hidden sm:flex items-center space-x-1.5 hover:text-[#8CC63F] transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span className="underline underline-offset-4 decoration-[#8CC63F]/50 font-medium">Select delivery address</span>
            </button>

            <span className="text-white/20 hidden sm:inline">&bull;</span>

            {/* Help Centre */}
            <div className="hidden sm:flex items-center space-x-1 hover:text-[#8CC63F] transition-colors cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span className="font-medium">Help Centre</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </div>

            <span className="text-white/20 hidden sm:inline">&bull;</span>

            {/* Sign In Portal Button */}
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
          
          {/* Brand Logo & Typography (ENERGYMAX GROUP matched precisely to logo font & single-line layout) */}
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
            <a href="#products" className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors flex items-center space-x-1">
              <span>Products</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </a>
            <a href="#brands" className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors flex items-center space-x-1">
              <span>Brands</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </a>
            <a href="#opportunity" className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors">
              Global Opportunity
            </a>
            <a href="#promotions" className="text-xs font-bold uppercase tracking-widest text-[#172B15] hover:text-[#639E1F] transition-colors">
              Promotions
            </a>
          </nav>

          {/* Search Bar & Shopping Bag Cart */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            
            {/* Search Input Bar */}
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

            {/* Shopping Bag Cart Icon with Badge */}
            <a href="#cart" aria-label="Shopping Cart" className="relative p-2.5 rounded-full bg-[#2D5A1E]/5 hover:bg-[#2D5A1E]/10 text-[#172B15] transition-colors">
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 rounded-full bg-[#639E1F] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                2
              </span>
            </a>

            {/* Mobile Menu Hamburger Toggle */}
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
          MOBILE RESPONSIVE NAVIGATION DRAWER (Optimized for Mobile UX)
         ========================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#FAFAF7] border-b border-[#2D5A1E]/15 px-6 py-6 space-y-6 shadow-2xl overflow-hidden"
          >
            {/* Mobile Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products or SKU..."
                className="w-full pl-4 pr-10 py-3 rounded-full bg-white border border-[#2D5A1E]/20 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
              />
              <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400" />
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-3.5 text-xs font-bold uppercase tracking-wider text-[#172B15]">
              <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200 flex items-center justify-between">
                <span>Products</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 -rotate-90" />
              </a>
              <a href="#brands" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200 flex items-center justify-between">
                <span>Brands</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 -rotate-90" />
              </a>
              <a href="#opportunity" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">Global Opportunity</a>
              <a href="#promotions" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">Promotions</a>
              <a href="#resources" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">Resources & Downloads</a>
              <a href="#library" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#639E1F] py-2 border-b border-neutral-200">Content Library</a>
            </div>

            {/* Mobile Footer Utility Controls */}
            <div className="pt-4 border-t border-neutral-200 flex flex-col space-y-3.5 text-xs text-neutral-700">
              <button className="flex items-center space-x-2 text-left">
                <MapPin className="w-4 h-4 text-[#639E1F]" />
                <span className="underline font-medium">Select delivery address</span>
              </button>
              <button className="flex items-center space-x-2 text-left">
                <HelpCircle className="w-4 h-4 text-[#639E1F]" />
                <span className="font-medium">Help Centre</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}