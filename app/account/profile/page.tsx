"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Sparkles,
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
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Boutique Catalog</span>
          </Link>

          <Link
            href="/account/addresses"
            className="text-xs font-bold uppercase tracking-wider text-[#639E1F] hover:underline"
          >
            Manage Delivery Addresses &rarr;
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] font-serif font-bold text-2xl flex items-center justify-center uppercase shadow-inner border border-[#8CC63F]/40">
              {customer.first_name?.[0] || "U"}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F]">
                  EnergyMax Client
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8CC63F]" />
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  ID: @{customer.username}
                </span>
              </div>
              <h1 className="text-2xl font-serif tracking-tight text-[#172B15]">
                {customer.first_name} {customer.last_name || ""}
              </h1>
              <p className="text-xs text-neutral-500 flex items-center space-x-1.5 pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Patron since {joinDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/account/addresses"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#FAFAF7] border border-neutral-200 text-xs font-bold text-[#172B15] hover:border-[#639E1F] transition-all"
            >
              <MapPin className="w-4 h-4 text-[#639E1F]" />
              <span>Saved Addresses</span>
            </Link>
          </div>
        </div>

        {/* Verification Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email verification chip */}
          <div className="bg-white rounded-2xl p-5 border border-[#2D5A1E]/15 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center text-neutral-600">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Destination</p>
                <p className="text-xs font-semibold text-[#172B15] truncate max-w-[180px]">
                  {customer.email || "No email linked"}
                </p>
              </div>
            </div>
            {customer.email_verified ? (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-[#639E1F] bg-[#8CC63F]/15 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Unverified
              </span>
            )}
          </div>

          {/* Phone verification chip */}
          <div className="bg-white rounded-2xl p-5 border border-[#2D5A1E]/15 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center text-neutral-600">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Mobile Phone</p>
                <p className="text-xs font-semibold text-[#172B15] font-mono">
                  {customer.phone || "No phone linked"}
                </p>
              </div>
            </div>
            {customer.phone_verified ? (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-[#639E1F] bg-[#8CC63F]/15 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                Linked
              </span>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-serif font-bold text-[#172B15]">
              Personal Information
            </h2>
            <p className="text-xs text-neutral-500">
              Update your formulation order recipient identity.
            </p>
          </div>

          {updateSuccess && (
            <div className="p-3 rounded-xl bg-[#F2F8ED] text-[#2D5A1E] text-xs flex items-center space-x-2 border border-[#8CC63F]/30">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#639E1F]" />
              <span>Profile details updated successfully.</span>
            </div>
          )}

          {updateError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{updateError}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
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
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
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
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-2xl px-4 py-3 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1.5 text-[11px] text-neutral-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Last login: {lastLogin}</span>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="px-6 py-3 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md shadow-[#2D5A1E]/15"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
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