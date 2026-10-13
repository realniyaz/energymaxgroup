"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { registerCustomer, verifyOtp, requestOtp } = useCustomerAuth();

  const [step, setStep] = useState<"register" | "verify_otp">("register");

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);

    if (!formData.email) {
      setError("An email address is required to create an account.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Passcode must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passcodes do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerCustomer({
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim() || undefined,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      });

      // Dispatch OTP code for registration verification
      await requestOtp(formData.email.trim().toLowerCase(), "email", "registration");
      setInfoMsg(`A 6-digit verification code was sent to ${formData.email.trim().toLowerCase()}.`);
      setStep("verify_otp");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(", "));
      } else {
        setError(err.message || "Registration failed. Please review your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyOtp(
        formData.email.trim().toLowerCase(),
        otpCode.trim(),
        "email",
        "registration"
      );
      startTransition(() => {
        router.push("/shop");
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await requestOtp(formData.email.trim().toLowerCase(), "email", "registration");
      setInfoMsg("A fresh 6-digit code has been dispatched to your email.");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col lg:flex-row text-[#172B15]">
      {/* Left Brand Showcase Panel */}
      <div className="relative hidden lg:flex lg:w-5/12 bg-[#172B15] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-[#2D5A1E]/30 select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8CC63F]/15 rounded-full blur-3xl pointer-events-none will-change-transform" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2D5A1E]/40 rounded-full blur-3xl pointer-events-none will-change-transform" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/shop" prefetch={false} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-white/10 rounded-2xl p-2 border border-white/15 backdrop-blur-xs flex items-center justify-center shadow-xs group-hover:border-[#8CC63F]/50 transition-colors">
              <Image 
                src="/logo1.png" 
                alt="EnergyMax" 
                width={32} 
                height={32} 
                className="object-contain" 
                priority 
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8CC63F] block">
                ENERGYMAX
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">
                Client Registration
              </span>
            </div>
          </Link>

          <Link
            href="/shop"
            prefetch={false}
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#8CC63F] transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        </div>

        {/* Brand Story Highlights */}
        <div className="relative z-10 my-auto py-10 space-y-6 max-w-sm">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#8CC63F]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              Direct Membership
            </span>
          </div>

          <h2 className="text-3xl font-light tracking-tight text-white leading-tight">
            Elevate Your <br />
            <span className="font-serif italic text-[#8CC63F]">Microbiome Routine.</span>
          </h2>

          <div className="space-y-3 pt-2">
            {[
              "Instant tracking of batch-tested cold-chain shipments",
              "Exclusive access to high-potency limited releases",
              "Direct priority consultation with clinical product support",
            ].map((benefit, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-xs text-neutral-300">
                <CheckCircle className="w-4 h-4 text-[#8CC63F] shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-2 text-neutral-400 pt-4 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-[#8CC63F]" />
          <span className="text-[10px] uppercase tracking-wider font-medium">
            Protected by Automated 30-Day Customer Sessions
          </span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#FAFAF7]">
        <div className="max-w-lg w-full bg-white text-[#172B15] p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-6">
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Direct Onboarding
            </span>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#172B15]">
              {step === "register" ? (
                <>Create <span className="font-serif italic text-[#2D5A1E]">Account</span></>
              ) : (
                <>Verify <span className="font-serif italic text-[#2D5A1E]">Your Email</span></>
              )}
            </h1>
            <p className="text-xs text-neutral-500">
              {step === "register"
                ? "Provide your details to initiate authenticated client access."
                : `Enter the 6-digit passcode dispatched to ${formData.email}.`}
            </p>
          </div>

          {/* Zero-Runtime Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMsg && !error && (
            <div className="p-3.5 rounded-2xl bg-[#EAF7ED] border border-[#2D5A1E]/20 text-[#075637] text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {step === "register" ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="janesmith"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="first_name"
                    autoComplete="given-name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Jane"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Smith"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Password and Confirm Password with Eye Toggle Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      name="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 chars"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 pr-11 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#172B15] focus:outline-none cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      name="confirm_password"
                      autoComplete="new-password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Repeat passcode"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 pr-11 text-xs text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#172B15] focus:outline-none cursor-pointer"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-[#172B15]/10 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <span>Continue to Verification</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Verification Passcode *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-sm font-mono tracking-widest text-[#172B15] placeholder:text-neutral-400 focus:outline-none focus:border-[#639E1F] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-4 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <span>Verify Email & Access Store</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("register")}
                  className="hover:text-[#172B15] underline cursor-pointer"
                >
                  Edit Information
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-medium text-[#2D5A1E] hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* Sign In Redirect Link */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Already registered?</span>
            <Link
              href="/shop/auth/login"
              prefetch={false}
              className="font-bold text-[#2D5A1E] hover:text-[#639E1F] transition-colors"
            >
              Sign In Instead →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}