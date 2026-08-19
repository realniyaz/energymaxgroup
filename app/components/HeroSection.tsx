"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LuxuryHeroBanner() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-brand-ivory pt-8 sm:pt-12 lg:pt-0">
      
      {/* Cinematic Background Atmosphere with Mobile & Desktop Optimized Positioning */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.03 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 15, ease: [0.25, 1, 0.5, 1], repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src="/banner1.png"
            alt="EnergyMax Group Global Wellness"
            fill
            priority
            className="object-cover object-[72%_center] lg:object-center"
          />
        </motion.div>

        {/* Sophisticated Overlay: Complete removal on desktop (lg:bg-transparent), soft breathable balance on mobile */}
        <div className="absolute inset-0 bg-white/40 sm:bg-white/20 lg:bg-transparent z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-8 sm:py-12 flex items-center justify-center lg:justify-start">
        
        {/* Perfectly Centered on Mobile / Elegantly Aligned Left on Desktop */}
        <div className="w-full flex justify-center lg:justify-start items-center pl-0 lg:pl-16">
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsHovered((prev) => !prev)}
            animate={{ y: [0, -8, 0] }}
            transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
            className="relative w-[280px] sm:w-[380px] lg:w-[460px] h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center cursor-pointer group my-auto"
            style={{ perspective: 1400 }}
          >
            {/* Luminous Luxury Ambient Glow */}
            <div className="absolute inset-0 bg-[#8CC63F]/40 sm:bg-[#8CC63F]/35 rounded-full blur-[70px] sm:blur-[90px] -z-10 transform scale-90" />

            {/* 3D Rotating Container */}
            <motion.div
              animate={{ rotateY: isHovered ? 180 : 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full h-full"
            >
              {/* Front Pouch View */}
              <div 
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 w-full h-full flex items-center justify-center"
              >
                <Image
                  src="/front2.png"
                  alt="maXilin Superprobiotics Front View"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_20px_30px_rgba(23,43,21,0.35)] sm:drop-shadow-[0_25px_35px_rgba(23,43,21,0.3)]"
                />
              </div>

              {/* Back Pouch View & Specs */}
              <div 
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                className="absolute inset-0 w-full h-full flex items-center justify-center"
              >
                <Image
                  src="/back.png"
                  alt="maXilin Superprobiotics Specifications"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_20px_30px_rgba(23,43,21,0.35)] sm:drop-shadow-[0_25px_35px_rgba(23,43,21,0.3)]"
                />
              </div>
            </motion.div>

            {/* Concise Instruction Pill */}
            <div className="absolute -bottom-6 sm:-bottom-4 px-4 py-1.5 rounded-full bg-white/95 border border-[#8CC63F]/40 backdrop-blur-xl shadow-lg shadow-[#2D5A1E]/10 pointer-events-none">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#2D5A1E]">
                Tap to Rotate
              </span>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}