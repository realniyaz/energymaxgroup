"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Clock
} from "lucide-react";

interface ComingSoonProps {
  title?: string;
  category?: string;
  description?: string;
  estimatedLaunch?: string;
}

export default function ComingSoonView({
  title,
  category = "Curated Collection",
  description = "Our clinical formulation teams and batch laboratories are currently preparing this line for release.",
  estimatedLaunch = "Coming Q2 2026",
}: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Connect to your email newsletter/leads endpoint if desired
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-between text-[#172B15] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8CC63F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2D5A1E]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full px-6 py-6 lg:px-12 flex items-center justify-between border-b border-[#2D5A1E]/10 backdrop-blur-sm bg-white/40">
        <Link href="/shop" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-[#172B15] rounded-2xl p-2 flex items-center justify-center shadow-sm">
            <Image
              src="/logo1.png"
              alt="EnergyMax Logo"
              width={26}
              height={26}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#172B15] block">
              ENERGYMAX
            </span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-medium">
              GROUP INDIA
            </span>
          </div>
        </Link>

        <Link
          href="/shop"
          className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/10 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </header>

      {/* Main Content Showcase */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center flex flex-col items-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/35 backdrop-blur-md mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#2D5A1E]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#2D5A1E]">
            {category}
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#172B15] leading-[1.15] mb-6">
          {title ? (
            title
          ) : (
            <>
              Formulation in <br />
              <span className="font-serif italic text-[#2D5A1E]">Preparation.</span>
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base text-neutral-600 font-normal leading-relaxed max-w-xl mb-8">
          {description}
        </p>

        {/* Launch Status Badge */}
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#2D5A1E] bg-[#F2F8ED] border border-[#639E1F]/25 px-4 py-2 rounded-2xl mb-10">
          <Clock className="w-4 h-4 text-[#639E1F]" />
          <span>Batch Release Status: {estimatedLaunch}</span>
        </div>

        {/* VIP Notification Box */}
        <div className="w-full max-w-md bg-white border border-[#2D5A1E]/15 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {submitted ? (
            <div className="py-4 space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 text-[#2D5A1E]" />
              </div>
              <h3 className="text-sm font-bold text-[#172B15]">You are on the reservation list</h3>
              <p className="text-xs text-neutral-500">
                We will dispatch an invitation when early access allocations open for this line.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="space-y-3">
              <div className="text-left space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Priority Access & Batch Alerts
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-10 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#172B15] hover:bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-[#172B15]/10"
              >
                <span>Notify Me on Launch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Secondary Navigation Pill */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center text-xs">
          <Link
            href="/shop"
            className="px-3.5 py-1.5 rounded-full bg-white border border-[#2D5A1E]/10 text-neutral-600 hover:text-[#172B15] hover:border-[#2D5A1E]/30 transition-all font-medium"
          >
            Explore Active Catalog
          </Link>
          <Link
            href="/shop/auth/login"
            className="px-3.5 py-1.5 rounded-full bg-white border border-[#2D5A1E]/10 text-neutral-600 hover:text-[#172B15] hover:border-[#2D5A1E]/30 transition-all font-medium"
          >
            Client Sign In
          </Link>
        </div>
      </main>

      {/* Footer Details */}
      <footer className="relative z-10 w-full px-6 py-6 border-t border-[#2D5A1E]/10 text-center flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 max-w-6xl mx-auto">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <ShieldCheck className="w-4 h-4 text-[#639E1F]" />
          <span>Cold-chain certified clinical microbiology standards enforce batch purity.</span>
        </div>
        <p>© {new Date().getFullYear()} EnergyMax Group. All formulations protected.</p>
      </footer>
    </div>
  );
}