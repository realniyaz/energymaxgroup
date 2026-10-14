// components/Overview.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Maximize2,
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
  const touchStartX = useRef<number | null>(null);

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

  // Touch Swipe for Mobile Image Card
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section className="relative py-12 sm:py-18 lg:py-24 bg-[#FAFAF7] overflow-hidden border-t border-[#2D5A1E]/10 select-none">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] sm:w-[750px] sm:h-[750px] bg-[#8CC63F]/[0.05] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Automated Sliding Image Gallery with Magnifier Hover */}
          <div className="lg:col-span-6 flex flex-col items-center w-full">
            <div
              onClick={() => setIsModalOpen(true)}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              role="button"
              tabIndex={0}
              aria-label="Click or tap to inspect clinical diagram"
              className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl bg-white border border-[#2D5A1E]/20 shadow-xl shadow-[#2D5A1E]/5 overflow-hidden flex items-center justify-center p-3 sm:p-5 cursor-pointer group active:scale-[0.99] transition-transform duration-200"
            >
              {/* Badge Overlay */}
              <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 z-20 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#2D5A1E]/20 shadow-xs flex items-center space-x-1.5 pointer-events-none">
                <Sparkles className="w-3 h-3 text-[#639E1F]" />
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D5A1E]">
                  Clinical Architecture
                </span>
              </div>

              {/* Top-Right Magnifying Indicator Pill */}
              <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#172B15]/85 backdrop-blur-md text-white shadow-sm flex items-center space-x-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <ZoomIn className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">
                  <span className="inline sm:hidden">Tap to Inspect</span>
                  <span className="hidden sm:inline">Click to Zoom</span>
                </span>
              </div>

              {/* Large Centered Magnifying Icon Overlay (Reveals on Hover) */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#172B15]/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 border border-[#2D5A1E]/25 shadow-2xl flex items-center justify-center text-[#2D5A1E] transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <ZoomIn className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                </div>
              </div>

              {/* Active Image (High Performance Pure CSS Fade Transition) */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  key={slideImages[currentIndex].src}
                  src={slideImages[currentIndex].src}
                  alt={slideImages[currentIndex].alt}
                  fill
                  priority={currentIndex === 0}
                  quality={80}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 580px"
                  className="object-contain w-full h-full rounded-2xl transform group-hover:scale-[1.02] transition-all duration-500 will-change-transform animate-in fade-in zoom-in-95"
                />
              </div>

              {/* Slide Navigation Dots */}
              <div
                className="absolute bottom-3.5 sm:bottom-5 z-20 flex items-center space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                {slideImages.map((_, dotIdx) => (
                  <button suppressHydrationWarning
                    key={dotIdx}
                    onClick={() => setCurrentIndex(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === dotIdx ? "w-6 bg-[#2D5A1E]" : "w-1.5 bg-[#2D5A1E]/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Product Overview, Titles, Descriptions & Buttons */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30">
              <Activity className="w-3.5 h-3.5 text-[#639E1F]" />
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.25em] text-[#639E1F]">
                maXilin Superprobiotics Series
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light tracking-tight text-[#172B15] leading-[1.18]">
              Advanced Formulation for <br className="hidden sm:inline" />
              <span className="font-serif italic text-[#639E1F]">Lifelong Vitality</span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Engineered with 40 billion active CFU multi-strain cultures, complex dietary fibers, prebiotics, and essential micronutrients. Designed to optimize gut microbalance, strengthen physiological mucosal defenses, and elevate metabolic health.
            </p>

            {/* Benefit Highlights List */}
            <div className="space-y-2.5 sm:space-y-3 pt-1 text-left max-w-xl mx-auto lg:mx-0">
              <div className="flex items-start space-x-3 p-3 sm:p-3.5 rounded-2xl bg-white border border-[#2D5A1E]/10 shadow-xs">
                <div className="w-5 h-5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm text-neutral-700 font-medium">
                  <strong>40 Billion CFU Probiotic Blend:</strong> Restores intestinal microflora and enhances resistance.
                </span>
              </div>

              <div className="flex items-start space-x-3 p-3 sm:p-3.5 rounded-2xl bg-white border border-[#2D5A1E]/10 shadow-xs">
                <div className="w-5 h-5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm text-neutral-700 font-medium">
                  <strong>Prebiotics &amp; Fibre Matrix:</strong> Nourishes beneficial bacteria and stabilizes digestion.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-3 w-full sm:w-auto">
              <Link
                href="/science"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all shadow-lg shadow-[#2D5A1E]/15 inline-flex items-center justify-center space-x-2 group shrink-0 active:scale-95"
              >
                <span>Discover Science</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/shop"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-[#2D5A1E]/30 text-[#172B15] text-xs font-bold uppercase tracking-widest hover:bg-[#F2F8ED] transition-all inline-flex items-center justify-center shrink-0 shadow-xs active:scale-95"
              >
                Explore Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl h-[80vh] sm:h-[84vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-4 sm:p-8"
          >
            {/* Top Toolbar */}
            <div className="absolute top-3 left-4 sm:top-4 sm:left-6 z-30 flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#172B15]/10 text-[#172B15]">
                {currentIndex + 1} / {slideImages.length}
              </span>
              <span className="text-xs font-semibold text-neutral-600 hidden sm:inline">
                {slideImages[currentIndex].alt}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 rounded-full bg-[#172B15] text-white hover:bg-[#2D5A1E] transition-colors shadow-lg cursor-pointer active:scale-90"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Nav Arrows */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-[#172B15]/85 hover:bg-[#172B15] text-white backdrop-blur-md shadow-lg transition-all cursor-pointer active:scale-90"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-[#172B15]/85 hover:bg-[#172B15] text-white backdrop-blur-md shadow-lg transition-all cursor-pointer active:scale-90"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* High-Resolution Modal Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                key={slideImages[currentIndex].src}
                src={slideImages[currentIndex].src}
                alt={slideImages[currentIndex].alt}
                fill
                quality={90}
                sizes="100vw"
                className="object-contain p-2 sm:p-4 animate-in fade-in zoom-in-95 duration-200"
                priority
              />
            </div>

            {/* Modal Bottom Dots */}
            <div className="absolute bottom-3 sm:bottom-4 z-30 flex items-center space-x-1.5">
              {slideImages.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Jump to image ${dotIdx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === dotIdx ? "w-6 bg-[#2D5A1E]" : "w-1.5 bg-[#2D5A1E]/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}