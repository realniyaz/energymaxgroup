// app/affiliate/kyc/digilocker/callback/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDigiLockerKYCStatus } from "@/lib/services/affiliateService";

function DigiLockerCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationId =
    searchParams.get("verification_id") ||
    (typeof window !== "undefined"
      ? localStorage.getItem("digilocker_verification_id")
      : null);

  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      if (!verificationId) {
        setErrorMessage("Verification reference not found.");
        setLoading(false);
        return;
      }

      try {
        const res = await getDigiLockerKYCStatus(verificationId);
        const st = (res.status || "").toUpperCase();

        if (st === "COMPLETED" || st === "AUTHENTICATED" || st === "SUCCESS") {
          setSuccess(true);
          localStorage.removeItem("digilocker_verification_id");
          setTimeout(() => {
            router.replace("/affiliate/kyc?verified=true");
          }, 2000);
        } else if (st === "FAILED" || st === "EXPIRED") {
          setErrorMessage("DigiLocker authentication was canceled or expired. Please retry.");
        } else {
          // In progress or initiated
          setSuccess(true);
          setTimeout(() => {
            router.replace("/affiliate/kyc");
          }, 2000);
        }
      } catch (err: any) {
        setErrorMessage(
          err?.response?.data?.detail || "Could not confirm DigiLocker verification status."
        );
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [verificationId, router]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-6 text-[#172B15] font-sans">
      <div className="bg-white p-8 rounded-3xl border border-[#2D5A1E]/15 shadow-sm max-w-md w-full text-center space-y-4">
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 text-[#2D5A1E] animate-spin mx-auto" />
            <h2 className="text-base font-bold uppercase tracking-wider text-[#172B15]">
              Verifying DigiLocker Document
            </h2>
            <p className="text-xs text-neutral-500">
              Please wait while we confirm your automated digital identity verification...
            </p>
          </>
        ) : success ? (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider text-emerald-800">
              DigiLocker Verification Complete
            </h2>
            <p className="text-xs text-neutral-500">
              Your government identity record was authenticated successfully. Returning to portal...
            </p>
            <div className="pt-2">
              <Link
                href="/affiliate/kyc"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider text-rose-800">
              Verification Incomplete
            </h2>
            <p className="text-xs text-neutral-500">
              {errorMessage || "Verification could not be confirmed."}
            </p>
            <div className="pt-2">
              <Link
                href="/affiliate/kyc"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all cursor-pointer"
              >
                <span>Return to KYC Desk</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DigiLockerCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        </div>
      }
    >
      <DigiLockerCallbackContent />
    </Suspense>
  );
}