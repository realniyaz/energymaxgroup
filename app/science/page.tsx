"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Activity, Layers, FileSpreadsheet, HeartPulse, ZoomIn, X, Check, FlaskConical } from "lucide-react";
import Image from "next/image";
import LuxuryNavbar from "../components/Navbar";
import LuxuryFooter from "../components/LuxuryFooter";

// 3 Core Science & Formulation Diagrams (PNGs)
const sciencePanels = [
  {
    id: "ingredients",
    title: "Key Ingredients & Matrix",
    tag: "Apothecary Composition",
    description: "Detailed breakdown of dietary fibers, active probiotic strains, prebiotics, vitamins, and minerals.",
    image: "/ing1.png"
  },
  {
    id: "composition",
    title: "Quantitative Composition (Per Serving)",
    tag: "Clinical Dosage Matrix",
    description: "Precise milligram and CFU measurements totaling 2000.834 mg per active serving.",
    image: "/ing2.png"
  },
  {
    id: "benefits",
    title: "Systemic Health Benefits",
    tag: "Physiological Impact",
    description: "Targeted health pathways supporting digestion, immunity, gut flora harmony, and inflammation reduction.",
    image: "/ing3.png"
  }
];

export default function DiscoverSciencePage() {
  const [activeTab, setActiveTab] = useState<string>("ingredients");
  const [modalImage, setModalImage] = useState<{ title: string; image: string } | null>(null);

  const currentPanel = sciencePanels.find((p) => p.id === activeTab) || sciencePanels[0];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30 overflow-x-hidden">
      <LuxuryNavbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Advanced Biotechnology &bull; Clinical Excellence
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.15]">
            Discover the Science of <span className="font-serif italic text-[#8CC63F]">Microbiome Mastery</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 font-normal max-w-3xl mx-auto leading-relaxed">
            Explore our clinical-grade formulations engineered at the molecular tier. Combining 40 billion active CFU live strains with precise prebiotics and vital micronutrients to serve as your foundation for lifelong health.
          </p>
        </div>
      </section>

      {/* Interactive Scientific Diagrams Section */}
      <section className="py-20 lg:py-28 bg-white overflow-hidden border-b border-[#2D5A1E]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30">
              <FlaskConical className="w-3.5 h-3.5 text-[#639E1F]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#639E1F]">
                Official Formulation Blueprints
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#172B15]">
              Interactive <span className="font-serif italic text-[#639E1F]">Technical Data</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Select a category below to inspect our certified ingredient architecture, exact serving weights, and clinical health benefits.
            </p>

            {/* Tab Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setActiveTab("ingredients")}
                className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "ingredients"
                    ? "bg-[#172B15] text-white shadow-lg shadow-[#2D5A1E]/20"
                    : "bg-[#FAFAF7] text-neutral-700 border border-[#2D5A1E]/20 hover:bg-[#F2F8ED]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Key Ingredients</span>
              </button>

              <button
                onClick={() => setActiveTab("composition")}
                className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "composition"
                    ? "bg-[#172B15] text-white shadow-lg shadow-[#2D5A1E]/20"
                    : "bg-[#FAFAF7] text-neutral-700 border border-[#2D5A1E]/20 hover:bg-[#F2F8ED]"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Composition (2000.834 mg)</span>
              </button>

              <button
                onClick={() => setActiveTab("benefits")}
                className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "benefits"
                    ? "bg-[#172B15] text-white shadow-lg shadow-[#2D5A1E]/20"
                    : "bg-[#FAFAF7] text-neutral-700 border border-[#2D5A1E]/20 hover:bg-[#F2F8ED]"
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Systemic Benefits</span>
              </button>
            </div>
          </div>

          {/* Active Image Display Container with Lightbox Click */}
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setModalImage({ title: currentPanel.title, image: currentPanel.image })}
                className="group relative w-full rounded-3xl overflow-hidden bg-[#FAFAF7] border border-[#2D5A1E]/25 shadow-2xl shadow-[#2D5A1E]/10 p-4 sm:p-8 cursor-pointer"
              >
                {/* Zoom overlay badge */}
                <div className="absolute top-6 right-6 z-20 px-3.5 py-1.5 rounded-full bg-[#172B15] text-white shadow-lg flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4 text-[#8CC63F]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Click to Zoom</span>
                </div>

                <div className="mb-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">{currentPanel.tag}</span>
                  <h3 className="text-xl sm:text-2xl font-light text-[#172B15]">{currentPanel.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600">{currentPanel.description}</p>
                </div>

                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-white border border-[#2D5A1E]/10 shadow-inner flex items-center justify-center">
                  <Image
                    src={currentPanel.image}
                    alt={currentPanel.title}
                    fill
                    priority
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-contain w-full h-full transform group-hover:scale-[1.01] transition-transform duration-500"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* Clinical Highlights Breakdown Section */}
      <section className="py-20 lg:py-28 bg-[#FAFAF7] border-b border-[#2D5A1E]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#639E1F] block">
              Molecular Tier Engineering
            </span>
            <h2 className="text-3xl sm:text-5xl font-light text-[#172B15]">
              The Four Pillars of <span className="font-serif italic text-[#639E1F]">Probiotic Efficacy</span>
            </h2>
            <div className="w-12 h-[1px] bg-[#639E1F]/40 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-8 shadow-xl shadow-[#2D5A1E]/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-light text-[#172B15]">40 Billion Active CFU Strains</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Contains high-potency live strains including Lactobacillus acidophilus (15B cfu), Streptococcus thermophilus (5B cfu), Lactobacillus casei, Lactiplantibacillus plantarum, Bifidobacterium bifidum, and breve to guarantee targeted colonization.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-8 shadow-xl shadow-[#2D5A1E]/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-light text-[#172B15]">Prebiotic &amp; Dietary Fiber Matrix</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Enriched with Resistant Dextrin, Inulin, Fructooligosaccharides (FOS), and Xylo-oligosaccharides (XOS) to nourish microflora, regulate digestion, and help control blood sugar and cholesterol levels.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-8 shadow-xl shadow-[#2D5A1E]/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-light text-[#172B15]">Essential Vitamins &amp; Minerals</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Fortified with B-complex vitamins (B1, B2, B3, B12), Biotin (B7), Vitamin K2, Folic Acid (B9), Magnesium, and Zinc to boost natural immunity, produce sustained cellular energy, and support metabolism.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-8 shadow-xl shadow-[#2D5A1E]/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-light text-[#172B15]">100% Clean &amp; Conscious Profile</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Formulated with natural acidity regulators (Citric Acid) and sweetened exclusively with premium Monk Fruit extract and Erythritol. Contains zero artificial flavors, zero added sugar, and is certified gluten-free.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Full-Screen Zoom Lightbox Modal */}
      <AnimatePresence>
        {modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalImage(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6 sm:p-8"
            >
              <button
                onClick={() => setModalImage(null)}
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-[#172B15] text-white hover:bg-[#2D5A1E] transition-colors shadow-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4 pr-12">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F] block">High-Resolution Scientific Blueprint</span>
                <h3 className="text-lg sm:text-2xl font-light text-[#172B15]">{modalImage.title}</h3>
              </div>

              <div className="relative w-full h-[70vh] bg-[#FAFAF7] rounded-2xl border border-[#2D5A1E]/10 overflow-hidden flex items-center justify-center p-4">
                <Image
                  src={modalImage.image}
                  alt={modalImage.title}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LuxuryFooter />
    </div>
  );
}