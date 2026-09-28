"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Check,
  ShieldCheck,
  Activity,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Auto-sliding images for the left side gallery
const slideImages = [
  { src: "/ing1.png", alt: "maXilin Probiotics Ingredients Breakdown" },
  { src: "/ing2.png", alt: "Quantitative Composition Matrix" },
  { src: "/ing3.png", alt: "Systemic Health Benefits" },
];

export default function ProfessionalOverviewSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slideImages.length) % slideImages.length);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideImages.length);
  }, []);

  // Keyboard navigation when modal is open
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setIsModalOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handlePrev, handleNext]);

  // Auto-slide effect every 4.5 seconds (pauses when modal is open)
  useEffect(() => {
    if (isModalOpen) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isModalOpen]);

  return (
    <section className="relative py-20 lg:py-28 bg-[#FAFAF7] overflow-hidden border-t border-[#2D5A1E]/10">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[750px] h-[750px] bg-[#8CC63F]/[0.05] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Automated Sliding Image Gallery */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div 
              onClick={() => setIsModalOpen(true)}
              className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl bg-white border border-[#2D5A1E]/25 shadow-2xl shadow-[#2D5A1E]/10 overflow-hidden flex items-center justify-center p-3 sm:p-5 cursor-pointer group"
            >
              
              {/* Badge & Zoom Indicator Overlay */}
              <div className="absolute top-5 left-5 z-20 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#2D5A1E]/20 shadow-sm flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-[#639E1F]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D5A1E]">
                  Clinical Architecture
                </span>
              </div>

              <div className="absolute top-5 right-5 z-20 px-3 py-1.5 rounded-full bg-[#172B15]/80 backdrop-blur-md text-white shadow-sm flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Click to Expand</span>
              </div>

              {/* Slider Transition Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={slideImages[currentIndex].src}
                      alt={slideImages[currentIndex].alt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 600px"
                      className="object-contain w-full h-full rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slide Navigation Dots */}
              <div className="absolute bottom-5 z-20 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                {slideImages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentIndex(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentIndex === dotIdx ? "w-6 bg-[#2D5A1E]" : "w-1.5 bg-[#2D5A1E]/30"
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* Right Column: Product Overview, Titles, Descriptions & Buttons */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30">
              <Activity className="w-3.5 h-3.5 text-[#639E1F]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#639E1F]">
                maXilin Superprobiotics Series
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#172B15] leading-[1.15]">
              Advanced Formulation for <span className="font-serif italic text-[#639E1F]">Lifelong Vitality</span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
              Engineered with 40 billion active CFU multi-strain cultures, complex dietary fibers, prebiotics, and essential micronutrients. Designed to optimize gut microbalance, strengthen physiological mucosal defenses, and elevate metabolic health.
            </p>

            {/* Benefit Highlights List */}
            <div className="space-y-3 pt-1 text-left">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-[#2D5A1E]/10 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm text-neutral-700 font-medium">
                  <strong>40 Billion CFU Probiotic Blend:</strong> Restores intestinal microflora and enhances resistance.
                </span>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-[#2D5A1E]/10 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm text-neutral-700 font-medium">
                  <strong>Prebiotics &amp; Fibre Matrix:</strong> Nourishes beneficial bacteria and stabilizes digestion.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/science"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all shadow-xl shadow-[#2D5A1E]/20 inline-flex items-center justify-center space-x-2 group shrink-0"
              >
                <span>Discover Science</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/shop"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-[#2D5A1E]/30 text-[#172B15] text-xs font-bold uppercase tracking-widest hover:bg-[#F2F8ED] transition-all inline-flex items-center justify-center shrink-0 shadow-sm"
              >
                Explore Catalog
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Full-Screen Image Lightbox Modal with Left & Right Toggle */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-[82vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-6 sm:p-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-[#172B15] text-white hover:bg-[#2D5A1E] transition-colors shadow-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Slide Counter & Label Indicator */}
              <div className="absolute top-4 left-6 z-30 flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#172B15]/10 text-[#172B15]">
                  {currentIndex + 1} / {slideImages.length}
                </span>
                <span className="text-xs font-semibold text-neutral-600 hidden sm:inline">
                  {slideImages[currentIndex].alt}
                </span>
              </div>

              {/* Previous Slide Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#172B15]/80 hover:bg-[#172B15] text-white backdrop-blur-md shadow-xl transition-all cursor-pointer group"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* Next Slide Button */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#172B15]/80 hover:bg-[#172B15] text-white backdrop-blur-md shadow-xl transition-all cursor-pointer group"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Active High-Res Modal Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={slideImages[currentIndex].src}
                      alt={slideImages[currentIndex].alt}
                      fill
                      sizes="100vw"
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Modal Thumbnails / Dots Indicator */}
              <div className="absolute bottom-4 z-30 flex items-center space-x-2">
                {slideImages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentIndex(dotIdx)}
                    aria-label={`Jump to image ${dotIdx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === dotIdx ? "w-8 bg-[#2D5A1E]" : "w-2 bg-[#2D5A1E]/25"
                    }`}
                  />
                ))}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}