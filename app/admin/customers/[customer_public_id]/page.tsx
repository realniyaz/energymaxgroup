// app/admin/customers/[customer_public_id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Trash2,
  Laptop,
} from "lucide-react";
import {
  getCustomerById,
  deleteCustomer,
  CustomerDetailResponse,
} from "@/lib/services/adminCustomerService";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerPublicId = params?.customer_public_id as string;

  const [customer, setCustomer] = useState<CustomerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      if (!customerPublicId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerById(customerPublicId);
        setCustomer(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Customer profile could not be retrieved.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [customerPublicId]);

  const handleDelete = async () => {
    if (!customer) return;
    const confirm = window.confirm(
      `Permanently purge account @${customer.username}? This removes all customer sessions, addresses, and saved data.`
    );
    if (!confirm) return;

    setDeleting(true);
    try {
      await deleteCustomer(customer.public_id);
      router.push("/admin/customers");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete customer.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Loading Client Profile...
        </span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || "Customer record not found."}</span>
        </div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#2D5A1E] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Customers Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers Directory</span>
        </Link>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          <span>Delete Account</span>
        </button>
      </div>

      {/* Main Profile Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] font-bold text-2xl flex items-center justify-center uppercase border border-[#8CC63F]/40 shadow-sm shrink-0">
            {customer.first_name?.[0] || "U"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#639E1F]">
                Customer Account
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              <span className="text-[11px] font-mono text-neutral-400">
                @{customer.username}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#172B15]">
              {customer.first_name} {customer.last_name || ""}
            </h1>
            <p className="text-xs text-neutral-500 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                Joined on{" "}
                {new Date(customer.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              customer.is_active
                ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40"
                : "bg-neutral-100 text-neutral-500 border border-neutral-200"
            }`}
          >
            {customer.is_active ? "Active Status" : "Inactive"}
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
            UUID: {customer.public_id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Verification & Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Email Verification */}
        <div className="bg-white rounded-2xl p-5 border border-[#2D5A1E]/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Email Contact
            </span>
            {customer.email_verified ? (
              <ShieldCheck className="w-4 h-4 text-[#639E1F]" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <p className="text-xs font-semibold text-[#172B15] truncate">
            {customer.email || "No email linked"}
          </p>
          <span
            className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              customer.email_verified
                ? "bg-[#8CC63F]/15 text-[#2D5A1E]"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {customer.email_verified ? "Verified" : "Unverified"}
          </span>
        </div>

        {/* Phone Verification */}
        <div className="bg-white rounded-2xl p-5 border border-[#2D5A1E]/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Phone Number
            </span>
            <Phone className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xs font-semibold text-[#172B15] font-mono">
            {customer.phone || "No phone linked"}
          </p>
          <span
            className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              customer.phone_verified
                ? "bg-[#8CC63F]/15 text-[#2D5A1E]"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {customer.phone_verified ? "Verified" : "Linked"}
          </span>
        </div>

        {/* Last Login Info */}
        <div className="bg-white rounded-2xl p-5 border border-[#2D5A1E]/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Session Activity
            </span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xs font-semibold text-[#172B15]">
            {customer.last_login_at
              ? new Date(customer.last_login_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Never Authenticated"}
          </p>
          <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
            Audit Timestamp
          </span>
        </div>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#172B15]">Saved Shipping Addresses</h2>
            <p className="text-xs text-neutral-500">
              Delivery destinations saved on file by the customer.
            </p>
          </div>
          <span className="text-xs font-bold text-[#2D5A1E] bg-[#8CC63F]/20 px-3 py-1 rounded-xl">
            {customer.addresses?.length || 0} Registered
          </span>
        </div>

        {!customer.addresses || customer.addresses.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No active addresses recorded for this customer account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.addresses.map((addr) => (
              <div
                key={addr.public_id}
                className={`p-5 rounded-2xl border transition-all space-y-2 ${
                  addr.is_default
                    ? "bg-[#FAFAF7] border-[#2D5A1E]/30 shadow-sm"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#172B15]">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E]">
                        Default Address
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    PIN: {addr.postal_code}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#172B15]">{addr.recipient_name}</p>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {addr.address_line1}
                  {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                  {addr.landmark ? `, Near ${addr.landmark}` : ""}
                  <br />
                  {addr.city}, {addr.state} - {addr.postal_code}, {addr.country}
                </p>
                <p className="text-xs text-neutral-500 font-mono pt-1">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Sessions / Login Tokens */}
      {customer.sessions && customer.sessions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#172B15]">Active Storefront Sessions</h2>
          <div className="divide-y divide-neutral-100">
            {customer.sessions.map((sess) => (
              <div key={sess.public_id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <Laptop className="w-4 h-4 text-neutral-400" />
                  <div>
                    <span className="font-mono text-[11px] text-[#172B15]">
                      Session ID: {sess.public_id.slice(0, 12)}...
                    </span>
                    <p className="text-[10px] text-neutral-400">
                      Created: {new Date(sess.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      sess.is_active
                        ? "bg-[#8CC63F]/20 text-[#2D5A1E]"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {sess.is_active ? "Active" : "Revoked"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}