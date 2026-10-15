"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { submitAffiliateApplication } from "@/lib/services/affiliateService";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function AffiliateApplyPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    promotion_channels: "",
    audience_description: "",
    website_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await submitAffiliateApplication({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        promotion_channels: formData.promotion_channels.trim(),
        audience_description: formData.audience_description.trim() || null,
        website_url: formData.website_url.trim() || null,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to submit application. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between pb-6 border-b border-[#2D5A1E]/15 mb-8">
          <Link href="/shop" className="flex items-center space-x-2">
            <Image src="/logo1.png" alt="EnergyMax" width={32} height={32} />
            <span className="text-xs font-bold uppercase tracking-widest text-[#172B15]">
              EnergyMax Partnership
            </span>
          </Link>
          <Link
            href="/affiliate/login"
            className="text-xs font-bold uppercase text-[#2D5A1E] hover:text-[#639E1F]"
          >
            Existing Partner? Sign In
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 bg-[#8CC63F]/20 text-[#2D5A1E] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-light">Application Received</h2>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
              Thank you for applying to the EnergyMax Affiliate Program. Our
              advisory team will review your application. Upon approval, you will
              receive an activation email to establish your partner credentials.
            </p>
            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center space-x-1.5 px-6 py-3 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </Link>
            </div>
          </div>
        ) : 
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-6">
            <div>
              <div className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 text-[#2D5A1E] text-[9px] font-bold uppercase tracking-widest mb-2">
                <Sparkles className="w-3 h-3 text-[#639E1F]" />
                <span>Affiliate Application</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight">
                Partner with <span className="font-serif italic text-[#2D5A1E]">EnergyMax</span>
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Share high-potency cellular wellness formulas and earn industry-leading commissions.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Jane Doe"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jane@example.com"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 555-0199"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Website or Primary Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) =>
                      setFormData({ ...formData, website_url: e.target.value })
                    }
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Promotion Channels * (Where will you promote?)
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.promotion_channels}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      promotion_channels: e.target.value,
                    })
                  }
                  placeholder="Instagram, YouTube channel, clinical practice, health newsletter, etc."
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl p-4 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Audience Description
                </label>
                <textarea
                  rows={2}
                  value={formData.audience_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      audience_description: e.target.value,
                    })
                  }
                  placeholder="Biohacking enthusiasts, longevity practitioners, athletes, etc."
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl p-4 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <span>Submit Partnership Application</span>
                )}
              </button>
            </form>
          
        </div>
      }
      </div>
    </div>
  );
}