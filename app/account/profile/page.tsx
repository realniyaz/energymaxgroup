"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Package,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { customerClient } from "@/lib/customer-client";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { customer, isAuthenticated, loading: authLoading, refreshProfile } = useCustomerAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/shop/auth/login?redirect=/account/profile");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name || "");
      setLastName(customer.last_name || "");
    }
  }, [customer]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);

    if (!firstName.trim()) {
      setUpdateError("First name is required.");
      return;
    }

    setUpdating(true);
    try {
      await customerClient.put("/api/v1/shop/customer/profile", {
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
      });
      await refreshProfile();
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setUpdateError(typeof detail === "string" ? detail : "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || !customer) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
      </div>
    );
  }

  const joinDate = customer.created_at
    ? new Date(customer.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Member";

  const lastLogin = customer.last_login_at
    ? new Date(customer.last_login_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Active Session";

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-10 sm:py-14 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/shop/account/orders"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#2D5A1E]/15 text-xs font-semibold text-[#172B15] hover:border-[#639E1F] transition-all shadow-sm"
            >
              <Package className="w-3.5 h-3.5 text-[#639E1F]" />
              <span>My Orders</span>
            </Link>

            <Link
              href="/account/addresses"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#2D5A1E]/15 text-xs font-semibold text-[#172B15] hover:border-[#639E1F] transition-all shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-[#639E1F]" />
              <span>Saved Addresses</span>
            </Link>
          </div>
        </div>

        {/* Profile Identity Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] font-bold text-2xl flex items-center justify-center uppercase border border-[#8CC63F]/40 shadow-sm shrink-0">
              {customer.first_name?.[0] || "U"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#639E1F]">
                  Account Profile
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span className="text-[11px] font-mono text-neutral-500">
                  @{customer.username}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#172B15]">
                {customer.first_name} {customer.last_name || ""}
              </h1>
              <p className="text-xs text-neutral-500 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Member since {joinDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#F2F8ED] border border-[#8CC63F]/30 text-xs font-semibold text-[#2D5A1E] flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#639E1F]" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>

        {/* Verification Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email card */}
          <div className="bg-white rounded-2xl p-5 border border-[#2D5A1E]/15 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center text-neutral-600 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</p>
                <p className="text-xs font-semibold text-[#172B15] truncate">
                  {customer.email || "No email linked"}
                </p>
              </div>
            </div>
            {customer.email_verified ? (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-[#639E1F] bg-[#8CC63F]/15 px-2.5 py-1 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
                Unverified
              </span>
            )}
          </div>

          {/* Phone card */}
          <div className="bg-white rounded-2xl p-5 border border-[#2D5A1E]/15 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center text-neutral-600 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Phone Number</p>
                <p className="text-xs font-semibold text-[#172B15] font-mono truncate">
                  {customer.phone || "No phone linked"}
                </p>
              </div>
            </div>
            {customer.phone_verified ? (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-[#639E1F] bg-[#8CC63F]/15 px-2.5 py-1 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full shrink-0">
                Linked
              </span>
            )}
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-bold text-[#172B15]">
              Personal Information
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Update your name and delivery contact details.
            </p>
          </div>

          {updateSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#F2F8ED] text-[#2D5A1E] text-xs flex items-center space-x-2 border border-[#8CC63F]/30">
              <Check className="w-4 h-4 shrink-0 text-[#639E1F]" />
              <span>Your profile details have been saved.</span>
            </div>
          )}

          {updateError && (
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs flex items-center space-x-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{updateError}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-neutral-100">
              <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Last session: {lastLogin}</span>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="px-7 py-3 rounded-2xl bg-[#2D5A1E] hover:bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}