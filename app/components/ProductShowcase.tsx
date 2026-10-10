"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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
    description: "Formulated with 20 Billion CFU and active live strains to optimize gut microbiome harmony and systemic health.",
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
    description: "Clinical-grade daily synbiotic blend designed to restore mucosal membrane function and enhance daily resilience.",
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
    description: "Advanced probiotic formulation paired with potent antioxidant fruit extracts for maximum metabolic support.",
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
    description: "Targeted microbial culture built to increase body resistance against adverse external and environmental effects.",
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
    description: "Purifying probiotic stick engineered for gentle daily digestive cleansing and metabolic refreshment.",
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
    description: "Enzyme-infused probiotic matrix designed to accelerate digestion and optimize protein absorption.",
    image: "/prod6.png",
    benefits: [
      "Accelerates digestive breakdown",
      "Reduces post-meal sluggishness",
      "Clinical-grade potency",
    ],
  },
  // {
  //   id: "prod-7",
  //   slug: "energymax-liquid-core-330ml",
  //   tag: "LIQUID BIOTICS • 330ML",
  //   title: "EnergyMax Liquid Core",
  //   description: "Co-developed with Enleigmaa Nutraceuticals to deliver live probiotic cultures directly into your daily routine.",
  //   image: "/prod7.png",
  //   benefits: [
  //     "Strengthens and repairs gut lining",
  //     "Rapid systemic absorption",
  //     "Co-developed with international experts",
  //   ],
  // },
  // {
  //   id: "prod-8",
  //   slug: "vesna-nefes-lung-respiratory-complex",
  //   tag: "RESPIRATORY CARE • VESNA",
  //   title: "Vesna Nefes Lung Complex",
  //   description: "Specialized wellness box integrating targeted respiratory support sachets for clean, unobstructed vitality.",
  //   image: "/prod8.png",
  //   benefits: [
  //     "100% natural herbal & botanical blend",
  //     "Optimizes respiratory wellness",
  //     "Premium quality international standard",
  //   ],
  // },
  // {
  //   id: "prod-9",
  //   slug: "aqua-blue-cleansing-foam-dermatech",
  //   tag: "DERMA-TECH • SKINCARE",
  //   title: "Aqua Blue Cleansing Foam",
  //   description: "Advanced water silk foam formulation containing moisturizing ingredients that strengthen and protect the skin barrier.",
  //   image: "/prod9.png",
  //   benefits: [
  //     "Deep pore hydration & cleansing",
  //     "Strengthens natural skin barrier",
  //     "Dermatologically tested formula",
  //   ],
  // },
];

export default function ProfessionalProductGallery() {
  const [startIndex, setStartIndex] = useState<number>(0);
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
      setStartIndex((prev) => Math.min(catalogProducts.length - itemsPerView, prev + itemsPerView));
    }
  };

  const currentDesktopProducts = catalogProducts.slice(startIndex, startIndex + itemsPerView);

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 bg-[#FAFAF7] overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-[#8CC63F]/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30">
              <Sparkles className="w-3 h-3 text-[#639E1F]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#639E1F]">
                EnergyMax International Catalog
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#172B15]">
              Our <span className="font-serif italic text-[#639E1F]">Products</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
              Explore our clinically proven organic formulations designed to serve as your foundation for lifelong health and vitality.
            </p>
          </div>

          {/* Desktop Carousel Controls */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            <button
              onClick={handlePrev}
              disabled={!canPrev}
              aria-label="Previous 3 products"
              className={`p-3 rounded-full border transition-all shadow-sm ${
                canPrev
                  ? "border-[#2D5A1E]/30 bg-white text-[#172B15] hover:bg-[#172B15] hover:text-white cursor-pointer active:scale-95"
                  : "border-neutral-200 bg-neutral-100 text-neutral-400 opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext}
              aria-label="Next 3 products"
              className={`p-3 rounded-full border transition-all shadow-sm ${
                canNext
                  ? "border-[#2D5A1E]/30 bg-white text-[#172B15] hover:bg-[#172B15] hover:text-white cursor-pointer active:scale-95"
                  : "border-neutral-200 bg-neutral-100 text-neutral-400 opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop View: Exactly 3 Cards Carousel */}
        <div className="hidden lg:block overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={startIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-3 gap-8"
            >
              {currentDesktopProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-md shadow-[#2D5A1E]/5 hover:shadow-2xl hover:border-[#639E1F]/50 transition-all duration-500 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative w-full h-[280px] bg-[#F2F8ED]/60 overflow-hidden flex items-center justify-center p-6 border-b border-[#2D5A1E]/10">
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#2D5A1E]/15 shadow-sm">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D5A1E]">
                          {product.tag}
                        </span>
                      </div>

                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="350px"
                        className="object-contain p-4 transform group-hover:scale-105 transition-transform duration-700 drop-shadow-md"
                      />
                    </div>

                    {/* Details */}
                    <div className="p-7 space-y-3.5">
                      <h3 className="text-xl font-light text-[#172B15] tracking-tight group-hover:text-[#639E1F] transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed line-clamp-2">
                        {product.description}
                      </p>

                      <div className="pt-3 border-t border-neutral-100 space-y-2">
                        {product.benefits.map((benefit, bIdx) => (
                          <div key={bIdx} className="flex items-start space-x-2">
                            <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="text-xs text-neutral-700 font-medium leading-normal">
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Shop Now Linked Button */}
                  <div className="px-6 pb-6 pt-2">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#172B15] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md hover:bg-[#2D5A1E] transition-all duration-300 group/btn"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile View: Touch Swipe / Snap Carousel */}
        <div className="lg:hidden flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 -mx-6 px-6 touch-pan-x">
          {catalogProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-[85vw] sm:min-w-[340px] snap-center bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-md flex flex-col justify-between overflow-hidden shrink-0"
            >
              <div>
                <div className="relative w-full h-[250px] bg-[#F2F8ED]/60 overflow-hidden flex items-center justify-center p-4 border-b border-[#2D5A1E]/10">
                  <div className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#2D5A1E]/15 shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D5A1E]">
                      {product.tag}
                    </span>
                  </div>

                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="85vw"
                    className="object-contain p-4 drop-shadow-md"
                  />
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-light text-[#172B15] tracking-tight">
                    {product.title}
                  </h3>
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="pt-3 border-t border-neutral-100 space-y-2">
                    {product.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start space-x-2">
                        <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="text-xs text-neutral-700 font-medium">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <Link
                  href={`/shop/${product.slug}`}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#172B15] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md active:bg-[#2D5A1E]"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Global Shop CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-[#8CC63F] text-[#172B15] text-xs font-bold uppercase tracking-[0.25em] shadow-xl shadow-[#8CC63F]/20 hover:bg-[#7AB82A] hover:scale-[1.02] transition-all duration-300 group"
          >
            <span>Check All Products</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}