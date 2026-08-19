"client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Globe, Award, ArrowRight } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />
      
      <section className="relative py-16 sm:py-20 lg:py-28 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <Briefcase className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Global Opportunity & Careers
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Build Your Future With <span className="font-serif italic text-[#8CC63F]">EnergyMax</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Explore independent business ownership pathways and corporate career opportunities designed for lifelong growth and professional excellence.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-24 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-light text-[#172B15]">Independent Business Ownership</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Launch your own direct selling enterprise by partnering with EnergyMax. Retail clinical-grade organic formulations, build high-performing teams, and achieve financial independence.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-light text-[#172B15]">Corporate Careers & R&D</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Join our corporate headquarters in Noida, Uttar Pradesh. We seek talented professionals across biotechnology research, digital software engineering, logistics, and customer support.
            </p>
          </div>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}