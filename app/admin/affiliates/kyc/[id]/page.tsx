// app/admin/affiliates/kyc/[id]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  UserCheck,
  History,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  ShieldCheck,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import {
  getAdminKYCSubmission,
  getAdminKYCSubmissions,
  decideAdminKYCSubmission,
  downloadAdminKYCDocument,
  reassignAdminKYCSubmission,
  AdminKYCSubmissionItem,
  AdminReviewDecision,
  AdminKYCStatus,
} from "@/lib/services/adminAffiliateService";

export default function AdminKYCInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const routeParam = resolvedParams.id;
  const searchParams = useSearchParams();
  const queryNumericId = searchParams.get("numericId");

  const [resolvedNumericId, setResolvedNumericId] = useState<number | null>(null);
  const [submission, setSubmission] = useState<AdminKYCSubmissionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Document Viewer Modal State
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    type: "pdf" | "image";
    title: string;
    filename: string;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);

  // Decisions & Status Modals
  const [decisionModal, setDecisionModal] = useState<AdminReviewDecision | null>(null);
  const [decisionReason, setDecisionReason] = useState("");

  const [isManualStatusModalOpen, setIsManualStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<AdminKYCStatus>("VERIFIED");
  const [statusReason, setStatusReason] = useState("");

  // Reassignment Modal State
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [targetReviewerId, setTargetReviewerId] = useState("");
  const [reassignReason, setReassignReason] = useState("");

  // 1. Resolve numeric ID and load details
  useEffect(() => {
    async function resolveAndFetch() {
      setLoading(true);
      setErrorMsg(null);
      try {
        let numericId: number;

        if (queryNumericId && /^\d+$/.test(queryNumericId)) {
          numericId = parseInt(queryNumericId, 10);
        } else if (/^\d+$/.test(routeParam)) {
          numericId = parseInt(routeParam, 10);
        } else {
          // Fallback: match UUID in list to find numeric ID
          const listRes = await getAdminKYCSubmissions(null, 100, 0);
          const found = listRes.items.find((item) => item.public_id === routeParam);
          numericId = (found as any)?.id ?? 1;
        }

        setResolvedNumericId(numericId);
        const data = await getAdminKYCSubmission(numericId);
        setSubmission(data);
      } catch (err: any) {
        setErrorMsg(
          err?.response?.data?.detail || "Failed to load KYC submission details."
        );
      } finally {
        setLoading(false);
      }
    }

    resolveAndFetch();
  }, [routeParam, queryNumericId]);

  const reloadData = async () => {
    if (!resolvedNumericId) return;
    try {
      const data = await getAdminKYCSubmission(resolvedNumericId);
      setSubmission(data);
    } catch {
      // Ignored
    }
  };

  // 2. Fetch and open document in interactive viewer
const handleViewDocument = async (
  docType: "AADHAAR_FRONT" | "AADHAAR_BACK" | "PAN_CARD",
  filename: string
) => {
  if (!resolvedNumericId) return;

  // Ensure exact uppercase without whitespace
  const cleanDocType = docType.trim().toUpperCase() as
    | "AADHAAR_FRONT"
    | "AADHAAR_BACK"
    | "PAN_CARD";

  setPreviewLoading(cleanDocType);
  setErrorMsg(null);

  try {
    const blob = await downloadAdminKYCDocument(resolvedNumericId, cleanDocType);
    const isPdf =
      blob.type === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
    const url = window.URL.createObjectURL(blob);

    setPreviewZoom(1);
    setPreviewRotation(0);
    setPreviewDoc({
      url,
      type: isPdf ? "pdf" : "image",
      title: cleanDocType.replace("_", " "),
      filename,
    });
  } catch (err: any) {
    const detail = err?.response?.data?.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : "Failed to load document preview from private storage.";
    setErrorMsg(msg);
  } finally {
    setPreviewLoading(null);
  }
};

  const closePreview = () => {
    if (previewDoc?.url) {
      window.URL.revokeObjectURL(previewDoc.url);
    }
    setPreviewDoc(null);
  };

  // 3. Direct document download
  const handleDownload = async (
    docType: "AADHAAR_FRONT" | "AADHAAR_BACK" | "PAN_CARD",
    filename: string
  ) => {
    if (!resolvedNumericId) return;
    try {
      const blob = await downloadAdminKYCDocument(resolvedNumericId, docType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download document.");
    }
  };

  // 4. Decision submit
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionModal || !resolvedNumericId) return;

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await decideAdminKYCSubmission(resolvedNumericId, {
        decision: decisionModal,
        reason: decisionReason.trim() || undefined,
      });
      setSuccessMsg(`Decision "${decisionModal}" recorded successfully.`);
      setDecisionModal(null);
      setDecisionReason("");
      await reloadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Decision submission failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Direct Status Override
  const handleStatusOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedNumericId) return;

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Map KYCStatus to standard review decisions where applicable
    let mappedDecision: AdminReviewDecision = "APPROVED";
    if (targetStatus === "REJECTED") mappedDecision = "REJECTED";
    if (targetStatus === "RESUBMISSION_REQUIRED") mappedDecision = "RESUBMISSION_REQUESTED";

    try {
      await decideAdminKYCSubmission(resolvedNumericId, {
        decision: mappedDecision,
        reason: statusReason.trim() || `Administrative compliance override to ${targetStatus}`,
      });
      setSuccessMsg(`Status successfully transitioned to ${targetStatus}.`);
      setIsManualStatusModalOpen(false);
      setStatusReason("");
      await reloadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Status update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Reassign Reviewer
  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedNumericId) return;

    setActionLoading(true);
    try {
      await reassignAdminKYCSubmission(resolvedNumericId, {
        reviewer_id: parseInt(targetReviewerId, 10),
        reason: reassignReason.trim(),
      });
      setSuccessMsg("Auditor reassigned successfully.");
      setIsReassignOpen(false);
      setTargetReviewerId("");
      setReassignReason("");
      await reloadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Reassignment failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !submission) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Loading Submission Dossier...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-[#FAFAF7] min-h-screen font-sans text-[#172B15] max-w-6xl mx-auto">
      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <Link
          href="/admin/affiliates/kyc"
          className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#172B15] flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to KYC Queue</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* Status Override Button */}
          <button
            onClick={() => setIsManualStatusModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#172B15] hover:bg-[#FAFAF7] text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#639E1F]" />
            <span>Update Status</span>
          </button>

          {/* Reassign Reviewer Button */}
          <button
            onClick={() => setIsReassignOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#172B15] hover:bg-[#FAFAF7] text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#2D5A1E]" />
            <span>Reassign</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dossier Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A1E]/15 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F] block">
              KYC Compliance Dossier
            </span>
            <h2 className="text-xl sm:text-2xl font-mono font-bold text-[#172B15] mt-0.5">
              {submission.public_id}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-2 font-sans">
              <span className="font-semibold text-[#2D5A1E]">
                Affiliate Partner #{submission.affiliate_id}
              </span>
              <span>•</span>
              <span>
                Assigned Auditor:{" "}
                <strong className="text-neutral-700">
                  {submission.assigned_reviewer_id
                    ? `Admin #${submission.assigned_reviewer_id}`
                    : "Unassigned"}
                </strong>
              </span>
              <span>•</span>
              <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200">
              {submission.status}
            </span>
          </div>
        </div>

        {submission.decision_reason && (
          <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-200 text-xs text-neutral-700 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Active Reason / Notes
            </span>
            <p>{submission.decision_reason}</p>
          </div>
        )}

        {/* Quick Review Decisions */}
        <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold uppercase text-neutral-400 mr-2">
            Record Decision:
          </span>
          <button
            onClick={() => setDecisionModal("APPROVED")}
            className="px-4 py-2 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve & Verify</span>
          </button>
          <button
            onClick={() => setDecisionModal("RESUBMISSION_REQUESTED")}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Request Resubmission</span>
          </button>
          <button
            onClick={() => setDecisionModal("REJECTED")}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Submitted Documents Grid with View & Download */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Attached Legal Documents ({submission.documents.length})
          </h3>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
            Private Storage Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {submission.documents.map((doc) => {
            const isViewingThis = previewLoading === doc.document_type;

            return (
              <div
                key={doc.public_id}
                className="bg-white p-5 rounded-3xl border border-[#2D5A1E]/15 space-y-4 shadow-xs hover:border-[#639E1F] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#172B15] flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-[#2D5A1E]" />
                      <span>{doc.document_type.replace("_", " ")}</span>
                    </span>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500">
                      {(doc.file_size_bytes / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 truncate" title={doc.original_filename}>
                    {doc.original_filename}
                  </p>
                </div>

                {/* Primary Button: View | Secondary Button: Download */}
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => handleViewDocument(doc.document_type, doc.original_filename)}
                    disabled={isViewingThis}
                    className="flex-1 py-2.5 rounded-xl bg-[#172B15] text-white hover:bg-[#2D5A1E] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isViewingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleDownload(doc.document_type, doc.original_filename)}
                    title="Download Document"
                    className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all cursor-pointer border border-neutral-200"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review History Audit Trail */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-neutral-100 flex items-center space-x-2">
          <History className="w-4 h-4 text-[#2D5A1E]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#172B15]">
            Audit Trail & History Logs ({submission.review_history.length})
          </h3>
        </div>
        <div className="divide-y divide-neutral-100 font-mono text-xs">
          {submission.review_history.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 font-sans">
              No historical review events logged yet.
            </div>
          ) : (
            submission.review_history.map((h) => (
              <div key={h.public_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2 font-bold text-[#172B15]">
                    <span>{h.action}</span>
                    <span className="text-[10px] text-neutral-400 font-normal font-sans">
                      ({h.previous_status || "INIT"} → {h.new_status})
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans">
                    {h.reason ? `Note: ${h.reason}` : "No note provided"} • Reviewer #{h.reviewer_id ?? "System"}
                  </p>
                </div>
                <span className="text-[10px] text-neutral-400 font-sans">
                  {new Date(h.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. DOCUMENT VIEWER MODAL (Images + PDF) */}
      {/* ======================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between bg-[#172B15] text-white px-6 py-3 rounded-2xl mb-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8CC63F]">
                Document Preview:
              </span>
              <span className="text-xs font-semibold">{previewDoc.title}</span>
              <span className="text-[10px] text-neutral-300 font-mono">
                ({previewDoc.filename})
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {previewDoc.type === "image" && (
                <>
                  <button
                    onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewZoom((z) => Math.min(3, z + 0.25))}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewRotation((r) => (r + 90) % 360)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    title="Rotate 90deg"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </>
              )}

              <a
                href={previewDoc.url}
                download={previewDoc.filename}
                className="p-1.5 rounded-lg bg-[#8CC63F] text-[#172B15] hover:bg-[#7db835] font-bold text-xs"
                title="Download Document"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                onClick={closePreview}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Close Viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 bg-neutral-900 rounded-3xl overflow-hidden flex items-center justify-center p-2 relative">
            {previewDoc.type === "pdf" ? (
              <iframe
                src={`${previewDoc.url}#toolbar=0`}
                className="w-full h-full rounded-2xl border-none"
                title={previewDoc.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  style={{
                    transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                    transition: "transform 0.2s ease-out",
                  }}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DECISION MODAL */}
      {/* ======================================================== */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold uppercase tracking-wider text-[#172B15]">
              Confirm Action: {decisionModal}
            </h3>
            <p className="text-xs text-neutral-400">
              Provide an administrative rationale. Notes are logged permanently in the audit ledger.
            </p>
            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <textarea
                required={decisionModal !== "APPROVED"}
                rows={4}
                placeholder="Enter justification or instructions for the affiliate..."
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#FAFAF7] border border-neutral-200 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setDecisionModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-xs font-bold uppercase text-neutral-600 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase hover:bg-[#2D5A1E] disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Confirm Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DIRECT STATUS UPDATE MODAL */}
      {/* ======================================================== */}
      {isManualStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex items-center space-x-2 text-[#2D5A1E]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold uppercase tracking-wider text-[#172B15]">
                Update Compliance Status
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              Force transition this KYC dossier to another compliance stage.
            </p>

            <form onSubmit={handleStatusOverrideSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Target Compliance Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as AdminKYCStatus)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs font-bold text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                >
                  <option value="VERIFIED">VERIFIED (Approved)</option>
                  <option value="IN_REVIEW">IN_REVIEW (Auditing)</option>
                  <option value="RESUBMISSION_REQUIRED">RESUBMISSION_REQUIRED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Status Change Justification
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Reason for changing status directly..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsManualStatusModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-xs font-bold uppercase text-neutral-600 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase hover:bg-[#2D5A1E] disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. REASSIGN REVIEWER MODAL */}
      {/* ======================================================== */}
      {isReassignOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold uppercase tracking-wider text-[#172B15]">
              Reassign KYC Auditor
            </h3>
            <form onSubmit={handleReassignSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Target Admin User ID
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2"
                  value={targetReviewerId}
                  onChange={(e) => setTargetReviewerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs font-mono text-[#172B15]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Reassignment Reason
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State reason for auditor handover..."
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs text-[#172B15]"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReassignOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-neutral-100 text-xs font-bold uppercase text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase hover:bg-[#2D5A1E] disabled:opacity-50"
                >
                  {actionLoading ? "Reassigning..." : "Reassign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}