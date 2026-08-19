"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function SearchDistributorsPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />
      
      <section className="relative py-16 sm:py-20 lg:py-28 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <Search className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Verification Registry
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Search Independent <span className="font-serif italic text-[#8CC63F]">Business Owners</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Verify authorized EnergyMax Independent Business Owners (IBOs) to ensure product authenticity and qualify for your 30-day satisfaction guarantee.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-24">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-6 text-center">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-light text-[#172B15]">IBO Directory Search</h3>
            <p className="text-xs text-neutral-600">Enter the IBO registration ID or full name to check active certification status.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. EMX-84920 or Authorized Name..." 
              className="flex-1 px-4 py-3.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2D5A1E]" 
            />
            <button 
              onClick={() => setSearched(true)}
              className="px-6 py-3.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all"
            >
              Verify IBO
            </button>
          </div>

          {searched && (
            <div className="p-4 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/30 text-xs text-[#2D5A1E] font-medium">
              Registry query processed. For detailed distributor validation, please contact customer support at +91 120 466 4253.
            </div>
          )}
        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}