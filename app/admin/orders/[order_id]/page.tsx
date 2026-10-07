// app/admin/orders/[order_id]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Package,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  getAdminOrder,
  updateAdminOrderStatus,
  AdminOrderDetailResponse,
} from "@/lib/services/adminOrderService";

const ALLOWED_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.order_id;

  const [order, setOrder] = useState<AdminOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Status update form states
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrder(orderId);
      setOrder(data);
      setSelectedStatus(data.status);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to retrieve order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateAdminOrderStatus(orderId, {
        status: selectedStatus,
        note: statusNote.trim() || undefined,
      });
      setOrder(updated);
      setSelectedStatus(updated.status);
      setStatusNote("");
      setSuccess(`Status updated to '${updated.status}' successfully.`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Accessing Order Batch Records...
        </span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-xs text-neutral-500 font-bold">Order manifest not found.</p>
        <Link href="/admin/orders" className="text-xs font-bold text-[#639E1F] hover:underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  const addr = order.shipping_address_snapshot;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Orders Overview</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-[#172B15]">
              Order <span className="font-mono text-[#639E1F]">{order.order_number}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40">
              {order.status.replace("_", " ")}
            </span>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Items & Delivery Snapshot */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-[#172B15]">
              Formulation Items ({order.items.length})
            </h2>

            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.public_id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#172B15]">{item.product_name}</p>
                    <p className="text-[11px] text-neutral-400">
                      Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-[#172B15]">
                    ₹{Number(item.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-₹{Number(order.discount_amount).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{Number(order.shipping_amount).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{Number(order.tax_amount).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold text-[#172B15] pt-2 border-t border-neutral-100">
                <span>Total Amount</span>
                <span>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-neutral-700">
              <MapPin className="w-4 h-4 text-[#639E1F]" />
              <h2 className="text-base font-serif font-bold text-[#172B15]">Shipping Destination Snapshot</h2>
            </div>
            <div className="text-xs text-neutral-600 space-y-1 bg-[#FAFAF7] p-4 rounded-2xl border border-neutral-100">
              <p className="font-bold text-[#172B15]">{addr.recipient_name || order.customer_name}</p>
              <p>{addr.address_line1} {addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
              <p>{addr.city}, {addr.state} – {addr.postal_code}</p>
              <p className="font-mono text-[11px] text-neutral-400">Mobile: {addr.phone || order.customer_phone || "—"}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Status & Cold-Chain Tracking Action */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-[#172B15]">
              Update Order Status
            </h2>
            <p className="text-xs text-neutral-500">
              Transition order lifecycle states in accordance with transition validation rules.
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                >
                  {ALLOWED_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Status Note / Reason
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Dispatched in cold-chain transit batch #4..."
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <button
                type="submit"
                disabled={updating || selectedStatus === order.status}
                className="w-full py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Status...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Apply Transition</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}