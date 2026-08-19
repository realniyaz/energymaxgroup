"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState("general");

  const sections = [
    { id: "general", label: "1. Website Terms & Scope" },
    { id: "accounts", label: "2. Password Security & Accounts" },
    { id: "privacy", label: "3. Privacy & Data Handling" },
    { id: "ip", label: "4. Intellectual Property Rights" },
    { id: "d2c", label: "5. D2C Sales & Refund Policy" },
    { id: "mlm", label: "6. Direct Selling & Code of Conduct" },
    { id: "liability", label: "7. Limitation of Liability" },
    { id: "grievance", label: "8. Grievance Redressal Officer" },
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
              Legal & Compliance Framework
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Terms of Use & <span className="font-serif italic text-[#8CC63F]">D2C Agreement</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Effective Date: June 2026 &bull; Governing Direct Selling Guidelines & Direct-to-Consumer Standards for EnergyMax Group International.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Navigation Menu (Desktop Sticky / Mobile Horizontal Scroll) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block mb-3 px-2">
                Document Index
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
            <div id="general" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                1. Website Terms & Scope
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Access to and use of the www.energymaxgroup.com website (hereinafter the EnergyMax Website) and the information, materials, products, and services available through it are subject to these Website Terms of Use. For Independent Business Owners (IBOs), the Distributorship Contract applies; for Preferred and Retail Customers, the D2C Terms apply.
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                The EnergyMax Website is intended solely for use from and in the Republic of India and is based on Indian laws. EnergyMax disclaims any liability for access originating from outside India.
              </p>
            </div>

            {/* Section 2 */}
            <div id="accounts" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                2. Password Security & Accounts
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Password-protected portals are intended exclusively for authorized IBOs and Registered Customers in India. Passwords must remain confidential and protected from third-party access. EnergyMax assumes no liability for damages resulting from improper password handling or unauthorized use.
              </p>
            </div>

            {/* Section 3 */}
            <div id="privacy" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                3. Privacy & Data Handling
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                All personal information provided during website navigation or registration is handled in strict accordance with our Website Privacy Notice and applicable data protection regulations in India. Users agree to provide true, complete, and current details at all times.
              </p>
            </div>

            {/* Section 4 */}
            <div id="ip" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                4. Intellectual Property Rights
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                All content, trademarks, logos, graphics, and proprietary formulations (including maXilin and EnergyMax brands) are protected by intellectual property laws. Unauthorized reproduction, distribution, or public display is strictly prohibited. IBOs are granted a limited, revocable license to utilize marketing materials strictly for operating their authorized business.
              </p>
            </div>

            {/* Section 5 */}
            <div id="d2c" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                5. D2C Sales & Refund Policy
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Direct-to-Consumer (D2C) purchases made on our platform are backed by the EnergyMax 30-Day Satisfaction Guarantee. Eligible unopened or defective goods may be returned in accordance with our standard Logistics and Refund Procedures. Refunds are processed securely back to the original source payment method within 5–7 business days.
              </p>
            </div>

            {/* Section 6 */}
            <div id="mlm" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                6. Direct Selling & Code of Conduct
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                As a compliant Direct Selling entity in India, EnergyMax Group adheres to all Consumer Protection (Direct Selling) Rules. Independent Business Owners (IBOs) must operate with total transparency, refrain from exaggerated income claims, and respect consumer grievance mechanisms.
              </p>
            </div>

            {/* Section 7 */}
            <div id="liability" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                7. Limitation of Liability & Jurisdiction
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                EnergyMax shall not be liable for any indirect, incidental, or consequential damages arising from website usage or product application. All disputes are subject exclusively to the jurisdiction of the courts in New Delhi / Noida, Uttar Pradesh, governed by the laws of India.
              </p>
            </div>

            {/* Section 8 */}
            <div id="grievance" className="space-y-4 pt-4 scroll-mt-28 bg-[#F2F8ED] p-6 rounded-2xl border border-[#8CC63F]/30">
              <h2 className="text-base sm:text-xl font-bold text-[#172B15] tracking-tight">
                8. Grievance Redressal Office
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 font-normal leading-relaxed">
                In compliance with Consumer Protection regulations, queries, complaints, or legal notices should be directed to our designated Compliance & Grievance Officer:
              </p>
              <div className="text-xs sm:text-sm text-[#172B15] font-medium space-y-1 pt-2">
                <p><strong className="text-[#2D5A1E]">Registered Address:</strong> B 28 Manaar Tower, Noida - 132, Uttar Pradesh - 201304</p>
                <p><strong className="text-[#2D5A1E]">Email Support:</strong> care@energymaxgroup.com</p>
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