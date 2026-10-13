// app/verify-email/page.tsx
"use client";

import React, { useEffect, useState, Suspense, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { customerClient, setCustomerSessionToken } from "@/lib/customer-client";
import { useCustomerAuth, CustomerUser } from "@/context/customer-auth-context";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { refreshProfile } = useCustomerAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;
    let redirectTimer: NodeJS.Timeout | null = null;

    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token was provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await customerClient.post<{
          customer: CustomerUser;
          session_token: string;
        }>("/api/v1/shop/customer/auth/verify-email", {
          token,
        });

        if (!isMounted) return;

        if (res.data.session_token) {
          setCustomerSessionToken(res.data.session_token);
          await refreshProfile();
        }

        if (!isMounted) return;
        setStatus("success");

        redirectTimer = setTimeout(() => {
          startTransition(() => {
            router.push("/shop");
          });
        }, 2200);
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(
          err.response?.data?.detail || "The verification link is invalid or has expired."
        );
      }
    };

    verify();

    return () => {
      isMounted = false;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [token, router, refreshProfile]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6 text-[#172B15]">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#2D5A1E]/15 shadow-xl text-center space-y-5 animate-in fade-in duration-200">
        {status === "loading" && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-10 h-10 text-[#075637] animate-spin mx-auto" />
            <h1 className="text-xl font-bold">Verifying your email...</h1>
            <p className="text-xs text-neutral-500">
              Please wait while we confirm your account credentials.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-12 h-12 text-[#16803c] mx-auto" />
            <h1 className="text-2xl font-bold text-[#075637]">Email Verified!</h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Your account is now activated. Redirecting you to the shop...
            </p>
            <Link
              href="/shop"
              prefetch={false}
              className="inline-block px-6 py-3 rounded-xl bg-[#075637] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#064b35] transition-colors"
            >
              Continue to Boutique
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-200">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h1 className="text-xl font-bold text-red-700">Verification Failed</h1>
            <p className="text-xs text-neutral-600 leading-relaxed">{errorMessage}</p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/shop/auth/login"
                prefetch={false}
                className="w-full py-3 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-colors"
              >
                Go to Sign In
              </Link>
              <Link
                href="/shop/auth/register"
                prefetch={false}
                className="w-full py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-600 hover:text-[#172B15] transition-colors"
              >
                Register Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#075637] animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}