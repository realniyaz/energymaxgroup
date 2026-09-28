// app/shop/auth/login/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Loader2,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/shop";

  const { loginWithPassword, requestOtp, verifyOtp } = useCustomerAuth();

  const [authMode, setAuthMode] = useState<"password" | "otp">("password");

  // Password state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // OTP state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle standard password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Passes two discrete string arguments matching CustomerAuthContextType
      await loginWithPassword(identifier.trim(), password);
      router.push(redirectUrl);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Invalid customer credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP code via email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // destination, channel, purpose
      await requestOtp(otpEmail.trim(), "email", "login");
      setOtpSent(true);
      setOtpSuccessMsg(`A 6-digit code has been sent to ${otpEmail.trim()}.`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Unable to dispatch OTP code. Please check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // destination, code, channel, purpose
      await verifyOtp(otpEmail.trim(), otpCode.trim(), "email", "login");
      router.push(redirectUrl);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Invalid or expired OTP code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col lg:flex-row text-[#172B15]">
      
      {/* =========================================================
          LEFT SHOWCASE: Brand Philosophy & Botanical Identity
         ========================================================= */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-[#172B15] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-[#2D5A1E]/30">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8CC63F]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2D5A1E]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/shop" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 bg-white/10 rounded-2xl p-2 border border-white/15 backdrop-blur-md flex items-center justify-center shadow-md group-hover:border-[#8CC63F]/50 transition-colors">
              <Image
                src="/logo1.png"
                alt="EnergyMax Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8CC63F] block">
                ENERGYMAX
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">
                Client Sanctuary
              </span>
            </div>
          </Link>

          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#8CC63F] transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Boutique</span>
          </Link>
        </div>

        {/* Center Editorial & Flagship Card */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
                Verified Member Portal
              </span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-light tracking-tight text-white leading-tight">
              Direct Access to <br />
              <span className="font-serif italic text-[#8CC63F]">Cellular Vitality.</span>
            </h2>

            <p className="text-xs xl:text-sm text-neutral-300 font-normal leading-relaxed">
              Track custom formulations, access automated subscription replenishments, and consult verified laboratory batch analyses.
            </p>
          </div>

          <div className="relative w-full h-52 xl:h-60 rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-neutral-900/60">
            <Image
              src="/newbanner1.png"
              alt="EnergyMax Collection"
              fill
              sizes="(max-width: 1200px) 50vw, 40vw"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
              <div>
                <p className="text-xs font-semibold text-white tracking-wide">maXilin Superprobiotics</p>
                <p className="text-[10px] text-neutral-400 font-mono">1 Trillion CFU Potency Matrix</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#8CC63F] text-[9px] font-bold uppercase tracking-wider">
                Direct Client Desk
              </span>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="relative z-10 flex items-center space-x-2 text-neutral-400 pt-4 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-[#8CC63F]" />
          <span className="text-[10px] uppercase tracking-wider font-medium">
            256-Bit TLS Direct Client Encryption Enforced
          </span>
        </div>
      </div>

      {/* =========================================================
          RIGHT AUTHENTICATION PANEL: Password & Email OTP
         ========================================================= */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#FAFAF7]">
        <div className="max-w-md w-full bg-white text-[#172B15] p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-6 relative">
          
          {/* Mobile Back Link & Header */}
          <div className="flex items-center justify-between lg:hidden pb-4 border-b border-neutral-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#172B15] p-1.5 flex items-center justify-center">
                <Image src="/logo1.png" alt="EnergyMax Logo" width={20} height={20} className="object-contain" />
              </div>
              <span className="text-xs font-bold text-[#172B15] tracking-widest uppercase">EnergyMax</span>
            </div>
            <Link href="/shop" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E]">
              Storefront
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Direct Customer Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#172B15]">
              Client <span className="font-serif italic text-[#2D5A1E]">Sign In</span>
            </h1>
            <p className="text-xs text-neutral-500">
              Welcome back. Choose your preferred authentication method.
            </p>
          </div>

          {/* Partner Ecosystem Prompt */}
          <div className="p-3.5 rounded-2xl bg-[#F2F8ED] border border-[#639E1F]/25 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[#639E1F]/15 text-[#2D5A1E] flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#172B15] tracking-tight">Looking to build a business?</p>
                <Link
                  href="/opportunity"
                  className="text-[11px] font-medium text-[#2D5A1E] hover:text-[#639E1F] inline-flex items-center space-x-1 group"
                >
                  <span>Become a Partner</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <a
              href="https://energymaxgroup.com/cabinet"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white border border-[#2D5A1E]/15 text-[#172B15] text-[10px] font-bold uppercase tracking-wider hover:bg-[#172B15] hover:text-white transition-all shadow-sm shrink-0 flex items-center space-x-1"
            >
              <span>Partner Sign In</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Mode Switcher: Password vs OTP */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setError(null);
              }}
              className={`py-2.5 rounded-xl transition-all ${
                authMode === "password"
                  ? "bg-white text-[#172B15] shadow-sm"
                  : "text-neutral-400 hover:text-[#172B15]"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setError(null);
              }}
              className={`py-2.5 rounded-xl transition-all ${
                authMode === "otp"
                  ? "bg-white text-[#172B15] shadow-sm"
                  : "text-neutral-400 hover:text-[#172B15]"
              }`}
            >
              Email OTP
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* MODE 1: PASSWORD AUTHENTICATION */}
          {authMode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Username, Email or Phone *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or username"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("otp");
                      setError(null);
                    }}
                    className="text-[10px] font-semibold text-[#639E1F] hover:underline"
                  >
                    Forgot passcode?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-[#172B15]/10 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: EMAIL OTP AUTHENTICATION */}
          {authMode === "otp" && (
            <div className="space-y-4">
              {otpSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-[#8CC63F]/15 border border-[#8CC63F]/30 text-[#172B15] text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A1E] shrink-0" />
                  <span>{otpSuccessMsg}</span>
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Registered Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="client@energymax.com"
                        className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#639E1F] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#528419] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Dispatching Code...</span>
                      </>
                    ) : (
                      <span>Send 6-Digit Code</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Enter 6-Digit Passcode *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                        }}
                        className="text-[10px] font-semibold text-[#639E1F] hover:underline"
                      >
                        Change Email
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-sm font-mono tracking-widest text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full py-3.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Access Account</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleRequestOtp}
                      className="text-xs text-neutral-500 hover:text-[#2D5A1E] underline font-medium"
                    >
                      Didn&apos;t receive code? Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Registration Link */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">First time client?</span>
            <Link
              href="/shop/auth/register"
              className="font-bold text-[#2D5A1E] hover:text-[#639E1F] transition-colors"
            >
              Create Account →
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}