"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight, Check, X } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function RulesOfConductPage() {
  const [activeSection, setActiveSection] = useState("zero-tolerance");

  const sections = [
    { id: "zero-tolerance", label: "1. Zero Tolerance Policy" },
    { id: "qas", label: "2. Quality Assurance Standards (QAS)" },
    { id: "product-claims", label: "3. Product Demonstrations & Claims" },
    { id: "business-opportunity", label: "4. Business Opportunity & Income" },
    { id: "messaging", label: "5. Messaging Fundamentals" },
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
              Compliance & Governance
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Rules of Conduct & <span className="font-serif italic text-[#8CC63F]">Standards</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Essential guidelines, Quality Assurance Standards (QAS), and Zero Tolerance policies governing Direct Sellers and Retailers at EnergyMax Group.
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
                Conduct Index
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
            
            {/* Section 1: Zero Tolerance */}
            <div id="zero-tolerance" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                1. Zero Tolerance Policy
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                The Zero Tolerance policy covers issues that can lead to potential reputational concerns for EnergyMax Group thereby affecting the business at large. This policy underlines that no violation will be overlooked and no leniency shall be shown in dealing with any Direct Seller or Retailer found in breach.
              </p>
              
              <div className="bg-[#F2F8ED] p-6 rounded-2xl border border-[#8CC63F]/30 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E]">
                  Identified Zero Tolerance Areas:
                </h3>
                <ul className="space-y-2 text-xs text-neutral-700 font-medium">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#639E1F] font-bold">&bull;</span>
                    <span>Selling and/or making available products through retail shops, unauthorized channels, and online stores.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#639E1F] font-bold">&bull;</span>
                    <span>Unauthorized Direct Retailer/Seller activity in unopened markets.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#639E1F] font-bold">&bull;</span>
                    <span>Violations of Business Support Material (BSM) Policies.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#639E1F] font-bold">&bull;</span>
                    <span>Violations of Quality Assurance Standards (QAS).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#639E1F] font-bold">&bull;</span>
                    <span>Violations of Direct Selling Guidelines and Digital Communication Standards (DCS).</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 2: QAS */}
            <div id="qas" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                2. Importance of Quality Assurance Standards (QAS)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Quality Assurance Standards (QAS) provide the framework for a level playing field and best practices to achieve long-term sustainable and profitable business growth.
              </p>
            </div>

            {/* Section 3: Product Claims & Dos / Don'ts */}
            <div id="product-claims" className="space-y-6 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                3. Describing Products & Demonstrations (QAS)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Demonstrations involve the actual use of a product to exhibit its function or results. All representations must strictly align with official corporate governance.
              </p>

              {/* DOs and DON'Ts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* DOs Card */}
                <div className="p-6 rounded-2xl bg-[#F2F8ED]/60 border border-[#8CC63F]/40 space-y-4">
                  <div className="flex items-center space-x-2 text-[#2D5A1E]">
                    <div className="w-5 h-5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest">Do's for Product Conduct</h3>
                  </div>
                  <ul className="space-y-2.5 text-xs text-neutral-700 font-medium">
                    <li className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Use product claims verbatim from official company sources only.</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Utilize official approved product demonstrations only.</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Explain benefits and features based on personal experience and official brochures.</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Purchase products exclusively through official Direct Sellers, official websites, or stores.</span>
                    </li>
                  </ul>
                </div>

                {/* DON'Ts Card */}
                <div className="p-6 rounded-2xl bg-red-50/50 border border-red-200 space-y-4">
                  <div className="flex items-center space-x-2 text-red-800">
                    <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest">Don'ts for Product Conduct</h3>
                  </div>
                  <ul className="space-y-2.5 text-xs text-neutral-700 font-medium">
                    <li className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Do not alter, modify, or embellish official product claims.</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Do not conduct price or product comparisons due to high risk and lack of substantiation.</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Do not source inventory from unauthorized online stores or retail shops.</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Do not spread false, unverified, or misleading information.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Section 4: Business Opportunity & Income */}
            <div id="business-opportunity" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                4. Business Opportunity & Income Positioning
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                When presenting the business opportunity, clearly define it as an equal opportunity venture. Income representations must reflect actual earnings through the Sales and Marketing Plan, emphasizing personal effort and retail product movement rather than guaranteed financial returns.
              </p>
            </div>

            {/* Section 5: Messaging Fundamentals */}
            <div id="messaging" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                5. Messaging Fundamentals & Risks of Misinformation
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                All communications must remain truthful, accurate, and completely free from misleading statements.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">Core Standard</span>
                  <h4 className="text-sm font-semibold text-[#172B15]">Truthful & Accurate</h4>
                  <p className="text-xs text-neutral-600">Ensure every claim made about products or business potential is verifiable and fully compliant.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Consequences</span>
                  <h4 className="text-sm font-semibold text-[#172B15]">Risks of False Claims</h4>
                  <p className="text-xs text-neutral-600">Misleading info leads to unsatisfactory results, team distrust, customer dissatisfaction, and potential business termination.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}