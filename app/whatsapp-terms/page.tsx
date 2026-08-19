"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, ShieldCheck, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function WhatsAppTermsPage() {
  const [activeSection, setActiveSection] = useState("consent");

  const sections = [
    { id: "consent", label: "1. Communication Consent & T&C" },
    { id: "business-account", label: "2. Official Business Account Standards" },
    { id: "predefined-chat", label: "3. Predefined & Automated Chat Flows" },
    { id: "security", label: "4. Data Privacy & Security" },
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
            <MessageSquare className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Messaging & Digital Engagement
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            WhatsApp Business <span className="font-serif italic text-[#8CC63F]">Terms & Conditions</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Guidelines governing official WhatsApp Business account communications, automated predefined chat flows, and opt-in user consent policies at EnergyMax Group.
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
                WhatsApp Policy Index
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
            
            {/* Section 1: Consent */}
            <div id="consent" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                1. Communication Consent & WhatsApp T&C
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                By registering on our platform, placing orders, or engaging with EnergyMax Group, you expressly consent to receive communications through WhatsApp Business channels. Such communications include personalized updates, order tracking, product recommendations, customer support, and direct selling business information.
              </p>
              <div className="p-4 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/30 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#639E1F] shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-700 font-medium">
                  Opt-Out Flexibility: You retain the absolute right to opt out of WhatsApp communications at any time by replying "STOP" or notifying our support team.
                </p>
              </div>
            </div>

            {/* Section 2: Business Account */}
            <div id="business-account" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                2. Official Business Account Standards
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                EnergyMax operates strictly through verified official WhatsApp Business accounts bearing our official corporate insignia. All outgoing messages adhere to WhatsApp Commerce Policy and Meta Business Messaging standards.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-600">
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>Verified Identity: Look for the official green checkmark badge confirming our verified corporate status.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#639E1F] font-bold">&bull;</span>
                  <span>No Financial Solicitations: Our official WhatsApp representatives will never ask for PINs, passwords, or direct peer-to-peer wallet transfers.</span>
                </li>
              </ul>
            </div>

            {/* Section 3: Predefined Chat */}
            <div id="predefined-chat" className="space-y-4 pt-4 scroll-mt-28">
              <h2 className="text-lg sm:text-2xl font-light text-[#172B15] tracking-tight border-b border-neutral-100 pb-3">
                3. Predefined & Automated Chat Flows
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                To streamline customer support and distributor onboarding, EnergyMax utilizes automated interactive workflows and predefined chat templates.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">Automation</span>
                  <h4 className="text-sm font-semibold text-[#172B15]">Predefined Menu Prompts</h4>
                  <p className="text-xs text-neutral-600">Quick-reply buttons allow you to instantly access order status, catalog pricing, and return policies.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2D5A1E]">Human Handover</span>
                  <h4 className="text-sm font-semibold text-[#172B15]">Live Agent Escalation</h4>
                  <p className="text-xs text-neutral-600">Complex inquiries are automatically transferred from automated bots to verified human Account Managers.</p>
                </div>
              </div>
            </div>

            {/* Section 4: Security */}
            <div id="security" className="space-y-4 pt-4 scroll-mt-28 bg-[#F2F8ED] p-6 rounded-2xl border border-[#8CC63F]/30">
              <h2 className="text-base sm:text-xl font-bold text-[#172B15] tracking-tight">
                4. Data Privacy & Security
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 font-normal leading-relaxed">
                Chat logs, telephone numbers, and interaction histories handled via WhatsApp are encrypted end-to-end by Meta and stored in accordance with our strict corporate Privacy Policy.
              </p>
              <div className="text-xs sm:text-sm text-[#172B15] font-medium space-y-1 pt-2">
                <p><strong className="text-[#2D5A1E]">Support Email:</strong> care@energymaxgroup.com</p>
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