// app/shop/auth/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  Phone,
  Lock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Loader2,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { customerClient } from "@/lib/customer-client";

type RecoveryMethod = "email" | "username" | "phone";

export default function CustomerForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<"request" | "verify" | "reset">("request");

  // Form State
  const [method, setMethod] = useState<RecoveryMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // STEP 1: Request Recovery OTP
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await customerClient.post<{ message: string }>(
        "/api/v1/shop/customer/auth/forgot-password/verify",
        {
          method: method.trim().toLowerCase(),
          identifier: identifier.trim(),
        }
      );
      setSuccessMsg(res.data.message);
      setStep("verify");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Failed to initiate recovery request."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Obtain One-Time Reset Token
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (otpCode.trim().length !== 6) {
      setError("Please enter a valid 6-digit passcode.");
      return;
    }

    setLoading(true);

    try {
      const res = await customerClient.post<{
        message: string;
        reset_token: string;
        expires_at: string;
      }>("/api/v1/shop/customer/auth/forgot-password/confirm-otp", {
        method: method.trim().toLowerCase(),
        identifier: identifier.trim(),
        code: otpCode.trim(),
      });

      setResetToken(res.data.reset_token);
      setSuccessMsg("Passcode verified. Please define your new credentials.");
      setStep("reset");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Invalid or expired recovery code."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Helper
  const handleResend = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await customerClient.post<{ message: string }>(
        "/api/v1/shop/customer/auth/forgot-password/resend",
        {
          method: method.trim().toLowerCase(),
          identifier: identifier.trim(),
        }
      );
      setSuccessMsg(res.data.message);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to resend recovery code."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Passcode must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passcodes do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await customerClient.post<{ message: string }>(
        "/api/v1/shop/customer/auth/forgot-password/reset",
        {
          reset_token: resetToken.trim(),
          new_password: newPassword,
        }
      );

      setSuccessMsg(res.data.message || "Password reset successfully.");
      setTimeout(() => {
        router.push("/shop/auth/login");
      }, 2000);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Password reset failed. Please start over."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col lg:flex-row text-[#172B15]">
      {/* LEFT SHOWCASE */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-[#172B15] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-[#2D5A1E]/30 select-none">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#8CC63F]/15 rounded-full blur-2xl pointer-events-none will-change-transform" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#2D5A1E]/40 rounded-full blur-2xl pointer-events-none will-change-transform" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/shop" prefetch={false} className="flex items-center space-x-3 group">
            <div className="w-11 h-11 bg-white/10 rounded-2xl p-2 border border-white/15 flex items-center justify-center shadow-sm group-hover:border-[#8CC63F]/50 transition-colors">
              <Image
                src="/logo1.png"
                alt="EnergyMax Logo"
                width={36}
                height={36}
                priority
                className="object-contain"
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
            href="/shop/auth/login"
            prefetch={false}
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#8CC63F] transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>

        {/* Center Editorial Card */}
        <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#8CC63F]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Credentials Recovery
            </span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-light tracking-tight text-white leading-tight">
            Restore Secure Access <br />
            <span className="font-serif italic text-[#8CC63F]">To Your Sanctuary.</span>
          </h2>

          <p className="text-xs xl:text-sm text-neutral-300 font-normal leading-relaxed">
            Verify your registered credentials. A single-use 6-digit recovery passcode will be dispatched to the email associated with your customer profile.
          </p>
        </div>

        {/* Security Badge */}
        <div className="relative z-10 flex items-center space-x-2 text-neutral-400 pt-4 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-[#8CC63F]" />
          <span className="text-[10px] uppercase tracking-wider font-medium">
            One-Time Cryptographic Tokenized Verification Enforced
          </span>
        </div>
      </div>

      {/* RIGHT WORKFLOW PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#FAFAF7]">
        <div className="max-w-md w-full bg-white text-[#172B15] p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-lg space-y-6">
          
          {/* Mobile Back Link */}
          <div className="flex items-center justify-between lg:hidden pb-4 border-b border-neutral-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#172B15] p-1.5 flex items-center justify-center">
                <Image src="/logo1.png" alt="EnergyMax Logo" width={20} height={20} className="object-contain" priority />
              </div>
              <span className="text-xs font-bold text-[#172B15] tracking-widest uppercase">EnergyMax</span>
            </div>
            <Link href="/shop/auth/login" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E]">
              Sign In
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Direct Recovery Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#172B15]">
              {step === "request" && (
                <>Recover <span className="font-serif italic text-[#2D5A1E]">Password</span></>
              )}
              {step === "verify" && (
                <>Enter <span className="font-serif italic text-[#2D5A1E]">Passcode</span></>
              )}
              {step === "reset" && (
                <>Set <span className="font-serif italic text-[#2D5A1E]">New Passcode</span></>
              )}
            </h1>
            <p className="text-xs text-neutral-500">
              {step === "request" &&
                "Choose your identifier method to receive your recovery code."}
              {step === "verify" &&
                "Check your registered email inbox for the 6-digit recovery code."}
              {step === "reset" &&
                "Enter a new password containing at least 8 characters."}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Status Alert */}
          {successMsg && !error && (
            <div className="p-3.5 rounded-2xl bg-[#EAF7ED] border border-[#2D5A1E]/20 text-[#075637] text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16803c]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: METHOD & IDENTIFIER */}
          {step === "request" && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-[10px] font-bold uppercase tracking-wider text-center">
                {(["email", "username", "phone"] as RecoveryMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMethod(m);
                      setError(null);
                    }}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      method === m
                        ? "bg-white text-[#172B15] shadow-sm"
                        : "text-neutral-400 hover:text-[#172B15]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  {method === "email" && "Registered Email Address *"}
                  {method === "username" && "Account Username *"}
                  {method === "phone" && "Registered Phone Number *"}
                </label>
                <div className="relative">
                  {method === "email" && (
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  )}
                  {method === "username" && (
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  )}
                  {method === "phone" && (
                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  )}

                  <input
                    type={method === "email" ? "email" : "text"}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      method === "email"
                        ? "client@energymax.com"
                        : method === "username"
                        ? "e.g. janesmith"
                        : "+91 98765 43210"
                    }
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="w-full py-3.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Locating Account...</span>
                  </>
                ) : (
                  <span>Send Recovery Code</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY CODE */}
          {step === "verify" && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    6-Digit Passcode *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setOtpCode("");
                    }}
                    className="text-[10px] font-semibold text-[#639E1F] hover:underline cursor-pointer"
                  >
                    Change Method
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="123456"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-sm font-mono tracking-widest text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating Passcode...</span>
                  </>
                ) : (
                  <span>Confirm Code</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResend}
                  className="text-xs text-neutral-500 hover:text-[#2D5A1E] underline font-medium cursor-pointer"
                >
                  Didn&apos;t receive code? Resend
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 pr-10 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 pr-10 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#639E1F] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#528419] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Update Password & Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Remember your credentials?</span>
            <Link
              href="/shop/auth/login"
              className="font-bold text-[#2D5A1E] hover:text-[#639E1F] transition-colors flex items-center space-x-1"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}