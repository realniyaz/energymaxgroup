// app/shop/auth/register/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";

export default function CustomerRegisterPage() {
  const { registerCustomer } = useCustomerAuth();

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation matching CustomerRegisterRequest Pydantic constraints
    if (!formData.email && !formData.phone) {
      setError("Please provide either an email address or a phone number.");
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
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check the provided details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col lg:flex-row text-[#172B15]">
      
      {/* Left Brand Panel */}
      <div className="relative hidden lg:flex lg:w-5/12 bg-[#172B15] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-[#2D5A1E]/30">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8CC63F]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2D5A1E]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/shop" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl p-2 border border-white/15 backdrop-blur-md flex items-center justify-center">
              <Image src="/logo1.png" alt="EnergyMax" width={32} height={32} className="object-contain" priority />
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
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#8CC63F] transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-10 space-y-6 max-w-sm">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
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

      {/* Right Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#FAFAF7]">
        <div className="max-w-lg w-full bg-white text-[#172B15] p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-6">
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Direct Onboarding
            </span>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#172B15]">
              Create <span className="font-serif italic text-[#2D5A1E]">Account</span>
            </h1>
            <p className="text-xs text-neutral-500">
              Provide your details to initiate authenticated client access.
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username */}
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
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. janesmith"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Jane"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Smith"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 chars"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat passcode"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-[#172B15]/10 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Already registered?</span>
            <Link
              href="/shop/auth/login"
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