// app/affiliate/login/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAffiliateAuth } from "@/context/affiliate-auth-context";
import TurnstileWidget from "@/app/components/affiliate/TurnstileWidget";
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function AffiliateLoginPage() {
  const { login } = useAffiliateAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError("Please complete the Cloudflare security verification.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password, captchaToken);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-6 text-[#172B15]">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center space-x-2">
            <Image src="/logo1.png" alt="EnergyMax" width={28} height={28} />
            <span className="text-xs font-bold uppercase tracking-wider text-[#172B15]">
              ENERGYMAX AFFILIATES
            </span>
          </div>
          <Link
            href="/shop"
            className="text-[10px] uppercase font-bold text-neutral-400 hover:text-[#2D5A1E] flex items-center space-x-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Store</span>
          </Link>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Partner Portal
          </span>
          <h1 className="text-2xl font-light text-[#172B15] tracking-tight">
            Affiliate <span className="font-serif italic text-[#2D5A1E]">Sign In</span>
          </h1>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Affiliate Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />
            </div>
          </div>

          <TurnstileWidget onSuccess={(t) => setCaptchaToken(t)} />

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full py-3.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
          <span className="text-neutral-500">Want to join?</span>
          <Link
            href="/affiliates/apply"
            className="font-bold text-[#2D5A1E] hover:text-[#639E1F]"
          >
            Apply for Partnership →
          </Link>
        </div>
      </div>
    </div>
  );
}