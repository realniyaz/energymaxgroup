"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminAuth } from "@/context/admin-auth-context";
import { Sparkles, Lock, User, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(", "));
      } else {
        setError("Invalid administrative credentials or network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col lg:flex-row">
      
      {/* LEFT SIDE: Brand Story */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-[#172B15] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-[#2D5A1E]/30">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8CC63F]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2D5A1E]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 bg-white rounded-2xl p-1.5 flex items-center justify-center shadow-md">
              <Image
                src="/logo1.png"
                alt="EnergyMax Group Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8CC63F] block">
                ENERGYMAX GROUP
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">
                Administrative Gateway
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#8CC63F] transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-10 space-y-8 max-w-xl">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
                Clinical Precision
              </span>
            </div>
            
            <h2 className="text-3xl xl:text-4xl font-light tracking-tight text-white leading-tight">
              Curating Global <br />
              <span className="font-serif italic text-[#8CC63F]">Microbiome Science.</span>
            </h2>

            <p className="text-xs xl:text-sm text-neutral-300 font-normal leading-relaxed">
              Manage taxonomies, regulate high-potency formulations, review SKU inventories, and monitor secure global transactions in real time.
            </p>
          </div>

          <div className="relative w-full h-56 xl:h-64 rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-neutral-900/60 group">
            <Image
              src="/newbanner1.png"
              alt="maXilin Probiotics Collection"
              fill
              sizes="(max-width: 1200px) 50vw, 40vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
              <div>
                <p className="text-xs font-semibold text-white tracking-wide">maXilin Superprobiotics</p>
                <p className="text-[10px] text-neutral-400 font-mono">1 Trillion CFU Matrix</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#8CC63F] text-[9px] font-bold uppercase tracking-wider">
                Flagship Line
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-2 text-neutral-400 pt-4 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-[#8CC63F]" />
          <span className="text-[10px] uppercase tracking-wider font-medium">
            FastAPI Session Security & JWT Verification Active
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#FAFAF7]">
        <div className="max-w-md w-full bg-[#172B15] text-white p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/30 shadow-2xl space-y-8 relative overflow-hidden">
          
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#8CC63F]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between lg:hidden pb-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                <Image src="/logo1.png" alt="EnergyMax Logo" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-bold text-[#8CC63F] tracking-widest uppercase">EnergyMax</span>
            </div>
            <Link href="/" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white">
              Storefront
            </Link>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8CC63F] block">
              Restricted Area
            </span>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Admin <span className="font-serif italic text-[#8CC63F]">Sign In</span>
            </h1>
            <p className="text-xs text-neutral-400 font-normal">
              Enter your authorized credentials to access administrative systems.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Username / Identifier
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#8CC63F] transition-all"
                  placeholder="e.g. rohit.sharma or admin"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Security Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#8CC63F] transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#8CC63F] text-[#172B15] font-bold uppercase tracking-widest text-xs hover:bg-[#7db435] transition-all disabled:opacity-50 shadow-lg shadow-[#8CC63F]/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#172B15]" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In Securely</span>
              )}
            </button>
          </form>

          <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-400 border-t border-white/10">
            <span>TLS Encrypted</span>
            <span>EnergyMax Admin OS</span>
          </div>

        </div>
      </div>

    </div>
  );
}