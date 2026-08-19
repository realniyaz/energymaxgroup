"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";

const catalogProducts = [
  {
    id: "prod-1",
    tag: "MASTERSERIES &bull; GUAVA",
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
    tag: "MASTERSERIES &bull; VANILLA",
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
    tag: "MASTERSERIES &bull; AMLA",
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
    tag: "MASTERSERIES &bull; PASSION FRUIT",
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
    tag: "MASTERSERIES &bull; LEMON",
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
    tag: "MASTERSERIES &bull; PINEAPPLE",
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
    tag: "LIQUID BIOTICS &bull; 330ML",
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
    tag: "RESPIRATORY CARE &bull; VESNA",
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
    tag: "DERMA-TECH &bull; SKINCARE",
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
  return (
    <section className="relative py-24 lg:py-32 bg-[#FAFAF7] overflow-hidden">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[900px] h-[900px] bg-[#8CC63F]/[0.05] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-24">
          <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#639E1F] block">
            EnergyMax International Catalog
          </span>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#172B15]">
            Professional <span className="font-serif italic text-[#639E1F]">Product Gallery</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
            Explore our clinically proven organic formulations designed to serve as your foundation for lifelong health and vitality.
          </p>
        </div>

        {/* 3-Column Product Gallery Grid (Fully Responsive for Mobile & Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {catalogProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (idx % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-lg shadow-[#2D5A1E]/5 hover:shadow-2xl hover:border-[#639E1F]/50 transition-all duration-500 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Product Image Container */}
                <div className="relative w-full h-[280px] sm:h-[320px] bg-[#F2F8ED]/50 overflow-hidden flex items-center justify-center p-6 border-b border-[#2D5A1E]/10">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#2D5A1E]/15 shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D5A1E]" dangerouslySetInnerHTML={{ __html: product.tag }} />
                  </div>

                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    priority
                    className="object-contain p-4 transform group-hover:scale-105 transition-transform duration-700 drop-shadow-md"
                  />
                </div>

                {/* Product Text Details */}
                <div className="p-6 sm:p-8 space-y-4">
                  <h3 className="text-xl sm:text-2xl font-light text-[#172B15] tracking-tight group-hover:text-[#639E1F] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                    {product.description}
                  </p>

                  {/* Benefit Bullet Points */}
                  <div className="pt-4 border-t border-neutral-100 space-y-2.5">
                    {product.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start space-x-2.5">
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
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2">
                <a
                  href="#shop"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#2D5A1E] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md hover:bg-[#234717] transition-all duration-300 group/btn"
                >
                  <span>Inquire / Acquire</span>
                  <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}