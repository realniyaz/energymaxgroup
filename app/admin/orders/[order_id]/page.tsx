// app/admin/orders/[order_id]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Truck,
  FileText,
  ExternalLink,
  Barcode,
  Calendar,
  Layers,
  Sparkles,
  Phone,
  Mail,
  User,
  History,
} from "lucide-react";
import {
  getAdminOrder,
  updateAdminOrderStatus,
  createOrderShipment,
  assignOrderAWB,
  requestOrderPickup,
  generateOrderShipmentLabel,
  generateOrderShipmentManifest,
  AdminOrderDetailResponse,
  ShipmentResponse,
} from "@/lib/services/adminOrderService";

const ALLOWED_STATUSES = [
  "pending_payment",
  "paid",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
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
  const [shipment, setShipment] = useState<ShipmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Status transition states
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Parcel dimension inputs
  const [lengthCm, setLengthCm] = useState<number>(10);
  const [breadthCm, setBreadthCm] = useState<number>(10);
  const [heightCm, setHeightCm] = useState<number>(10);
  const [weightKg, setWeightKg] = useState<number>(0.5);
  const [courierIdInput, setCourierIdInput] = useState<string>("");

  // Operation loading state
  const [shipmentLoading, setShipmentLoading] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrder(orderId);
      setOrder(data);
      setSelectedStatus(data.status);
      if (data.shipment) {
        setShipment(data.shipment);
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Unable to retrieve order details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Handle manual lifecycle transition
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setUpdatingStatus(true);
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
      setSuccess(
        `Order status transitioned to '${updated.status}' successfully.`
      );
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 1. Initialize Shipment on Shiprocket (POST /shipment)
  const handleCreateShipment = async () => {
    setShipmentLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await createOrderShipment(orderId, {
        length_cm: Number(lengthCm),
        breadth_cm: Number(breadthCm),
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
      });
      setShipment(res);
      setSuccess("Shiprocket shipment record initialized successfully.");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Shipment creation failed."
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  // 2. Assign Courier & Generate AWB (POST /shipment/awb)
  const handleAssignAWB = async () => {
    setShipmentLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const cid = courierIdInput.trim() ? parseInt(courierIdInput, 10) : null;
      const res = await assignOrderAWB(orderId, { courier_id: cid });
      setShipment(res);
      setSuccess(
        `AWB generated: ${res.awb_code} (${res.courier_name || "Courier Assigned"}).`
      );
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "AWB assignment failed."
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  // 3. Request Warehouse Pickup (POST /shipment/pickup)
  const handleRequestPickup = async () => {
    setShipmentLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await requestOrderPickup(orderId);
      setShipment(res);
      setSuccess(`Pickup confirmed. Token: ${res.pickup_token_number}`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Pickup request failed."
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  // 4. Generate & Print Shipping Label (POST /shipment/label)
  const handleGenerateLabel = async () => {
    setShipmentLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await generateOrderShipmentLabel(orderId);
      setShipment(res);
      if (res.label_url) {
        window.open(res.label_url, "_blank");
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Label generation failed."
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  // 5. Generate Courier Manifest (POST /shipment/manifest)
  const handleGenerateManifest = async () => {
    setShipmentLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await generateOrderShipmentManifest(orderId);
      setShipment(res);
      if (res.manifest_url) {
        window.open(res.manifest_url, "_blank");
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Manifest generation failed."
      );
    } finally {
      setShipmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Accessing Order Batch Records...
        </span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-3 font-sans">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-xs text-neutral-500 font-bold">
          Order manifest not found.
        </p>
        <Link
          href="/admin/orders"
          className="text-xs font-bold text-[#639E1F] hover:underline"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const addr = order.shipping_address_snapshot || {};
  const isPacked = order.status === "packed";
  const hasShipment = Boolean(shipment?.shiprocket_shipment_id);
  const hasAwb = Boolean(shipment?.awb_code);
  const hasPickup = Boolean(shipment?.pickup_token_number);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40";
      case "confirmed":
        return "bg-teal-50 text-teal-700 border border-teal-200";
      case "pending_payment":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "processing":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "packed":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-neutral-100 text-neutral-700 border border-neutral-200";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A1E]/15 pb-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#2D5A1E] flex items-center space-x-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Orders Overview</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-[#172B15]">
              Order <span className="font-mono text-[#639E1F]">{order.order_number}</span>
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                order.status
              )}`}
            >
              {order.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <button
          onClick={fetchOrder}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-[#2D5A1E]/20 text-xs text-[#2D5A1E] font-bold flex items-center space-x-1.5 hover:bg-[#FAFAF7] transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Desk</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Items Checklist, Financial Ledger & Shipping Snapshot */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-serif font-bold text-[#172B15]">
                Formulation Items ({order.items.length})
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#639E1F]">
                Sterile Cold-Chain Pack
              </span>
            </div>

            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div
                  key={item.public_id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-center text-[#2D5A1E] shrink-0">
                      <Sparkles className="w-4 h-4 text-[#8CC63F]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#172B15]">{item.product_name}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        Qty: {item.quantity} × ₹
                        {Number(item.unit_price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-[#172B15]">
                    ₹{Number(item.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Ledger */}
            <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Promotional Discount</span>
                <span>
                  -₹{Number(order.discount_amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>₹{Number(order.shipping_amount).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{Number(order.tax_amount).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold text-[#172B15] pt-2 border-t border-neutral-100">
                <span>Total Amount</span>
                <span>
                  ₹
                  {Number(order.total_amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Destination Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center space-x-2 text-neutral-700">
                <MapPin className="w-4 h-4 text-[#639E1F]" />
                <h2 className="text-base font-serif font-bold text-[#172B15]">
                  Delivery Snapshot
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAFAF7] border text-neutral-600 font-mono">
                {addr.label || "Customer Destination"}
              </span>
            </div>

            <div className="text-xs text-neutral-600 space-y-2 bg-[#FAFAF7] p-4 rounded-2xl border border-neutral-100">
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-[#639E1F]" />
                <span className="font-bold text-[#172B15] text-sm">
                  {addr.recipient_name || order.customer_name}
                </span>
              </div>

              <div className="pl-5 space-y-0.5">
                <p>
                  {addr.address_line1}
                  {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                </p>
                {addr.landmark && (
                  <p className="text-neutral-400 text-[11px]">
                    Landmark: {addr.landmark}
                  </p>
                )}
                <p className="font-semibold text-[#172B15]">
                  {addr.city}, {addr.state} – {addr.postal_code}
                </p>
                {addr.country && (
                  <p className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider">
                    {addr.country}
                  </p>
                )}
              </div>

              <div className="pl-5 pt-2 border-t border-neutral-200/60 flex flex-wrap gap-4 text-[11px] font-mono text-neutral-500">
                <span className="flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-[#639E1F]" />
                  <span>{addr.phone || order.customer_phone || "—"}</span>
                </span>
                {order.customer_email && (
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-[#639E1F]" />
                    <span>{order.customer_email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Transition Audit Trail */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-neutral-700 border-b border-neutral-100 pb-2">
                <History className="w-4 h-4 text-[#639E1F]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B15]">
                  Transition Audit Trail
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                {order.status_history.map((hist) => (
                  <div
                    key={hist.id}
                    className="flex items-start justify-between p-2.5 rounded-xl bg-[#FAFAF7] border border-neutral-100 font-mono text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-[#172B15] uppercase">
                        {hist.status}
                      </span>
                      {hist.note && (
                        <p className="text-neutral-500 font-sans text-xs mt-0.5">
                          {hist.note}
                        </p>
                      )}
                    </div>
                    <span className="text-neutral-400 text-[10px]">
                      {new Date(hist.created_at).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Shiprocket Logistics Desk & Status Machine */}
        <div className="lg:col-span-5 space-y-6">
          {/* Shiprocket Fulfillment Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#639E1F]" />
                <h2 className="text-base font-serif font-bold text-[#172B15]">
                  Shiprocket Logistics Desk
                </h2>
              </div>
              {shipment && (
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {shipment.status}
                </span>
              )}
            </div>

            {/* Stage 1: Parcel Specs Form */}
            {!hasShipment && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-500">
                  {isPacked
                    ? "Enter parcel specifications to book on Shiprocket:"
                    : "The order must be transitioned to 'PACKED' before initiating Shiprocket fulfillment."}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">
                      L (cm)
                    </label>
                    <input
                      type="number"
                      value={lengthCm}
                      onChange={(e) =>
                        setLengthCm(parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">
                      B (cm)
                    </label>
                    <input
                      type="number"
                      value={breadthCm}
                      onChange={(e) =>
                        setBreadthCm(parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">
                      H (cm)
                    </label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) =>
                        setHeightCm(parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={weightKg}
                      onChange={(e) =>
                        setWeightKg(parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#639E1F]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateShipment}
                  disabled={!isPacked || shipmentLoading}
                  className="w-full py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#172B15] transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  {shipmentLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Create Shiprocket Shipment</span>
                  )}
                </button>
              </div>
            )}

            {/* Stages 2, 3 & 4: Active Shiprocket Operations */}
            {hasShipment && shipment && (
              <div className="space-y-4 text-xs">
                {/* Meta Identifiers */}
                <div className="p-3 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">SR Order ID:</span>
                    <span className="font-bold text-[#172B15]">
                      {shipment.shiprocket_order_id || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">SR Shipment ID:</span>
                    <span className="font-bold text-[#172B15]">
                      {shipment.shiprocket_shipment_id || "—"}
                    </span>
                  </div>
                  {shipment.awb_code && (
                    <div className="flex justify-between text-[#2D5A1E]">
                      <span>AWB Code:</span>
                      <span className="font-bold">
                        {shipment.awb_code} (
                        {shipment.courier_name || "Assigned"})
                      </span>
                    </div>
                  )}
                  {shipment.pickup_token_number && (
                    <div className="flex justify-between text-blue-700">
                      <span>Pickup Token:</span>
                      <span className="font-bold">
                        {shipment.pickup_token_number}
                      </span>
                    </div>
                  )}
                </div>

                {/* Step 2: Assign AWB */}
                {!hasAwb && (
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">
                      Courier ID (Optional override)
                    </label>
                    <input
                      type="number"
                      placeholder="Leave blank for automatic best courier"
                      value={courierIdInput}
                      onChange={(e) => setCourierIdInput(e.target.value)}
                      className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#639E1F]"
                    />
                    <button
                      type="button"
                      onClick={handleAssignAWB}
                      disabled={
                        shipmentLoading ||
                        shipment.awb_operation_status === "in_progress"
                      }
                      className="w-full py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {shipmentLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Barcode className="w-3.5 h-3.5" />
                          <span>Generate AWB & Courier</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Step 3: Schedule Pickup */}
                {hasAwb && !hasPickup && (
                  <button
                    type="button"
                    onClick={handleRequestPickup}
                    disabled={
                      shipmentLoading ||
                      shipment.pickup_operation_status === "in_progress"
                    }
                    className="w-full py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#172B15] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {shipmentLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Warehouse Pickup</span>
                      </>
                    )}
                  </button>
                )}

                {/* Step 4: Documents (Label & Manifest) */}
                {hasAwb && (
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <button
                      type="button"
                      onClick={handleGenerateLabel}
                      disabled={shipmentLoading}
                      className="w-full py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#172B15] hover:bg-[#FAFAF7] text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#639E1F]" />
                      <span>
                        {shipment.label_url
                          ? "Open Shipping Label"
                          : "Generate Shipping Label"}
                      </span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </button>

                    {hasPickup && (
                      <button
                        type="button"
                        onClick={handleGenerateManifest}
                        disabled={shipmentLoading}
                        className="w-full py-2 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#172B15] hover:bg-[#FAFAF7] text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#639E1F]" />
                        <span>
                          {shipment.manifest_url
                            ? "Open Manifest PDF"
                            : "Generate Courier Manifest"}
                        </span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual Order Transition Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D5A1E]/15 shadow-xs space-y-4">
            <h2 className="text-base font-serif font-bold text-[#172B15]">
              Manual Order Transition
            </h2>

            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Lifecycle Stage
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
                  Transition Note
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Order verified and formulation approved..."
                  className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-1.5 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus || selectedStatus === order.status}
                className="w-full py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {updatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Apply Transition</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}