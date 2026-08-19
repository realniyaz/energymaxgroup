"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, CheckCircle2, XCircle, PhoneCall, Mail, Globe, MapPin, ChevronRight } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function AdvisoryPage() {
  const [activeSection, setActiveSection] = useState("guidance");

  const sections = [
    { id: "guidance", label: "1. Guidance & Security Advisory" },
    { id: "dos", label: "2. Security Do's" },
    { id: "donts", label: "3. Security Don'ts" },
    { id: "contact", label: "4. Authorized Support Channels" },
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
            <ShieldAlert className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Security & Fraud Prevention
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Direct Seller & Customer <span className="font-serif italic text-[#8CC63F]">Advisory</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Essential guidance, security Do's and Don'ts, and official communication channels to protect yourself from fake calls, phishing, and fraudulent messages.
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
                Advisory Index
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
            
            {/* Section 1: Guidance */}
            <div id="guidance" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                1. Guidance for All: Stay Protected
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                To protect yourself from fake emails, phishing links, and fraudulent text messages, we strongly suggest you consider the guidance below before acting in case of any suspicious calls or messages received.
              </p>
            </div>

            {/* Section 2: DO's */}
            <div id="dos" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                2. Security Do's
              </h2>

              <div className="p-6 rounded-2xl bg-[#F2F8ED]/60 border border-[#8CC63F]/40 space-y-4">
                <div className="flex items-center space-x-2 text-[#2D5A1E]">
                  <CheckCircle2 className="w-5 h-5 text-[#639E1F]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Recommended Actions</h3>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-700 font-medium">
                  <li className="flex items-start space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                    <span>Disconnect the call immediately if it originates from an unknown local or international number.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                    <span>"Report & Block" the sender on WhatsApp to avoid receiving further calls or messages from the same number.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                    <span>If you receive messages from unknown numbers impersonating EnergyMax employees, Senior Executives, or Independent Business Owners (IBOs), do not rely on display pictures and names. Verify with your Account Manager or Upline if such communication is genuine.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 3: DON'Ts */}
            <div id="donts" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                3. Security Don'ts
              </h2>

              <div className="p-6 rounded-2xl bg-red-50/50 border border-red-200 space-y-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Strict Prohibitions</h3>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-700 font-medium">
                  <li className="flex items-start space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-2.5 h-2.5" />
                    </div>
                    <span>Under any circumstances, do <strong>NOT</strong> share any OTP, Password, or account credentials.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-2.5 h-2.5" />
                    </div>
                    <span>Do not pay any amount for joining unauthorized programs or unverified schemes.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-2.5 h-2.5" />
                    </div>
                    <span>Do not click on unknown or suspicious links sent via SMS, email, or messaging apps.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-2.5 h-2.5" />
                    </div>
                    <span>Do not pay any amount other than through the official EnergyMax website and / or the official mobile app payment gateway.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-2.5 h-2.5" />
                    </div>
                    <span>Never ever pay anyone directly via an ad-hoc payment link.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-2.5 h-2.5" />
                    </div>
                    <span>Do not download or install any remote access or screen-sharing app requested by callers. Installation may compromise your device and lead to fraud.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 4: Contact Us */}
            <div id="contact" className="space-y-4 pt-4 scroll-mt-28 bg-[#F2F8ED] p-6 sm:p-8 rounded-2xl border border-[#8CC63F]/30">
              <h2 className="text-base sm:text-xl font-bold text-[#172B15] tracking-tight">
                4. Authorized Support Channels
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 font-normal leading-relaxed">
                You can get in touch with EnergyMax Group through our official authorized channels in case you experience anything unusual or when in doubt:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-white border border-[#2D5A1E]/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#2D5A1E]/10 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B15]">Visit Us</h4>
                    <p className="text-xs text-neutral-600 mt-1">Walk into any authorized EnergyMax Store or office at B 28 Manaar Tower, Noida - 132, UP.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-xl bg-white border border-[#2D5A1E]/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#2D5A1E]/10 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B15]">Email Support</h4>
                    <p className="text-xs text-neutral-600 mt-1"><a href="mailto:care@energymaxgroup.com" className="text-[#2D5A1E] underline">care@energymaxgroup.com</a></p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-xl bg-white border border-[#2D5A1E]/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#2D5A1E]/10 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B15]">Official Portal</h4>
                    <p className="text-xs text-neutral-600 mt-1">Log your queries securely on <a href="https://www.energymaxgroup.com" className="text-[#2D5A1E] underline">www.energymaxgroup.com</a></p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-xl bg-white border border-[#2D5A1E]/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#2D5A1E]/10 text-[#2D5A1E] flex items-center justify-center shrink-0 mt-0.5">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B15]">Call Helpline</h4>
                    <p className="text-xs text-neutral-600 mt-1">+91 120 466 4253</p>
                  </div>
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