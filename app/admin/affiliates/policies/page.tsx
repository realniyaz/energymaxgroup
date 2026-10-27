// app/admin/affiliates/policies/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getCommissionPolicies,
  createCommissionPolicy,
  deactivateCommissionPolicy,
  AdminCommissionPolicy,
} from "@/lib/services/adminAffiliateService";
import {
  Percent,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Calendar,
  Layers,
  PowerOff,
} from "lucide-react";

export default function AdminCommissionPoliciesPage() {
  const [policies, setPolicies] = useState<AdminCommissionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create Policy Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rateInput, setRateInput] = useState<string>("10.0");
  const [affiliatePublicId, setAffiliatePublicId] = useState<string>("");
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [effectiveUntil, setEffectiveUntil] = useState<string>("");

  const loadPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCommissionPolicies(null, activeOnly);
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to load commission policies.");
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const rateNum = parseFloat(rateInput);
      if (isNaN(rateNum) || rateNum <= 0 || rateNum > 100) {
        throw new Error("Commission rate must be between 0.01% and 100%.");
      }

      // Format ISO 8601 UTC timestamps
      const fromIso = new Date(effectiveFrom).toISOString();
      const untilIso = effectiveUntil ? new Date(effectiveUntil).toISOString() : null;

      await createCommissionPolicy({
        commission_rate: rateNum,
        affiliate_public_id: affiliatePublicId.trim() || null,
        effective_from: fromIso,
        effective_until: untilIso,
      });

      setSuccess("Commission policy deployed successfully.");
      setIsModalOpen(false);
      setRateInput("10.0");
      setAffiliatePublicId("");
      setEffectiveUntil("");
      await loadPolicies();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : err.message || "Failed to create policy.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (policy: AdminCommissionPolicy) => {
    if (!confirm(`Deactivate policy ${policy.public_id}?`)) return;
    try {
      await deactivateCommissionPolicy(policy.public_id);
      setSuccess("Policy successfully deactivated.");
      await loadPolicies();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to deactivate policy.");
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
            Rate Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B15] tracking-tight">
            Commission <span className="italic font-light text-[#639E1F]">Policies Desk</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure global baseline rates and partner-specific promotional rate overrides.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/affiliates"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-xs font-bold uppercase tracking-wider text-[#172B15] hover:bg-[#FAFAF7] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Partner Directory</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1e3c14] transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Rate Policy</span>
          </button>

          <button
            onClick={loadPolicies}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

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

      {/* Filter Ribbon */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-600 cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="rounded text-[#2D5A1E] focus:ring-[#639E1F]"
          />
          <span>Show Active Policies Only</span>
        </label>
      </div>

      {/* Policies Manifest Table */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Loading Policies...
            </span>
          </div>
        ) : policies.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-400 space-y-2">
            <Layers className="w-8 h-8 text-neutral-300 mx-auto" />
            <p>No commission policies configured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B15]">
              <thead className="bg-[#FAFAF7] border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Scope</th>
                  <th className="px-6 py-4">Rate (%)</th>
                  <th className="px-6 py-4">Effective Window</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {policies.map((p) => (
                  <tr key={p.public_id} className="hover:bg-[#FAFAF7]/70">
                    <td className="px-6 py-4 font-sans">
                      {p.affiliate_id ? (
                        <span className="font-bold text-[#172B15]">
                          Partner #{p.affiliate_id} Override
                        </span>
                      ) : (
                        <span className="font-bold text-[#2D5A1E] uppercase tracking-wider text-[10px] bg-[#8CC63F]/15 px-2 py-0.5 rounded-full border border-[#8CC63F]/30">
                          Global Baseline
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-bold text-sm text-[#172B15]">
                      {Number(p.commission_rate)}%
                    </td>

                    <td className="px-6 py-4 text-neutral-600 text-[11px]">
                      <span>{new Date(p.effective_from).toLocaleDateString()}</span>
                      <span className="mx-1 text-neutral-400">→</span>
                      <span>
                        {p.effective_until ? new Date(p.effective_until).toLocaleDateString() : "Indefinite"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center font-sans">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.is_active
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-sans">
                      {p.is_active && (
                        <button
                          onClick={() => handleDeactivate(p)}
                          className="px-3 py-1 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-bold uppercase tracking-wider transition-all border border-red-200 cursor-pointer"
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

      {/* Modal: Create Policy */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#172B15]">Deploy Commission Policy</h3>
            <p className="text-xs text-neutral-500">
              Configure baseline rates or target a specific partner UUID.
            </p>

            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  required
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl p-2.5 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Target Partner UUID (Leave blank for Global Default)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={affiliatePublicId}
                  onChange={(e) => setAffiliatePublicId(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl p-2.5 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    required
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl p-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={effectiveUntil}
                    onChange={(e) => setEffectiveUntil(e.target.value)}
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl p-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>
              </div>

              <div className="flex space-x-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#2D5A1E] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1e3c14] disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? "Deploying..." : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}