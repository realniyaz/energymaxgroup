"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "1. Overview & Joint Controllers" },
    { id: "collection", label: "2. How We Collect Personal Data" },
    { id: "types", label: "3. Types of Personal Data Processed" },
    { id: "usage", label: "4. How We Use Your Personal Data" },
    { id: "sharing", label: "5. How We Share Personal Data" },
    { id: "transfers", label: "6. International Data Transfers" },
    { id: "security", label: "7. Data Protection & Security" },
    { id: "rights", label: "8. Your Data Protection Rights" },
    { id: "contact", label: "9. Contact & Grievance Officer" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />
      
      {/* Header Banner */}
      <section className="relative py-16 sm:py-20 lg:py-28 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Data Privacy & Security
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Privacy Policy & <span className="font-serif italic text-[#8CC63F]">Cookie Notice</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Effective Date: April 1st, 2023 &bull; Governing personal data collection, processing, and protection standards for EnergyMax Group International.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Navigation Menu */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block mb-3 px-2">
                Privacy Index
              </span>
              
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-1 pb-2 lg:pb-0 no-scrollbar">
                {sections.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`whitespace-nowrap lg:whitespace-normal w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-between shrink-0 ${
                      activeSection === item.id
                        ? "bg-[#2D5A1E] text-white shadow-md"
                        : "text-neutral-700 hover:bg-[#F2F8ED] hover:text-[#2D5A1E]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 hidden lg:block" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-12 rounded-3xl border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-12">
            
            {/* Section 1 */}
            <div id="overview" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                1. Overview & Joint Controllers
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                This Privacy Notice describes how EnergyMax International Inc. (7575 Fulton Street East, Ada, Michigan 49355, United States) and EnergyMax India Enterprises Private Limited (B 28 Manaar Tower, Noida - 132, Uttar Pradesh - 201304, India) (together, “EnergyMax” or “we” or “us”) use personal data collected or received from visitors, Independent Business Owners (IBOs), and customers (“Visitors” or “you”) of this website. We act as joint controllers in relation to your personal data.
              </p>
            </div>

            {/* Section 2 */}
            <div id="collection" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                2. How We Collect Personal Data
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                EnergyMax collects and receives personal data through various channels, including registration forms, logged-in portal activity, direct communications via our Contact Us webpage, and the use of cookies or similar web tracking technologies that record browser type, IP address, and site navigation metrics.
              </p>
            </div>

            {/* Section 3 */}
            <div id="types" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                3. Types of Personal Data Processed
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                We process contact details (name, email address, phone number, postal address), login credentials, national identifiers where required by law, payment and financial transaction information, demographic data, product preferences, and purchasing habits.
              </p>
            </div>

            {/* Section 4 */}
            <div id="usage" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                4. How We Use Your Personal Data
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                We process your personal data to perform contracts, manage accounts, fulfill product orders, comply with legal obligations (such as tax and financial record retention), and pursue legitimate business interests including fraud prevention, website analytics, and customer support enhancements.
              </p>
            </div>

            {/* Section 5 */}
            <div id="sharing" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                5. How We Share Personal Data
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                EnergyMax does not sell, rent, or trade your personal data. We share personal data among our joint controllers, related global corporate entities, logistics and financial transaction service providers, upline/downline business partners to support direct selling structures, and government authorities when required by law.
              </p>
            </div>

            {/* Section 6 */}
            <div id="transfers" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                6. International Data Transfers
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                We transfer collected data to entities within the EnergyMax organization and third-party service providers located globally. Where data is transferred across borders, we implement robust contractual safeguards to ensure your personal information remains fully protected under applicable laws.
              </p>
            </div>

            {/* Section 7 */}
            <div id="security" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                7. Data Protection & Security
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                We maintain appropriate technical, physical, and organizational security safeguards designed to protect your personal data against accidental, unlawful, or unauthorized destruction, loss, alteration, access, disclosure, or use.
              </p>
            </div>

            {/* Section 8 */}
            <div id="rights" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                8. Your Data Protection Rights
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Subject to relevant legal provisions, you have the right to access, rectify, or erase your personal data, restrict or object to processing, request data portability, and withdraw consent at any time without affecting prior lawful processing.
              </p>
            </div>

            {/* Section 9 */}
            <div id="contact" className="space-y-4 pt-4 scroll-mt-28 bg-[#F2F8ED] p-6 rounded-2xl border border-[#8CC63F]/30">
              <h2 className="text-base sm:text-xl font-bold text-[#172B15] tracking-tight">
                9. Contact & Grievance Office
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 font-normal leading-relaxed">
                If you have inquiries regarding this Privacy Notice, wish to exercise your rights, or want to update your personal data, you may contact our Privacy Office and designated Grievance Officer:
              </p>
              <div className="text-xs sm:text-sm text-[#172B15] font-medium space-y-1 pt-2">
                <p><strong className="text-[#2D5A1E]">Registered Address:</strong> B 28 Manaar Tower, Noida - 132, Uttar Pradesh - 201304</p>
                <p><strong className="text-[#2D5A1E]">Privacy Email:</strong> PrivacyOffice@energymaxgroup.com</p>
                <p><strong className="text-[#2D5A1E]">Customer Care:</strong> care@energymaxgroup.com</p>
                <p><strong className="text-[#2D5A1E]">Helpline:</strong> +91 120 466 4253</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}