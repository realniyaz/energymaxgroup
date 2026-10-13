"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MoveHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CatalogItem {
  id: string;
  slug: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  benefits: string[];
}

const catalogProducts: CatalogItem[] = [
  {
    id: "prod-1",
    slug: "maxilin-superprobiotics-1-trillion-cfu-guava",
    tag: "MASTERSERIES • GUAVA",
    title: "maXilin Guava Probiotic",
    description:
      "Formulated with 20 Billion CFU and active live strains to optimize gut microbiome harmony and systemic health.",
    image: "/prod1.png",
    benefits: [
      "Maintains intestinal microflora balance",
      "Optimizes nutrient absorption & regularity",
      "Enriched with tropical bioactive extracts",
    ],
  },
  {
    id: "prod-2",
    slug: "maxilin-superprobiotics-1-trillion-cfu-vanilla",
    tag: "MASTERSERIES • VANILLA",
    title: "maXilin Vanilla Harmony",
    description:
      "Clinical-grade daily synbiotic blend designed to restore mucosal membrane function and enhance daily resilience.",
    image: "/prod2.png",
    benefits: [
      "Supports physiological mucosal defense",
      "Calms digestive stress and bloating",
      "Smooth organic vanilla infusion",
    ],
  },
  {
    id: "prod-3",
    slug: "maxilin-superprobiotics-1-trillion-cfu-green-apple",
    tag: "MASTERSERIES • GREENAPPLE",
    title: "maXilin Green Apple",
    description:
      "Advanced probiotic formulation paired with potent antioxidant fruit extracts for maximum metabolic support.",
    image: "/prod3.png",
    benefits: [
      "High natural bio-availability",
      "Fortifies immune system response",
      "Promotes sustained daily energy",
    ],
  },
  {
    id: "prod-4",
    slug: "maxilin-superprobiotics-1-trillion-cfu-passionfruit",
    tag: "MASTERSERIES • PASSION FRUIT",
    title: "maXilin Passion Defense",
    description:
      "Targeted microbial culture built to increase body resistance against adverse external and environmental effects.",
    image: "/prod4.png",
    benefits: [
      "Increases resistance to adverse factors",
      "Maintains metabolic equilibrium",
      "Refreshing exotic formulation",
    ],
  },
  {
    id: "prod-5",
    slug: "maxilin-superprobiotics-1-trillion-cfu-lemon",
    tag: "MASTERSERIES • LEMON",
    title: "maXilin Citrus Cleanse",
    description:
      "Purifying probiotic stick engineered for gentle daily digestive cleansing and metabolic refreshment.",
    image: "/prod5.png",
    benefits: [
      "Supports gentle natural detox pathways",
      "Balances internal pH and gut flora",
      "Vibrant citrus active profile",
    ],
  },
  {
    id: "prod-6",
    slug: "maxilin-superprobiotics-1-trillion-cfu-pineapple",
    tag: "MASTERSERIES • PINEAPPLE",
    title: "maXilin Enzyme Active",
    description:
      "Enzyme-infused probiotic matrix designed to accelerate digestion and optimize protein absorption.",
    image: "/prod6.png",
    benefits: [
      "Accelerates digestive breakdown",
      "Reduces post-meal sluggishness",
      "Clinical-grade potency",
    ],
  },
];

export default function ProfessionalProductGallery() {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number>(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  const itemsPerView = 3;
  const canPrev = startIndex > 0;
  const canNext = startIndex + itemsPerView < catalogProducts.length;

  const handlePrev = () => {
    if (canPrev) {
      setStartIndex((prev) => Math.max(0, prev - itemsPerView));
    }
  };

  const handleNext = () => {
    if (canNext) {
      setStartIndex((prev) =>
        Math.min(catalogProducts.length - itemsPerView, prev + itemsPerView)
      );
    }
  };

  // Sync mobile scroll position to track index
  const handleMobileScroll = useCallback(() => {
    if (!mobileScrollRef.current) return;
    const { scrollLeft, clientWidth } = mobileScrollRef.current;
    if (clientWidth === 0) return;
    const newIdx = Math.round(scrollLeft / (clientWidth * 0.82));
    setMobileActiveIndex(Math.min(catalogProducts.length - 1, Math.max(0, newIdx)));
  }, []);

  const scrollToMobileIndex = (index: number) => {
    if (!mobileScrollRef.current) return;
    const container = mobileScrollRef.current;
    const targetChild = container.children[index] as HTMLElement;
    if (targetChild) {
      isScrollingRef.current = true;
      container.scrollTo({
        left: targetChild.offsetLeft - 20,
        behavior: "smooth",
      });
      setMobileActiveIndex(index);
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 400);
    }
  };

  const currentDesktopProducts = catalogProducts.slice(
    startIndex,
    startIndex + itemsPerView
  );

  return (
    <section className="relative py-16 sm:py-24 lg:py-28 bg-[#FAFAF7] overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-[#8CC63F]/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 lg:mb-16 gap-6">
          <div className="space-y-3 max-w-2xl text-center md:text-left mx-auto md:mx-0">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#639E1F]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#639E1F]">
                EnergyMax International Catalog
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#172B15]">
              Our <span className="font-serif italic text-[#639E1F]">Products</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed max-w-xl">
              Explore our clinically proven organic formulations designed to serve as your foundation for lifelong health and vitality.
            </p>
          </div>

          {/* Desktop Carousel Controls */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            <button
              onClick={handlePrev}
              disabled={!canPrev}
              aria-label="Previous 3 products"
              className={`p-3 rounded-full border transition-all duration-200 shadow-sm ${
                canPrev
                  ? "border-[#2D5A1E]/30 bg-white text-[#172B15] hover:bg-[#172B15] hover:text-white cursor-pointer active:scale-95"
                  : "border-neutral-200 bg-neutral-100 text-neutral-300 opacity-50 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext}
              aria-label="Next 3 products"
              className={`p-3 rounded-full border transition-all duration-200 shadow-sm ${
                canNext
                  ? "border-[#2D5A1E]/30 bg-white text-[#172B15] hover:bg-[#172B15] hover:text-white cursor-pointer active:scale-95"
                  : "border-neutral-200 bg-neutral-100 text-neutral-300 opacity-50 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MOBILE VIEW: Visual swipe cue line */}
        <div className="lg:hidden flex items-center justify-between px-1 mb-4">
          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-[#639E1F]">
            <MoveHorizontal className="w-3.5 h-3.5 animate-pulse text-[#639E1F]" />
            <span>Swipe horizontally or scroll down</span>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-neutral-400">
            <span className="text-[#172B15] font-bold">{mobileActiveIndex + 1}</span>
            <span>/</span>
            <span>{catalogProducts.length}</span>
          </div>
        </div>

        {/* Dynamic Micro Progress Bar for Mobile */}
        <div className="lg:hidden w-full h-[2px] bg-neutral-200/70 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#639E1F] to-[#8CC63F] transition-all duration-300 ease-out"
            style={{
              width: `${((mobileActiveIndex + 1) / catalogProducts.length) * 100}%`,
            }}
          />
        </div>

        {/* DESKTOP VIEW: 3-Cards Carousel with Framer Transitions */}
        <div className="hidden lg:block overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={startIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-3 gap-8"
            >
              {currentDesktopProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm hover:shadow-xl hover:border-[#639E1F]/50 transition-all duration-500 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Clickable Image Section */}
                    <Link
                      href={`/shop/${product.slug}`}
                      className="relative w-full h-[270px] bg-[#F2F8ED]/60 overflow-hidden flex items-center justify-center p-6 border-b border-[#2D5A1E]/10 block"
                    >
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#2D5A1E]/15 shadow-xs">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D5A1E]">
                          {product.tag}
                        </span>
                      </div>

                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="380px"
                        className="object-contain p-4 transform group-hover:scale-105 transition-transform duration-700 drop-shadow-md"
                      />
                    </Link>

                    {/* Details */}
                    <div className="p-7 space-y-3.5">
                      <Link href={`/shop/${product.slug}`}>
                        <h3 className="text-xl font-light text-[#172B15] tracking-tight group-hover:text-[#639E1F] transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed line-clamp-2">
                        {product.description}
                      </p>

                      <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                        {product.benefits.map((benefit, bIdx) => (
                          <div key={bIdx} className="flex items-start space-x-2">
                            <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="text-xs text-neutral-700 font-medium leading-snug">
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Button Footer */}
                  <div className="px-7 pb-7 pt-2">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#172B15] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md hover:bg-[#2D5A1E] transition-all duration-300 group/btn"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* MOBILE VIEW: Unlocked Vertical & Horizontal Native Gestures */}
        <div
          ref={mobileScrollRef}
          onScroll={handleMobileScroll}
          className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 -mx-5 px-5 touch-auto overscroll-x-contain overscroll-y-auto"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollPaddingLeft: "20px",
            scrollPaddingRight: "20px",
          }}
        >
          {catalogProducts.map((product) => (
            <div
              key={product.id}
              className="w-[82vw] max-w-[325px] snap-start bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm flex flex-col justify-between overflow-hidden shrink-0"
            >
              <div>
                <Link
                  href={`/shop/${product.slug}`}
                  className="relative w-full h-[230px] bg-[#F2F8ED]/60 overflow-hidden flex items-center justify-center p-4 border-b border-[#2D5A1E]/10 block"
                >
                  <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#2D5A1E]/15 shadow-xs">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D5A1E]">
                      {product.tag}
                    </span>
                  </div>

                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="82vw"
                    className="object-contain p-4 drop-shadow-md"
                  />
                </Link>

                <div className="p-5 space-y-3">
                  <Link href={`/shop/${product.slug}`}>
                    <h3 className="text-lg font-light text-[#172B15] tracking-tight">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="pt-3 border-t border-neutral-100 space-y-2">
                    {product.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start space-x-2">
                        <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="text-xs text-neutral-700 font-medium leading-snug">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2">
                <Link
                  href={`/shop/${product.slug}`}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#172B15] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md active:bg-[#2D5A1E]"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Interactive Indicator Dots */}
        <div className="flex lg:hidden items-center justify-center space-x-2 pt-2">
          {catalogProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToMobileIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                mobileActiveIndex === idx
                  ? "w-6 bg-[#2D5A1E]"
                  : "w-2 bg-[#2D5A1E]/20"
              }`}
            />
          ))}
        </div>

        {/* Global Shop CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-[#8CC63F] text-[#172B15] text-xs font-bold uppercase tracking-[0.25em] shadow-lg shadow-[#8CC63F]/20 hover:bg-[#7AB82A] hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
          >
            <span>Check All Products</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}