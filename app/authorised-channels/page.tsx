"client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Globe, ShoppingBag, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import LuxuryFooter from "../components/LuxuryFooter";
import LuxuryNavbar from "../components/Navbar";

export default function AuthorizedChannelsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />
      
      {/* Header Banner */}
      <section className="relative py-16 sm:py-20 lg:py-28 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <Globe className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Authenticity & Distribution
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
            Authorized Sales <span className="font-serif italic text-[#8CC63F]">Channels</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Buy original EnergyMax and maXilin products ONLY from authorized Independent Business Owners (IBOs) or our official website.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-24 space-y-16">
        
        {/* Core Statement Box */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#2D5A1E]/15 shadow-xl shadow-[#2D5A1E]/5 space-y-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F] block">
              Official Distribution Policy
            </span>
            <h2 className="text-xl sm:text-3xl font-light text-[#172B15] leading-snug">
              Protecting product authenticity, quality, and your 30-day satisfaction guarantee.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
              EnergyMax Group sells its widely acclaimed and recognized products exclusively through authorized Independent Business Owners (IBOs) or its official website <strong className="text-[#172B15]">www.energymaxgroup.com</strong>. EnergyMax does not authorize the sale of its products through supermarkets, brokers, dealers, or third-party online platforms like Amazon, Flipkart, Indiamart, Meesho, Healthkart, etc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Authorized Channels */}
            <div className="p-6 rounded-2xl bg-[#F2F8ED] border border-[#8CC63F]/30 space-y-3">
              <div className="flex items-center space-x-2 text-[#2D5A1E]">
                <CheckCircle2 className="w-5 h-5 text-[#639E1F]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Authorized Channels</h3>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Purchase directly from authorized EnergyMax IBOs or our official online portal to receive 100% genuine formulations, last-mile doorstep delivery across 17,000+ pin codes, and our full 30-day money-back guarantee.
              </p>
            </div>

            {/* Unauthorized Channels Warning */}
            <div className="p-6 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Unauthorized Platforms</h3>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                EnergyMax does not stand behind the authenticity, safety, or quality of products sold on third-party market platforms. Purchasing outside authorized channels poses health risks and invalidates any money-back guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F] block">
              Frequently Asked Questions
            </span>
            <h3 className="text-2xl sm:text-3xl font-light text-[#172B15]">
              Everything About <span className="font-serif italic text-[#639E1F]">Secure Purchasing</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">Q1</span>
              <h4 className="text-base font-semibold text-[#172B15]">Where can I buy EnergyMax products?</h4>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Authentic EnergyMax products can only be purchased from an authorized EnergyMax Independent Business Owner (IBO) or directly from our official website www.energymaxgroup.com.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">Q2</span>
              <h4 className="text-base font-semibold text-[#172B15]">Are products available on other e-commerce channels?</h4>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                No. We do not authorize sales through Amazon, Flipkart, Indiamart, Meesho, Healthkart, etc. We cannot guarantee the authenticity or quality of items sold on these platforms and offer no money-back guarantee for them.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">Q3</span>
              <h4 className="text-base font-semibold text-[#172B15]">How convenient is it to purchase from EnergyMax?</h4>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Very convenient! You can order directly on our website with doorstep delivery across 17,000+ pin codes, or get in touch with a verified IBO in your region to ensure timely delivery of fresh stock.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">Q4</span>
              <h4 className="text-base font-semibold text-[#172B15]">How does the 30-day money-back guarantee work?</h4>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                If you buy from authorized channels and are not completely satisfied, you may return the products within 30 days of purchase for a refund in accordance with our Returns Policy. Unauthorized purchases have zero guarantee.
              </p>
            </div>

          </div>
        </div>

        {/* Action Callout */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#172B15] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Verified Purchase
            </span>
            <h3 className="text-xl sm:text-2xl font-light">
              Ready to experience clinical-grade wellness?
            </h3>
            <p className="text-xs text-neutral-300">
              Browse our signature collection or connect with an authorized IBO today.
            </p>
          </div>

          <a
            href="#products"
            className="px-8 py-4 rounded-xl bg-[#8CC63F] text-[#172B15] text-xs font-bold uppercase tracking-wider hover:bg-[#7AB82A] transition-all shadow-md flex items-center space-x-2 shrink-0 group"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </section>

      <LuxuryFooter />
    </div>
  );
}