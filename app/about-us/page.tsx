"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Quote } from "lucide-react";
import Image from "next/image";
import LuxuryNavbar from "../components/Navbar";
import LuxuryFooter from "../components/LuxuryFooter";

const timelineEvents = [
  {
    year: "2019",
    title: "Official Launch",
    description: "Official launch of EnergyMax Group.",
    position: "bottom"
  },
  {
    year: "2019",
    title: "Market Expansion",
    description: "Opened markets in Kazakhstan, Kyrgyzstan, and Mongolia.",
    position: "top"
  },
  {
    year: "2020",
    title: "Regional Office",
    description: "Established regional office in Uzbekistan.",
    position: "bottom"
  },
  {
    year: "2021",
    title: "Manufacturing Plant",
    description: "Opened manufacturing plant for Maxilin products.",
    position: "top"
  },
  {
    year: "2022",
    title: "Global Headquarters",
    description: "Established regional headquarters in the UAE and expanded operations.",
    position: "bottom"
  },
  {
    year: "2022",
    title: "World Expo",
    description: "Official participant and exhibitor at the World Expo in Dubai.",
    position: "top"
  }
];

export default function AboutPage() {
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
              Empowering Wellness &bull; Inspiring Success
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.15]">
            United to create a <span className="font-serif italic text-[#8CC63F]">better world</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 font-normal max-w-3xl mx-auto leading-relaxed">
            Welcome to EnergyMax Group. We are a global community dedicated to enhancing lives through premium wellness products and innovative business opportunities. We believe that true success comes from collaboration. Partner with us to access world-class tools, elevate your lifestyle, and make a real impact.
          </p>
        </div>
      </section>

      {/* Buddha Quote Section */}
      <section className="py-20 lg:py-28 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 sm:p-12 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 relative space-y-6"
        >
          <Quote className="w-10 h-10 text-[#639E1F]/30 mx-auto" />
          <blockquote className="text-lg sm:text-2xl font-light italic text-[#172B15] leading-relaxed">
            "Happiness lies, first of all, in health. To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear."
          </blockquote>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#639E1F] block">
            — Buddha
          </span>
        </motion.div>
      </section>

      {/* Approach & Philosophy */}
      <section className="py-16 bg-[#F2F8ED]/50 border-t border-b border-[#2D5A1E]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F] block">
              Core Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-[#172B15] leading-tight">
              Elevating your lifestyle through <span className="font-serif italic text-[#639E1F]">collaboration</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Our comprehensive approach creates a unique opportunity for you to elevate your lifestyle and confidence. We equip our Partners with the very best: premium wellness products, trusted brands, and ready-to-use tools designed to support your daily journey.
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              We believe that building a business should be flexible, rewarding, and fun. At EnergyMax Group, your voice matters. We put the ideas and contributions of our Partners at the core of our decisions, giving you every right to be proud of our shared success.
            </p>
          </div>

          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 sm:p-10 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-6 text-center"
            >
              <Quote className="w-8 h-8 text-[#639E1F]/30 mx-auto" />
              <blockquote className="text-base sm:text-lg font-light italic text-[#172B15] leading-relaxed">
                "Imagination is not the talent of some, but the health of everyone."
              </blockquote>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
                — Ralph Waldo Emerson
              </span>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-4 mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#639E1F] block">
            Our Journey & Milestone Growth
          </span>
          <h2 className="text-3xl sm:text-5xl font-light text-[#172B15]">
            Through the <span className="font-serif italic text-[#639E1F]">Years</span>
          </h2>
          <div className="w-12 h-[1px] bg-[#639E1F]/40 mx-auto mt-4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop Sinuous Wave Timeline */}
          <div className="hidden lg:block relative py-20">
            {/* SVG Wave Line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg viewBox="0 0 1200 200" fill="none" className="w-full text-[#8CC63F]/40 stroke-current stroke-2">
                <path d="M0 100 C 200 0, 400 200, 600 100 C 800 0, 1000 200, 1200 100" />
              </svg>
            </div>

            <div className="grid grid-cols-6 gap-4 relative z-10">
              {timelineEvents.map((item, idx) => {
                const isTop = item.position === "top";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: isTop ? -20 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`flex flex-col items-center text-center ${isTop ? "pb-24 justify-end" : "pt-24 justify-start"}`}
                  >
                    {isTop && (
                      <div className="mb-6 max-w-[160px] space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B15]">{item.title}</h4>
                        <p className="text-[11px] text-neutral-600 leading-snug">{item.description}</p>
                      </div>
                    )}

                    {/* Circle Node */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-[#8CC63F] shadow-lg shadow-[#2D5A1E]/10 flex items-center justify-center shrink-0">
                      <span className="text-lg sm:text-xl font-serif text-[#172B15] font-medium">{item.year}</span>
                    </div>

                    {!isTop && (
                      <div className="mt-6 max-w-[160px] space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B15]">{item.title}</h4>
                        <p className="text-[11px] text-neutral-600 leading-snug">{item.description}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile & Tablet Vertical Timeline */}
          <div className="lg:hidden relative border-l-2 border-[#8CC63F]/30 ml-6 sm:ml-12 space-y-12 py-4">
            {timelineEvents.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative pl-8 sm:pl-10 space-y-2"
              >
                {/* Bullet Node */}
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-white border-2 border-[#8CC63F] flex items-center justify-center shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#2D5A1E]" />
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-[#639E1F]">{item.year}</span>
                <h3 className="text-base font-semibold text-[#172B15]">{item.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership / President Section with president.png */}
      <section className="py-20 lg:py-28 bg-white border-t border-b border-[#2D5A1E]/10">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FAFAF7] border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#8CC63F]/40 shrink-0 shadow-md bg-neutral-900">
                <Image
                  src="/president.png"
                  alt="Nurym Abdykalykov - President"
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F] block">
                  Executive Leadership
                </span>
                <h3 className="text-2xl sm:text-3xl font-light text-[#172B15]">Nurym Abdykalykov</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">President of the Company</p>
              </div>
            </div>

            <div className="relative pt-6 border-t border-neutral-200">
              <Quote className="w-8 h-8 text-[#639E1F]/20 absolute -top-4 right-0" />
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic">
                "No matter where you started or how you joined our community, we are now united in our goal to create a better world for everyone around us. As a Partner, you are at the center of the incredible global vision we are creating together. We believe in you, invest in you, and empower you to be your best self."
              </p>
            </div>
          </div>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}