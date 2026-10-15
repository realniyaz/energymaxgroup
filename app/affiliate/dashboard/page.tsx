// app/affiliate/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAffiliateAuth } from "@/context/affiliate-auth-context";
import {
  Copy,
  Check,
  Share2,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function AffiliateDashboard() {
  const { affiliate, logout } = useAffiliateAuth();
  const [copied, setCopied] = useState(false);

  if (!affiliate) {
    return null;
  }

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/shop?ref=${affiliate.public_code}`
      : `https://energymax.com/shop?ref=${affiliate.public_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#2D5A1E]/15 px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image src="/logo1.png" alt="EnergyMax Logo" width={32} height={32} />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#172B15] block">
              ENERGYMAX PARTNER HUB
            </span>
            <span className="text-[10px] text-neutral-400">
              Welcome, {affiliate.full_name}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-xs font-semibold text-neutral-500 hover:text-red-600 flex items-center space-x-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full p-6 sm:p-12 space-y-8 flex-1">
        {/* Referral Code Showcase Card */}
        <div className="bg-[#172B15] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#8CC63F]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#8CC63F]/20 text-[#8CC63F] text-[9px] font-bold uppercase tracking-widest mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Active Partner Code</span>
              </div>
              <h2 className="text-3xl font-mono font-bold tracking-wider text-white">
                {affiliate.public_code}
              </h2>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={copyToClipboard}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-[#8CC63F] text-[#172B15] font-bold text-xs uppercase tracking-wider hover:bg-[#7db435] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-300">
            <span className="font-mono break-all">{referralLink}</span>
            <span className="text-[10px] text-[#8CC63F] uppercase tracking-wider font-semibold">
              Status: {affiliate.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Profile Details & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A1E]">
              Account Profile
            </h3>
            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-400">Full Name</span>
                <span className="font-medium text-[#172B15]">{affiliate.full_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-400">Email</span>
                <span className="font-medium text-[#172B15]">{affiliate.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-400">Phone</span>
                <span className="font-medium text-[#172B15]">{affiliate.phone || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Approved Date</span>
                <span className="font-medium text-[#172B15]">
                  {new Date(affiliate.approved_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#2D5A1E]/15 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A1E]">
                Referral Assets
              </h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Embed your unique code into your promotional channels, Instagram stories, blogs, and patient consultations. Visitors using your link are tracked automatically.
              </p>
            </div>

            <Link
              href="/shop"
              target="_blank"
              className="inline-flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] font-semibold hover:border-[#639E1F] transition-all"
            >
              <span>Preview Storefront with your Ref</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-[10px] text-neutral-400 uppercase tracking-widest border-t border-[#2D5A1E]/10">
        EnergyMax Cellular Health Partner Ecosystem
      </footer>
    </div>
  );
}