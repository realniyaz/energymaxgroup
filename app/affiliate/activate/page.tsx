// app/affiliate/activate/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { activateAffiliateAccount } from "@/lib/services/affiliateService";
import TurnstileWidget from "@/app/components/affiliate/TurnstileWidget";
import { Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function ActivateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Activation token is missing from the link.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!captchaToken) {
      setError("Please complete the Turnstile verification.");
      return;
    }

    setLoading(true);
    try {
      await activateAffiliateAccount(token, password, captchaToken);
      setSuccess(true);
      setTimeout(() => {
        router.push("/affiliate/login");
      }, 2500);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to activate affiliate account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6 text-[#172B15]">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Partner Onboarding
          </span>
          <h1 className="text-2xl font-light text-[#172B15] tracking-tight">
            Activate Your <span className="font-serif italic text-[#2D5A1E]">Affiliate Account</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Choose a secure password to complete activation.
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-2xl bg-[#8CC63F]/15 border border-[#8CC63F]/30 text-[#172B15] text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-[#2D5A1E] shrink-0" />
            <span>Account activated successfully! Redirecting to login...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                New Password (min 8 chars) *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl px-4 py-3 pl-11 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>
            </div>

            {/* Cloudflare Turnstile CAPTCHA */}
            <TurnstileWidget onSuccess={(t) => setCaptchaToken(t)} />

            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full py-3.5 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <span>Complete Activation</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/affiliate/login"
            className="text-xs text-[#2D5A1E] hover:underline"
          >
            Already activated? Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AffiliateActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        </div>
      }
    >
      <ActivateForm />
    </Suspense>
  );
}