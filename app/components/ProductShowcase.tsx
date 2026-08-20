"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const catalogProducts = [
  {
    id: "prod-1",
    tag: "MASTERSERIES • GUAVA",
    title: "maXilin Guava Probiotic",
    description: "Formulated with 20 Billion CFU and active live strains to optimize gut microbiome harmony and systemic health.",
    image: "/prod1.png",
    benefits: [
      "Maintains intestinal microflora balance",
      "Optimizes nutrient absorption & regularity",
      "Enriched with tropical bioactive extracts"
    ]
  },
  {
    id: "prod-2",
    tag: "MASTERSERIES • VANILLA",
    title: "maXilin Vanilla Harmony",
    description: "Clinical-grade daily synbiotic blend designed to restore mucosal membrane function and enhance daily resilience.",
    image: "/prod2.png",
    benefits: [
      "Supports physiological mucosal defense",
      "Calms digestive stress and bloating",
      "Smooth organic vanilla infusion"
    ]
  },
  {
    id: "prod-3",
    tag: "MASTERSERIES • AMLA",
    title: "maXilin Crisp Amla",
    description: "Advanced probiotic formulation paired with potent antioxidant fruit extracts for maximum metabolic support.",
    image: "/prod3.png",
    benefits: [
      "High natural bio-availability",
      "Fortifies immune system response",
      "Promotes sustained daily energy"
    ]
  },
  {
    id: "prod-4",
    tag: "MASTERSERIES • PASSION FRUIT",
    title: "maXilin Passion Defense",
    description: "Targeted microbial culture built to increase body resistance against adverse external and environmental effects.",
    image: "/prod4.png",
    benefits: [
      "Increases resistance to adverse factors",
      "Maintains metabolic equilibrium",
      "Refreshing exotic formulation"
    ]
  },
  {
    id: "prod-5",
    tag: "MASTERSERIES • LEMON",
    title: "maXilin Citrus Cleanse",
    description: "Purifying probiotic stick engineered for gentle daily digestive cleansing and metabolic refreshment.",
    image: "/prod5.png",
    benefits: [
      "Supports gentle natural detox pathways",
      "Balances internal pH and gut flora",
      "Vibrant citrus active profile"
    ]
  },
  {
    id: "prod-6",
    tag: "MASTERSERIES • PINEAPPLE",
    title: "maXilin Enzyme Active",
    description: "Enzyme-infused probiotic matrix designed to accelerate digestion and optimize protein absorption.",
    image: "/prod6.png",
    benefits: [
      "Accelerates digestive breakdown",
      "Reduces post-meal sluggishness",
      "Clinical-grade potency"
    ]
  },
  {
    id: "prod-7",
    tag: "LIQUID BIOTICS • 330ML",
    title: "EnergyMax Liquid Core",
    description: "Co-developed with Enleigmaa Nutraceuticals to deliver live probiotic cultures directly into your daily routine.",
    image: "/prod7.png",
    benefits: [
      "Strengthens and repairs gut lining",
      "Rapid systemic absorption",
      "Co-developed with international experts"
    ]
  },
  {
    id: "prod-8",
    tag: "RESPIRATORY CARE • VESNA",
    title: "Vesna Nefes Lung Complex",
    description: "Specialized wellness box integrating targeted respiratory support sachets for clean, unobstructed vitality.",
    image: "/prod8.png",
    benefits: [
      "100% natural herbal & botanical blend",
      "Optimizes respiratory wellness",
      "Premium quality international standard"
    ]
  },
  {
    id: "prod-9",
    tag: "DERMA-TECH • SKINCARE",
    title: "Aqua Blue Cleansing Foam",
    description: "Advanced water silk foam formulation containing moisturizing ingredients that strengthen and protect the skin barrier.",
    image: "/prod9.png",
    benefits: [
      "Deep pore hydration & cleansing",
      "Strengthens natural skin barrier",
      "Dermatologically tested formula"
    ]
  }
];

export default function ProfessionalProductGallery() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const offset = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      sliderRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 bg-[#FAFAF7] overflow-hidden">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-[#8CC63F]/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header with Desktop Scroll Controls */}
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

          {/* Desktop Carousel Arrow Navigation */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-3 rounded-full border border-[#2D5A1E]/20 bg-white text-[#172B15] hover:bg-[#172B15] hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-3 rounded-full border border-[#2D5A1E]/20 bg-white text-[#172B15] hover:bg-[#172B15] hover:text-white transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Container: Horizontal Snap Slider on Mobile, Grid on Desktop */}
        <div
          ref={sliderRef}
          className="flex lg:grid lg:grid-cols-3 gap-6 sm:gap-8 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none pb-6 -mx-6 px-6 lg:mx-0 lg:px-0"
        >
          {catalogProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (idx % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-[300px] sm:min-w-[350px] lg:min-w-0 snap-start group bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-md shadow-[#2D5A1E]/5 hover:shadow-2xl hover:border-[#639E1F]/50 transition-all duration-500 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Product Image Box */}
                <div className="relative w-full h-[260px] sm:h-[300px] bg-[#F2F8ED]/60 overflow-hidden flex items-center justify-center p-6 border-b border-[#2D5A1E]/10">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#2D5A1E]/15 shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D5A1E]">
                      {product.tag}
                    </span>
                  </div>

                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 300px, 350px"
                    className="object-contain p-4 transform group-hover:scale-105 transition-transform duration-700 drop-shadow-md"
                  />
                </div>

                {/* Product Text Details */}
                <div className="p-6 sm:p-7 space-y-3.5">
                  <h3 className="text-xl font-light text-[#172B15] tracking-tight group-hover:text-[#639E1F] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed line-clamp-2">
                    {product.description}
                  </p>

                  {/* Benefit Bullet Points */}
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

              {/* Action Button Footer */}
              <div className="px-6 pb-6 pt-2">
                <Link
                  href="/shop"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#172B15] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md hover:bg-[#2D5A1E] transition-all duration-300 group/btn"
                >
                  <span>Inquire / Acquire</span>
                  <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA to Check All Products */}
        <div className="mt-16 text-center">
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