// app/affiliate/kyc/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  FileText,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  KeyRound,
  FileCheck2,
} from "lucide-react";
import { useAffiliateAuth } from "@/context/affiliate-auth-context";
import {
  getManualKYCStatus,
  getManualKYCDocuments,
  submitManualKYC,
  verifyAffiliatePAN,
  generateAffiliateAadhaarOTP,
  verifyAffiliateAadhaarOTP,
  ManualKYCStatusResponse,
  ManualKYCDocumentsResponse,
  KYCStatus,
} from "@/lib/services/affiliateService";

export default function AffiliateKYCPage() {
  const router = useRouter();
  const { affiliate, loading: authLoading } = useAffiliateAuth();

  const [activeTab, setActiveTab] = useState<"instant" | "manual">("instant");
  const [kycStatus, setKycStatus] = useState<ManualKYCStatusResponse | null>(null);
  const [kycDocs, setKycDocs] = useState<ManualKYCDocumentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Instant PAN state
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [panLoading, setPanLoading] = useState(false);
  const [panResult, setPanResult] = useState<{ verified: boolean; message: string; masked_pan?: string } | null>(null);

  // Instant Aadhaar OTP state
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otpStep, setOtpStep] = useState<"input" | "verify">("input");
  const [aadhaarReferenceId, setAadhaarReferenceId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [aadhaarResult, setAadhaarResult] = useState<{ verified: boolean; message: string } | null>(null);

  // Manual File Upload states
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [manualMessage, setManualMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !affiliate) {
      router.replace("/affiliate/login");
    }
  }, [affiliate, authLoading, router]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [statusRes, docsRes] = await Promise.all([
        getManualKYCStatus().catch(() => null),
        getManualKYCDocuments().catch(() => null),
      ]);
      setKycStatus(statusRes);
      setKycDocs(docsRes);
      if (statusRes?.status && statusRes.status !== "NOT_STARTED") {
        setActiveTab("manual");
      }
    } catch {
      // Ignored: defaults to clean initial form
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (affiliate) {
      loadStatus();
    }
  }, [affiliate]);

  const handlePanVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanLoading(true);
    setPanResult(null);
    try {
      const res = await verifyAffiliatePAN({
        pan: panNumber.trim().toUpperCase(),
        name: panName.trim() || undefined,
      });
      setPanResult({
        verified: res.verified,
        message: res.message,
        masked_pan: res.masked_pan,
      });
    } catch (err: any) {
      setPanResult({
        verified: false,
        message: err.response?.data?.detail || "PAN verification failed.",
      });
    } finally {
      setPanLoading(false);
    }
  };

  const handleSendAadhaarOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAadhaarLoading(true);
    setAadhaarResult(null);
    try {
      const res = await generateAffiliateAadhaarOTP({
        aadhaar_number: aadhaarNumber.trim(),
      });
      setAadhaarReferenceId(res.reference_id);
      setOtpStep("verify");
      setAadhaarResult({ verified: false, message: res.message });
    } catch (err: any) {
      setAadhaarResult({
        verified: false,
        message: err.response?.data?.detail || "Failed to generate Aadhaar OTP.",
      });
    } finally {
      setAadhaarLoading(false);
    }
  };

  const handleVerifyAadhaarOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAadhaarLoading(true);
    setAadhaarResult(null);
    try {
      const res = await verifyAffiliateAadhaarOTP({
        reference_id: aadhaarReferenceId,
        otp: otpCode.trim(),
      });
      setAadhaarResult({
        verified: res.verified,
        message: res.message,
      });
    } catch (err: any) {
      setAadhaarResult({
        verified: false,
        message: err.response?.data?.detail || "OTP verification failed.",
      });
    } finally {
      setAadhaarLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualMessage(null);

    if (!frontFile || !backFile || !panFile) {
      setManualMessage({
        type: "error",
        text: "Please provide Aadhaar Front, Aadhaar Back, and PAN card documents.",
      });
      return;
    }

    setUploadLoading(true);
    try {
      await submitManualKYC(frontFile, backFile, panFile);
      setManualMessage({
        type: "success",
        text: "Documents submitted successfully for administrative compliance review.",
      });
      setFrontFile(null);
      setBackFile(null);
      setPanFile(null);
      await loadStatus();
    } catch (err: any) {
      setManualMessage({
        type: "error",
        text: err.response?.data?.detail || "Submission failed. Please verify file sizes (max 5 MB) and formats (PDF/JPEG/PNG).",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const renderStatusBadge = (status?: KYCStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5" />
            <span>In Review</span>
          </span>
        );
      case "RESUBMISSION_REQUIRED":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Resubmission Required</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case "PENDING_REVIEW":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span>Not Started</span>
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Checking KYC Verification Status...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-[#2D5A1E]/15 px-6 sm:px-12 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center space-x-4">
          <Link
            href="/affiliate/dashboard"
            className="w-9 h-9 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-all text-[#172B15]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-serif font-bold text-[#172B15]">
              Identity & KYC Compliance
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">
              Mandatory verification required before requesting partner payouts
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {renderStatusBadge(kycStatus?.status)}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 sm:p-10 space-y-8">
        {/* Verification Status Banner */}
        {kycStatus?.decision_reason && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[11px] block">
                Compliance Review Note
              </span>
              <p className="mt-0.5 text-amber-800">{kycStatus.decision_reason}</p>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex space-x-2 border-b border-[#2D5A1E]/15 pb-2">
          <button
            onClick={() => setActiveTab("instant")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "instant"
                ? "bg-[#172B15] text-white shadow-xs"
                : "text-neutral-500 hover:text-[#172B15] hover:bg-neutral-100"
            }`}
          >
            Instant Online KYC (Cashfree)
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "manual"
                ? "bg-[#172B15] text-white shadow-xs"
                : "text-neutral-500 hover:text-[#172B15] hover:bg-neutral-100"
            }`}
          >
            Manual Document Upload
          </button>
        </div>

        {/* TAB 1: Instant Verification */}
        {activeTab === "instant" && (
          <div className="space-y-8">
            {/* PAN Verification */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-[#2D5A1E]">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#172B15]">
                  1. PAN Verification
                </h2>
              </div>
              <p className="text-xs text-neutral-400">
                Instantly validates your Permanent Account Number against government databases.
              </p>

              {panResult && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
                    panResult.verified
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {panResult.verified ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {panResult.message} {panResult.masked_pan && `(${panResult.masked_pan})`}
                  </span>
                </div>
              )}

              <form onSubmit={handlePanVerify} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      PAN Number (10 Alphanumeric)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs font-mono uppercase focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      Name as on PAN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={panName}
                      onChange={(e) => setPanName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={panLoading || !panNumber}
                  className="px-6 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {panLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify PAN</span>}
                </button>
              </form>
            </div>

            {/* Aadhaar OTP */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-[#2D5A1E]">
                <KeyRound className="w-5 h-5" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#172B15]">
                  2. Aadhaar Paperless Offline Verification
                </h2>
              </div>
              <p className="text-xs text-neutral-400">
                Receive a one-time security OTP sent directly to your UIDAI registered mobile number.
              </p>

              {aadhaarResult && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
                    aadhaarResult.verified
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-amber-50 border border-amber-200 text-amber-800"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{aadhaarResult.message}</span>
                </div>
              )}

              {otpStep === "input" ? (
                <form onSubmit={handleSendAadhaarOTP} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      12-Digit Aadhaar Number
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      required
                      placeholder="123456789012"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs font-mono focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={aadhaarLoading || aadhaarNumber.length !== 12}
                    className="px-6 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {aadhaarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Request OTP</span>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAadhaarOTP} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs font-mono tracking-widest text-center focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={aadhaarLoading || otpCode.length !== 6}
                      className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      {aadhaarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify OTP</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpStep("input")}
                      className="px-4 py-2.5 text-xs text-neutral-500 hover:text-neutral-700"
                    >
                      Change Aadhaar Number
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Manual Document Upload */}
        {activeTab === "manual" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A1E]/15 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#172B15]">
                Manual Document Dossier
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Upload clear PDF, JPEG, or PNG images (up to 5 MB per file) for internal admin review.
              </p>
            </div>

            {manualMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
                  manualMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}
              >
                {manualMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{manualMessage.text}</span>
              </div>
            )}

            {/* Current Uploaded Documents Status */}
            {kycDocs && kycDocs.documents.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                  Previously Uploaded Documents
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {kycDocs.documents.map((doc) => (
                    <div
                      key={doc.document_type}
                      className="p-3 bg-white border border-neutral-200 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center space-x-2 text-[#2D5A1E]">
                        <FileCheck2 className="w-4 h-4" />
                        <span className="font-bold text-[10px]">{doc.document_type}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate">{doc.original_filename}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Aadhaar Front */}
                <div className="border border-dashed border-neutral-300 rounded-2xl p-5 text-center space-y-2 hover:border-[#639E1F] transition-all">
                  <UploadCloud className="w-6 h-6 text-neutral-400 mx-auto" />
                  <span className="text-xs font-bold block text-[#172B15]">Aadhaar Front</span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    required={!kycDocs?.documents.length}
                    onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                    className="text-[10px] text-neutral-500 w-full"
                  />
                  {frontFile && <p className="text-[9px] text-[#639E1F] font-mono truncate">{frontFile.name}</p>}
                </div>

                {/* Aadhaar Back */}
                <div className="border border-dashed border-neutral-300 rounded-2xl p-5 text-center space-y-2 hover:border-[#639E1F] transition-all">
                  <UploadCloud className="w-6 h-6 text-neutral-400 mx-auto" />
                  <span className="text-xs font-bold block text-[#172B15]">Aadhaar Back</span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    required={!kycDocs?.documents.length}
                    onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                    className="text-[10px] text-neutral-500 w-full"
                  />
                  {backFile && <p className="text-[9px] text-[#639E1F] font-mono truncate">{backFile.name}</p>}
                </div>

                {/* PAN Card */}
                <div className="border border-dashed border-neutral-300 rounded-2xl p-5 text-center space-y-2 hover:border-[#639E1F] transition-all">
                  <UploadCloud className="w-6 h-6 text-neutral-400 mx-auto" />
                  <span className="text-xs font-bold block text-[#172B15]">PAN Card</span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    required={!kycDocs?.documents.length}
                    onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                    className="text-[10px] text-neutral-500 w-full"
                  />
                  {panFile && <p className="text-[9px] text-[#639E1F] font-mono truncate">{panFile.name}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadLoading || kycStatus?.status === "VERIFIED"}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Documents...</span>
                  </>
                ) : (
                  <span>Submit Dossier For Review</span>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}