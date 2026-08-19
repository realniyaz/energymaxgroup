"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";

const stripItems = [
  {
    id: 1,
    text: "MAINTAIN MICROBALANCE OF INTESTINAL MICROFLORA*",
    icon: Activity,
  },
  {
    id: 2,
    text: "HELP RESTORE PHYSIOLOGICAL FUNCTION OF MUCOUS MEMBRANE*",
    icon: HeartPulse,
  },
  {
    id: 3,
    text: "INCREASE BODY RESISTANCE TO ADVERSE EFFECTS*",
    icon: ShieldCheck,
  },
  {
    id: 4,
    text: "CLINICAL GRADE &bull; 20 BILLION CFU ACTIVE STRAINS*",
    icon: Sparkles,
  },
];

export default function InfiniteWellnessStrip() {
  const [duration, setDuration] = useState(25);

  // Dynamically set slower speed (higher duration) for mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDuration(45); // Slower, calmer speed on mobile
      } else {
        setDuration(25); // Standard smooth speed on desktop
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full bg-[#1C3119] text-white py-3.5 sm:py-4 overflow-hidden border-y border-[#2D5A1E]/40 shadow-xl font-sans">
      
      {/* Infinite Marquee Container */}
      <div className="flex w-full overflow-hidden whitespace-nowrap select-none">
        
        {/* Animated Marquee Track */}
        <motion.div
          key={duration}
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center space-x-8 sm:space-x-16 shrink-0 min-w-full"
        >
          {/* Render list items duplicated for a continuous seamless loop */}
          {[...stripItems, ...stripItems, ...stripItems, ...stripItems].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center space-x-2.5 sm:space-x-3 text-[11px] sm:text-sm font-semibold tracking-[0.18em] sm:tracking-[0.2em] uppercase text-[#F2F7EC]"
              >
                <div className="p-1 sm:p-1.5 rounded-full bg-[#8CC63F]/20 text-[#8CC63F] border border-[#8CC63F]/30 flex items-center justify-center shrink-0">
                  <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span>{item.text}</span>
                <span className="text-[#8CC63F]/60 ml-6 sm:ml-8">&bull;</span>
              </div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
}