"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Sparkles } from "lucide-react";
import Image from "next/image";

const pillars = [
  {
    id: "mission",
    tag: "01 / Our Mission",
    title: "Probiotics for Vitality & Balance",
    description: "Dedicated to making a difference through advanced probiotics. We provide natural formulations to support digestion, maintain a balanced microbiome, and enhance overall well-being."
  },
  {
    id: "vision",
    tag: "02 / Our Vision",
    title: "Pioneering Optimal Wellness",
    description: "Committed to innovation, research, and strategic partnerships to develop cutting-edge probiotic cultures that maintain total-body microflora harmony from the gut outward."
  },
  {
    id: "science",
    tag: "03 / Research & Science",
    title: "Empowering Through Knowledge",
    description: "We conduct rigorous scientific reviews to understand the vital connection between probiotics, digestion, and immune defense—empowering consumers to make informed wellness choices."
  }
];

export default function GoalsVisionMission() {
  const [openId, setOpenId] = useState<string | null>("mission");

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="relative py-20 sm:py-24 lg:py-32 bg-[#FAFAF7] overflow-hidden border-t border-b border-[#2D5A1E]/10">
      
      {/* Background Atmosphere Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-[#8CC63F]/[0.06] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Split Layout: Left Details + Right Image Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Side: EnergyMax Group Details & Interactive Accordion Cards */}
          <div className="lg:col-span-6 flex flex-col space-y-8 text-left">
            
            {/* Header Tag */}
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-[#2D5A1E]/20 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#639E1F]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2D5A1E]">
                  EnergyMax Group 
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#172B15] leading-[1.15]">
                Our Goals, <span className="font-serif italic text-[#639E1F]">Vision</span> & Mission
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed pt-2">
                Rooted in biological science and organic purity, EnergyMax Group delivers clinical-grade probiotics engineered to serve as your foundation for lifelong health and vitality.
              </p>
            </div>

            {/* Interactive Expandable Cards (Three Cards with Plus/Minus) */}
            <div className="space-y-4 w-full">
              {pillars.map((pillar) => { 
                const isOpen = openId === pillar.id;
                return (
                  <div
                    key={pillar.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white ${
                      isOpen
                        ? "border-[#639E1F] shadow-xl shadow-[#2D5A1E]/5"
                        : "border-[#2D5A1E]/15 hover:border-[#639E1F]/40 shadow-sm"
                    }`}
                  >
                    <button suppressHydrationWarning
                      onClick={() => toggleAccordion(pillar.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
                          {pillar.tag}
                        </span>
                        <h3 className="text-base sm:text-lg font-light text-[#172B15] tracking-tight group-hover:text-[#639E1F] transition-colors">
                          {pillar.title}
                        </h3>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        isOpen ? "bg-[#2D5A1E] text-white" : "bg-[#8CC63F]/10 text-[#2D5A1E]"
                      }`}>
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed border-t border-neutral-100">
                            {pillar.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Side: Beautifully Presented overview.png Image Showcase */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[440px] sm:max-w-[500px] h-[500px] sm:h-[580px] flex items-center justify-center group"
            >
              {/* Luminous Ambient Glow */}
              <div className="absolute inset-0 bg-[#8CC63F]/25 rounded-full blur-[90px] -z-10" />

              {/* Framed Visual Presentation */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[#2D5A1E]/20 shadow-2xl shadow-[#2D5A1E]/15 bg-white">
                <Image
                  src="/girl-image.png"
                  alt="EnergyMax Group Product Overview"
                  fill
                  priority
                  className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}