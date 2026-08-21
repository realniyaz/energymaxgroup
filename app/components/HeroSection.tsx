"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LuxuryHeroBanner() {
  return (
    <section className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center overflow-hidden bg-[#FAFAF7]">
      
      {/* Cinematic Background Atmosphere with Product Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.02 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, ease: [0.25, 1, 0.5, 1], repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src="/newbanner1.png"
            alt="EnergyMax Group maXilin Probiotics Range"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] sm:object-[65%_center] lg:object-[right_center]"
          />
        </motion.div>

        {/* Sophisticated Responsive Gradient Overlay - Stronger on left for text legibility, fading to right */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#172B15]/95 via-[#172B15]/80 to-black/40 lg:bg-gradient-to-r lg:from-[#172B15]/95 lg:via-[#172B15]/70 lg:to-[#172B15]/20 z-10" />
      </div>

      {/* Main Container with Grid Structure to prevent text overlapping products */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-12 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 items-center">
        
        {/* Content Box: Restricted to 7 columns on desktop so it stays neatly on the left */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-white text-center lg:text-left flex flex-col items-center lg:items-start">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/40 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8CC63F]" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8CC63F]">
              Advanced Patented Probiotics
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.12]"
          >
            GUT HEALTH IS THE <br className="hidden sm:inline" />
            <span className="font-serif italic text-[#8CC63F]">FOUNDATION OF WELLNESS</span>
          </motion.h1>

          {/* Sub Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs sm:text-sm lg:text-base text-neutral-200 font-normal leading-relaxed max-w-lg"
          >
            Empowering your body with maXilin Superprobiotics—engineered to restore microbial ecology, boost vitality, and support long-term metabolic health.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1 w-full sm:w-auto"
          >
            <Link
              href="/shop"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#8CC63F] text-[#172B15] text-xs font-bold uppercase tracking-widest hover:bg-[#7AB82A] transition-all shadow-xl shadow-[#2D5A1E]/20 inline-flex items-center justify-center space-x-2 group shrink-0"
            >
              <span>SHOP NOW</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/science"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white/10 border border-white/30 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/20 backdrop-blur-md transition-all inline-flex items-center justify-center shrink-0"
            >
              Discover Science
            </Link>
          </motion.div>

        </div>

      </div>
    </section>
  );
}