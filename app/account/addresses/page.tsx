"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Star,
  ArrowLeft,
  X,
  Loader2,
  Building,
  Home,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import {
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  CustomerAddressResponse,
  CustomerAddressPayload,
} from "@/lib/services/customerAddressService";

const LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home className="w-4 h-4" />,
  Office: <Briefcase className="w-4 h-4" />,
  Work: <Briefcase className="w-4 h-4" />,
  Clinic: <Building className="w-4 h-4" />,
};

const initialFormData: CustomerAddressPayload = {
  label: "Home",
  recipient_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false,
};

export default function CustomerAddressesPage() {
  const router = useRouter();
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [addresses, setAddresses] = useState<CustomerAddressResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPublicId, setEditingPublicId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerAddressPayload>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Redirect unauthenticated visitors
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/shop/auth/login?redirect=/account/addresses");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load addresses list from FastAPI
  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await getCustomerAddresses();
      setAddresses(data);
    } catch (err: any) {
      console.error("Failed to load customer addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    }
  }, [isAuthenticated]);

  const handleOpenAdd = () => {
    setEditingPublicId(null);
    setFormData({
      ...initialFormData,
      recipient_name: customer ? `${customer.first_name} ${customer.last_name || ""}`.trim() : "",
      phone: customer?.phone || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: CustomerAddressResponse) => {
    setEditingPublicId(addr.public_id);
    setFormData({
      label: addr.label,
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country || "India",
      is_default: addr.is_default,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic frontend schema validations matching backend rules
    if (!formData.recipient_name.trim()) {
      setFormError("Recipient name is required.");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      setFormError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!/^\d{6}$/.test(formData.postal_code.trim())) {
      setFormError("Please enter a valid 6-digit postal PIN code.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingPublicId) {
        await updateCustomerAddress(editingPublicId, formData);
      } else {
        await createCustomerAddress(formData);
      }
      setIsModalOpen(false);
      await loadAddresses();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setFormError(typeof detail === "string" ? detail : "Unable to save address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteCustomerAddress(publicId);
      await loadAddresses();
    } catch (err) {
      console.error("Delete address failed:", err);
    }
  };

  const handleSetDefault = async (publicId: string) => {
    try {
      await setDefaultCustomerAddress(publicId);
      await loadAddresses();
    } catch (err) {
      console.error("Set default address failed:", err);
    }
  };

  if (authLoading || (!customer && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>

          <Link
            href="/account/profile"
            className="text-xs font-bold uppercase tracking-wider text-[#639E1F] hover:underline"
          >
            View Account Profile &rarr;
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
              Logistics & Cold-Chain
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#172B15]">
              Saved Delivery Addresses
            </h1>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] shadow-md shadow-[#2D5A1E]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#2D5A1E] animate-spin" />
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Fetching addresses...
            </p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-[#172B15]">No addresses on file</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Add your primary residential or clinic address to expedite express temperature-controlled shipping.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-6 py-2.5 rounded-full bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all"
            >
              Add First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((addr) => (
              <motion.div
                key={addr.public_id}
                layout
                className={`bg-white rounded-3xl p-6 border transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                  addr.is_default
                    ? "border-[#639E1F] ring-1 ring-[#639E1F]/30"
                    : "border-[#2D5A1E]/15 hover:border-[#2D5A1E]/30"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Badge Header */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAFAF7] border border-neutral-200 text-xs font-bold text-[#172B15]">
                      {LABEL_ICONS[addr.label] || <MapPin className="w-3.5 h-3.5" />}
                      <span>{addr.label}</span>
                    </div>

                    {addr.is_default ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-[#639E1F] bg-[#8CC63F]/15 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Default Shipping</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.public_id)}
                        className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-[#2D5A1E] transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  {/* Recipient Details */}
                  <div>
                    <h3 className="text-base font-bold text-[#172B15]">{addr.recipient_name}</h3>
                    <p className="text-xs text-neutral-500 font-mono">{addr.phone}</p>
                  </div>

                  {/* Address Body */}
                  <div className="text-xs text-neutral-600 leading-relaxed space-y-0.5">
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    {addr.landmark && (
                      <p className="text-neutral-400 text-[11px]">Landmark: {addr.landmark}</p>
                    )}
                    <p className="font-semibold text-[#172B15] pt-1">
                      {addr.city}, {addr.state} – {addr.postal_code}
                    </p>
                    <p className="text-[11px] text-neutral-400 uppercase tracking-widest">{addr.country}</p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="p-2 rounded-xl text-neutral-500 hover:text-[#172B15] hover:bg-neutral-100 transition-colors"
                    title="Edit address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.public_id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* =========================================================
          ADD / EDIT ADDRESS MODAL DRAWER
         ========================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2D5A1E]/20 text-[#172B15] z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
                    Address Records
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-[#172B15]">
                    {editingPublicId ? "Edit Delivery Address" : "New Delivery Address"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-[#172B15] hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Address Label Choice */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Address Label *
                  </label>
                  <div className="flex items-center space-x-2">
                    {["Home", "Office", "Clinic", "Other"].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setFormData({ ...formData, label: lbl })}
                        className={`flex-1 py-2 rounded-xl font-bold text-center border transition-all ${
                          formData.label === lbl
                            ? "bg-[#2D5A1E] text-white border-[#2D5A1E]"
                            : "bg-[#FAFAF7] text-neutral-600 border-neutral-200 hover:border-[#639E1F]"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.recipient_name}
                      onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3.5 py-2.5 text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3.5 py-2.5 text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Address Line 1 (House/Flat/Building) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    placeholder="e.g. Flat 402, Lotus Tower"
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3.5 py-2.5 text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Address Line 2 (Street/Area)
                    </label>
                    <input
                      type="text"
                      value={formData.address_line2 || ""}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                      placeholder="e.g. Sector 62"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3.5 py-2.5 text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={formData.landmark || ""}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      placeholder="e.g. Near Fortis Hospital"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3.5 py-2.5 text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Noida"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3.5 py-2.5 text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Uttar Pradesh"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3.5 py-2.5 text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value.replace(/\D/g, "") })}
                      placeholder="201301"
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/20 rounded-xl px-3.5 py-2.5 text-[#172B15] font-mono focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>
                </div>

                {/* Default checkbox */}
                <label className="flex items-center space-x-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default || false}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-[#2D5A1E] focus:ring-[#639E1F]"
                  />
                  <span className="text-xs text-neutral-700">Set as my primary delivery destination</span>
                </label>

                {/* Form Buttons */}
                <div className="pt-4 flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 rounded-2xl bg-[#2D5A1E] text-white font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Save Address</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3.5 rounded-2xl bg-neutral-100 text-neutral-600 font-bold uppercase hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}