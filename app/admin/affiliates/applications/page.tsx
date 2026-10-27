// app/admin/affiliates/policies/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Percent,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import {
  getCommissionPolicies,
  createCommissionPolicy,
  deactivateCommissionPolicy,
  AdminCommissionPolicy,
} from "@/lib/services/adminAffiliateService";

export default function AdminAffiliatePoliciesPage() {
  const [policies, setPolicies] = useState<AdminCommissionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rateValue, setRateValue] = useState<string>("10.0000");
  const [affiliatePublicId, setAffiliatePublicId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper to format FastAPI detail safely
  const formatApiError = (err: any): string => {
    const detail = err?.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item: any) => {
          const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "Field";
          return `${field}: ${item.msg || "Invalid value"}`;
        })
        .join(" | ");
    }
    return err?.message || "An unexpected error occurred.";
  };

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCommissionPolicies(undefined, activeOnly);
      setPolicies(data || []);
    } catch (err: any) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [activeOnly]);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const parsedRate = parseFloat(rateValue);
    if (isNaN(parsedRate) || parsedRate <= 0 || parsedRate > 100) {
      setError("Please specify a valid commission rate percentage between 0.0001% and 100%.");
      setSubmitting(false);
      return;
    }

    try {
      // Must be an explicit ISO-8601 string with UTC timezone (Z)
      const nowIso = new Date().toISOString();
      const cleanAffiliateId = affiliatePublicId.trim();

      await createCommissionPolicy({
        commission_rate: parsedRate,
        affiliate_public_id: cleanAffiliateId.length > 0 ? cleanAffiliateId : null,
        effective_from: nowIso,
        effective_until: null,
      });

      setSuccess("Commission policy configured and activated!");
      setIsModalOpen(false);
      setRateValue("10.0000");
      setAffiliatePublicId("");
      await loadPolicies();
    } catch (err: any) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (policy: AdminCommissionPolicy) => {
    if (!confirm(`Deactivate policy #${policy.public_id} (${policy.commission_rate}%)?`)) return;

    try {
      setError(null);
      await deactivateCommissionPolicy(policy.public_id);
      setSuccess("Policy successfully deactivated.");
      await loadPolicies();
    } catch (err: any) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Rate Schedules & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B15] tracking-tight">
            Commission Policies Desk
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure global baseline rates and partner-specific override percentages.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/affiliates"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Affiliate Desk</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Commission Policy</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Toggle View */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveOnly(false)}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            !activeOnly
              ? "bg-[#2D5A1E] text-white shadow-xs"
              : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
          }`}
        >
          All Policies
        </button>

        <button
          onClick={() => setActiveOnly(true)}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeOnly
              ? "bg-[#2D5A1E] text-white shadow-xs"
              : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
          }`}
        >
          Active Policies Only
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs text-neutral-400">Loading commission rate policies...</span>
          </div>
        ) : policies.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-400 space-y-2">
            <Percent className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No policies found. Click "New Commission Policy" to configure a rate schedule.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF7] border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="p-4">Scope / Assignment</th>
                  <th className="p-4">Commission Rate</th>
                  <th className="p-4">Effective Window</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {policies.map((p) => (
                  <tr key={p.public_id} className="hover:bg-neutral-50/50">
                    <td className="p-4">
                      {p.affiliate_id ? (
                        <div className="font-bold text-[#172B15] flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200">
                            Partner Override
                          </span>
                          <span>Affiliate ID #{p.affiliate_id}</span>
                        </div>
                      ) : (
                        <div className="font-bold text-[#2D5A1E] flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] text-[10px] font-bold border border-[#8CC63F]/30 uppercase">
                            Global Default
                          </span>
                          <span>All Active Partners</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold text-sm text-[#2D5A1E]">
                      {p.commission_rate}%
                    </td>

                    <td className="p-4 text-[11px] text-neutral-500 font-mono">
                      <div>From: {new Date(p.effective_from).toLocaleDateString()}</div>
                      <div>
                        Until:{" "}
                        {p.effective_until
                          ? new Date(p.effective_until).toLocaleDateString()
                          : "Indefinite"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          p.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {p.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {p.is_active && (
                        <button
                          onClick={() => handleDeactivate(p)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-[#172B15] uppercase tracking-wider">
                Create Commission Policy
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Configure payout percentage. Leave Affiliate Public ID blank to set a global store baseline rate[cite: 19].
              </p>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-1">
                  Commission Percentage (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    max="100"
                    required
                    value={rateValue}
                    onChange={(e) => setRateValue(e.target.value)}
                    placeholder="e.g. 10.0000"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#639E1F]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-mono text-neutral-400">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-1">
                  Affiliate Public ID (Optional Override)
                </label>
                <input
                  type="text"
                  value={affiliatePublicId}
                  onChange={(e) => setAffiliatePublicId(e.target.value)}
                  placeholder="Leave empty for global store default"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <div className="flex space-x-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                  }}
                  className="px-4 py-2 border rounded-xl text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#2D5A1E] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#234717] disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? "Creating..." : "Save Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}