"use client";

import React from "react";
import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function ShippingProceduresPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />
      
      <section className="relative py-16 sm:py-20 lg:py-28 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <Truck className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Supply Chain & Logistics
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Shipping and Logistics <span className="font-serif italic text-[#8CC63F]">Procedures</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Reliable doorstep delivery standards across 17,000+ pin codes in India.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-24">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-6">
          <h2 className="text-xl font-light text-[#172B15] border-b border-neutral-100 pb-3">
            Logistics Protocol & Delivery Standards
          </h2>
          <ul className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            <li className="flex items-start space-x-3">
              <span className="text-[#639E1F] font-bold">&bull;</span>
              <span><strong>Nationwide Coverage:</strong> We service over 17,000+ pin codes across the Republic of India through premier national courier partners.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-[#639E1F] font-bold">&bull;</span>
              <span><strong>Dispatch Timelines:</strong> All verified orders are securely packed and dispatched within 24 to 48 hours of payment completion.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-[#639E1F] font-bold">&bull;</span>
              <span><strong>Climate-Controlled Storage:</strong> Probiotic and active botanical formulations are transported under optimal temperature conditions to preserve potency.</span>
            </li>
          </ul>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}