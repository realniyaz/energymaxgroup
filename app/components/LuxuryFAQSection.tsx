"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Sparkles, HelpCircle } from "lucide-react";

const faqs = [
  {
    id: "faq-1",
    question: "What makes EnergyMax probiotic formulations clinical-grade?",
    answer: "Our formulations combine 20 billion CFU active live microbial strains engineered at the molecular tier to survive gastric acidity, ensuring maximum bio-availability and targeted gut microbiome colonization."
  },
  {
    id: "faq-2",
    question: "How do I select the right flavor or formulation for my daily routine?",
    answer: "Each edition—ranging from Guava and Vanilla to Amla and Passion Fruit—provides core probiotic microbalance paired with unique bioactive fruit and herbal extracts tailored for specific metabolic and immune goals."
  },
  {
    id: "faq-3",
    question: "Are EnergyMax and maXilin products organic and certified?",
    answer: "Yes. All EnergyMax Group offerings adhere to rigorous international biotechnology standards, utilizing certified 100% natural organic ingredients with zero artificial fillers."
  },
  {
    id: "faq-4",
    question: "How should probiotic sticks or liquid core bottles be stored?",
    answer: "Store in a cool, dry place away from direct sunlight. Our advanced packaging guarantees potency and live culture preservation throughout shelf life without requiring refrigeration."
  },
  {
    id: "faq-5",
    question: "What is the recommended daily usage for optimal gut health?",
    answer: "We recommend consuming one stick or serving daily with water or your favorite beverage to consistently maintain microbalance and support mucosal membrane function."
  }
];

export default function LuxuryFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#FAFAF7] via-[#F2F8ED] to-[#FAFAF7] overflow-hidden">
      
      {/* Background Soft Glow Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[700px] h-[700px] bg-[#8CC63F]/[0.05] rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5 mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-[#2D5A1E]/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#639E1F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2D5A1E]">
              Expert Guidance
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#172B15]">
            Frequently Asked <span className="font-serif italic text-[#639E1F]">Questions</span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
            Everything you need to know about our clinical-grade organic probiotics, formulations, and daily wellness standards.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-xl ${
                  isOpen
                    ? "border-[#639E1F] shadow-xl shadow-[#2D5A1E]/10"
                    : "border-[#2D5A1E]/15 hover:border-[#639E1F]/40 shadow-sm"
                }`}
              >
                <button
                  suppressHydrationWarning
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 sm:px-8 py-5 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-medium text-[#172B15] tracking-tight group-hover:text-[#639E1F] transition-colors pr-4">
                    {faq.question}
                  </span>

                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    isOpen ? "bg-[#2D5A1E] text-white" : "bg-[#8CC63F]/10 text-[#2D5A1E] group-hover:bg-[#8CC63F]/20"
                  }`}>
                    {isOpen ? <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 sm:px-8 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed border-t border-neutral-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Support Callout */}
        <div className="mt-10 p-6 rounded-2xl bg-white/75 border border-[#2D5A1E]/15 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A1E]/10 text-[#2D5A1E] flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#172B15]">
                Have additional questions?
              </h4>
              <p className="text-[11px] sm:text-xs text-neutral-600">
                Our global wellness specialists are ready to assist you.
              </p>
            </div>
          </div>

          <a
            href="#contact"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D5A1E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-md shrink-0 text-center"
          >
            Contact Help Centre
          </a>
        </div>

      </div>
    </section>
  );
}