"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Quote, Award, ShieldCheck, ZoomIn, X, FileText, Download, ExternalLink } from "lucide-react";
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

const leadershipTeam = [
  {
    name: "Nurym Abdykalykov",
    role: "President of the Company",
    image: "/president.png",
    bio: "No matter where you started or how you joined our community, we are now united in our goal to create a better world for everyone around us. As a Partner, you are at the center of the incredible global vision we are creating together."
  },
  {
    name: "Executive VP",
    role: "VP of the Company",
    image: "/VP.png",
    bio: "Driving operational excellence and international expansion across regional markets to ensure world-class standards in every product and partnership."
  },
  {
    name: "Director of Production",
    role: "Production Director",
    image: "/cofounder.png",
    bio: "Overseeing advanced biotechnology manufacturing and clinical-grade quality assurance for our entire probiotic and wellness range."
  },
  {
    name: "Global Ambassador",
    role: "Company Ambassador",
    image: "/ambassdor.png",
    bio: "Championing our core values and building vibrant partner communities worldwide to inspire lasting health and success."
  }
];

// 7 Official PDF Certifications & Licenses
const certifications = [
  { 
    id: 1, 
    title: "Certificate of Incorporation", 
    issuer: "Ministry of Corporate Affairs, India", 
    document: "/SPICE Part B_Approval Letter.pdf" 
  },
  { 
    id: 2, 
    title: "Importer-Exporter Code (IEC)", 
    issuer: "Directorate General of Foreign Trade", 
    document: "/certificateOfIEC.pdf" 
  },
  { 
    id: 3, 
    title: "Food Safety License (FSSAI)", 
    issuer: "Food Safety and Standards Authority of India", 
    document: "/license.pdf" 
  },
  { 
    id: 4, 
    title: "GST Registration Certificate", 
    issuer: "Goods and Services Tax Network", 
    document: "/ENERGYMAX GLOBAL PRIVATE LIMITED GST CERTIFICATE (2).pdf" 
  },
  { 
    id: 5, 
    title: "MSME Udyam Registration", 
    issuer: "Ministry of MSME, Government of India", 
    document: "/ENERGYMAX GLOBAL PRIVATE LIMITED MSME.pdf" 
  },
  { 
    id: 6, 
    title: "Startup India Recognition Certificate", 
    issuer: "DPIIT, Ministry of Commerce & Industry", 
    document: "/Startup India Registration Certificate.pdf" 
  },
  { 
    id: 7, 
    title: "International Copyright Deposit Certificate", 
    issuer: "INTEROCO Copyright Office, Europe", 
    document: "/EC-01-004783.pdf" 
  },
  { 
    id: 8, 
    title: "London Rate Valuation Certificate", 
    issuer: "London Rate", 
    document: "/6081186452-2160x3120.pdf" 
  },
];

export default function AboutPage() {
  const [selectedCert, setSelectedCert] = useState<{ title: string; document: string; issuer: string } | null>(null);

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
            &ldquo;Happiness lies, first of all, in health. To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.&rdquo;
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
                &ldquo;Imagination is not the talent of some, but the health of everyone.&rdquo;
              </blockquote>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
                — Ralph Waldo Emerson
              </span>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Licenses & Certifications PDF Gallery Section */}
      <section className="py-20 lg:py-28 bg-white border-b border-[#2D5A1E]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#639E1F]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F]">
                Compliance &amp; Accreditation
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#172B15]">
              Licenses &amp; <span className="font-serif italic text-[#639E1F]">Certifications</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              EnergyMax Global Private Limited operates under rigorous international quality standards, holding full official accreditations, statutory licenses, and intellectual asset registrations. Click any official PDF document below to inspect.
            </p>
          </div>

          {/* 7 Certification Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {certifications.map((cert) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: cert.id * 0.05 }}
                onClick={() => setSelectedCert(cert)}
                className="group bg-[#FAFAF7] rounded-3xl border border-[#2D5A1E]/15 p-6 shadow-sm hover:shadow-xl hover:border-[#639E1F]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* PDF Document Preview Icon Container */}
                <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-white border border-[#2D5A1E]/10 shadow-inner flex flex-col items-center justify-center p-4 mb-5 group-hover:bg-[#F2F8ED] transition-colors">
                  <div className="absolute inset-0 bg-[#172B15]/80 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center text-white space-x-2">
                    <ZoomIn className="w-5 h-5 text-[#8CC63F]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Inspect PDF</span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mb-2 shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Official PDF Document</span>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[#639E1F]">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Certificate #{cert.id < 10 ? `0${cert.id}` : cert.id}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#172B15] tracking-tight group-hover:text-[#639E1F] transition-colors line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Issuer: {cert.issuer}
                  </p>
                </div>
              </motion.div>
            ))}
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
          <div className="hidden lg:block relative py-20">
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

      {/* Executive Leadership & Key Management Team Section */}
      <section className="py-20 lg:py-32 bg-[#F2F8ED]/40 border-t border-b border-[#2D5A1E]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-[#2D5A1E]/20 shadow-sm">
              <Award className="w-3.5 h-3.5 text-[#639E1F]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F]">
                Executive Board &amp; Leadership
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#172B15]">
              Guiding Our <span className="font-serif italic text-[#639E1F]">Global Vision</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Meet the visionary leaders driving innovation, manufacturing excellence, and global community partnerships across EnergyMax Group.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {leadershipTeam.map((leader, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-[#639E1F]/50 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#8CC63F]/40 shrink-0 shadow-md bg-neutral-900">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
                      {leader.role}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-light text-[#172B15] tracking-tight">{leader.name}</h3>
                  </div>
                </div>

                <div className="relative pt-4 border-t border-neutral-100">
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed italic">
                    &ldquo;{leader.bio}&rdquo;
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Full-Screen PDF Lightbox Modal Preview */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
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
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-[#172B15] text-white hover:bg-[#2D5A1E] transition-colors shadow-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pr-12 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F] block">Official Accreditation Document</span>
                  <h3 className="text-lg sm:text-2xl font-light text-[#172B15]">{selectedCert.title}</h3>
                  <p className="text-xs text-neutral-500">Issued by: {selectedCert.issuer}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={selectedCert.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#8CC63F] text-[#172B15] text-xs font-bold uppercase tracking-wider hover:bg-[#7AB82A] transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>

              {/* Embedded PDF Viewer */}
              <div className="relative w-full h-[70vh] bg-[#FAFAF7] rounded-2xl border border-[#2D5A1E]/10 overflow-hidden flex items-center justify-center">
                <iframe
                  src={`${selectedCert.document}#view=FitH`}
                  title={selectedCert.title}
                  className="w-full h-full border-0"
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