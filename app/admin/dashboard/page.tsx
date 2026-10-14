// app/admin/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  PlusCircle, 
  TrendingUp, 
  ArrowUpRight, 
  Loader2, 
  RefreshCw, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  IndianRupee, 
  ShieldCheck, 
  Star,
  Users,
  Tag,
  Bell,
  Clock
} from "lucide-react";

// Service Imports
import { getProducts, getProductImages, Product } from "@/lib/services/productService";
import { getAdminOrders, AdminOrderListItem } from "@/lib/services/adminOrderService";
import { getCustomerStats, CustomerStats } from "@/lib/services/adminCustomerService";
import { getAdminInventoryBalances, InventoryBalanceItem } from "@/lib/services/adminInventoryService";
import { getAdminWarehouses, WarehouseItem } from "@/lib/services/adminWarehouseService";
import { getAdminCoupons, CouponItem } from "@/lib/services/couponService";
import { getAdminUnreadNotificationCount } from "@/lib/services/adminNotificationService";

export default function AdminDashboardPage() {
  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [imagesMap, setImagesMap] = useState<Record<number, string>>({});
  
  // Dashboard Subsystems State
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [balances, setBalances] = useState<InventoryBalanceItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Derived Financial & Inventory Metrics
  const totalProducts = products.length;
  
  const estimatedCatalogValue = products.reduce((acc, curr) => {
    const val = curr.price != null && !isNaN(Number(curr.price)) ? Number(curr.price) : 0;
    return acc + val;
  }, 0);

  const averagePrice = totalProducts > 0 
    ? Math.round(estimatedCatalogValue / totalProducts) 
    : 0;

  const featuredCount = products.filter((p) => p.is_featured).length;

  // Inventory Aggregations
  const totalAvailableStock = balances.reduce((acc, b) => acc + Number(b.available || 0), 0);
  const totalReservedStock = balances.reduce((acc, b) => acc + Number(b.reserved || 0), 0);

  // Revenue Aggregations (from latest orders fetch)
  const totalGrossOrderRevenue = orders.reduce((acc, o) => {
    const val = Number(o.total_amount || 0);
    return acc + (!isNaN(val) ? val : 0);
  }, 0);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Concurrent fetch across all major administrative subsystems
      const [
        productRes,
        ordersRes,
        customerStatsRes,
        balancesRes,
        warehousesRes,
        couponsRes,
        unreadCountRes
      ] = await Promise.allSettled([
        getProducts(1, 50),
        getAdminOrders({ page: 1, page_size: 6 }),
        getCustomerStats(),
        getAdminInventoryBalances(),
        getAdminWarehouses(),
        getAdminCoupons({ limit: 100 }),
        getAdminUnreadNotificationCount()
      ]);

      // 1. Process Catalog Products
      let productList: Product[] = [];
      if (productRes.status === "fulfilled") {
        const data = productRes.value;
        productList = Array.isArray(data) ? data : data.items || [];
        setProducts(productList);
      }

      // 2. Process Recent Orders
      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value.items || []);
      }

      // 3. Process Customer Stats
      if (customerStatsRes.status === "fulfilled") {
        setCustomerStats(customerStatsRes.value);
      }

      // 4. Process Inventory Balances
      if (balancesRes.status === "fulfilled") {
        setBalances(balancesRes.value.items || []);
      }

      // 5. Process Warehouses
      if (warehousesRes.status === "fulfilled") {
        setWarehouses(warehousesRes.value.items || []);
      }

      // 6. Process Active Coupons
      if (couponsRes.status === "fulfilled") {
        setCoupons(couponsRes.value || []);
      }

      // 7. Process Unread Notifications
      if (unreadCountRes.status === "fulfilled") {
        setUnreadNotifications(unreadCountRes.value || 0);
      }

      // Resolve primary thumbnails concurrently
      const imgMap: Record<number, string> = {};
      await Promise.allSettled(
        productList.map(async (prod) => {
          if (prod.images && prod.images.length > 0) {
            const primary = prod.images.find((img) => img.is_primary) || prod.images[0];
            if (primary?.image_url) {
              imgMap[prod.id] = primary.image_url;
              return;
            }
          }

          if (prod.id) {
            try {
              const fetched = await getProductImages(prod.id);
              if (fetched && fetched.length > 0) {
                const primary = fetched.find((img) => img.is_primary) || fetched[0];
                if (primary?.image_url) {
                  imgMap[prod.id] = primary.image_url;
                }
              }
            } catch {
              // Ignore single thumbnail fetch failure
            }
          }
        })
      );

      setImagesMap(imgMap);
    } catch (err: any) {
      console.error("Dashboard synchronization failed:", err);
      setError("Unable to sync live metrics from the backend. Please verify database connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="w-full space-y-8 pb-16 font-sans">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F]">
              Control Center & Telemetry
            </span>
            {unreadNotifications > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#8CC63F]/20 text-[#2D5A1E]">
                {unreadNotifications} New Alerts
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-light text-[#172B15] tracking-tight">
            Dashboard <span className="font-serif italic text-[#639E1F]">Overview</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Telemetry</span>
          </button>
          
          <Link
            href="/admin/products/create"
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 shadow-md shadow-[#2D5A1E]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New SKU</span>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-28 space-y-4 bg-white rounded-3xl border border-[#2D5A1E]/15 shadow-sm">
          <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Synchronizing catalog telemetry & financial metrics...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-3xl bg-red-50/70 border border-red-200 text-center space-y-3">
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="text-xs text-red-900 font-medium">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Dashboard Data UI */}
      {!loading && !error && (
        <div className="space-y-8">
          
          {/* Row 1: Core Financial & Catalog Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
            
            {/* Active Inventory */}
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/15 flex items-center justify-center text-[#2D5A1E]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Active Inventory</span>
                <h3 className="text-3xl font-serif text-[#172B15] font-medium pt-1">{totalProducts} SKUs</h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Available Stock:</span>
                <span className="text-[#2D5A1E] font-bold font-mono">{totalAvailableStock.toLocaleString("en-IN")} units</span>
              </div>
            </div>

            {/* Catalog Gross Value */}
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#2D5A1E]/10 flex items-center justify-center text-[#2D5A1E]">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Catalog Gross Value</span>
                <h3 className="text-2xl font-serif text-[#172B15] font-medium pt-1">
                  ₹{estimatedCatalogValue.toLocaleString("en-IN")}
                </h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Avg SKU Unit:</span>
                <span className="text-[#2D5A1E] font-semibold font-mono">₹{averagePrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Customer CRM Telemetry */}
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/15 flex items-center justify-center text-[#2D5A1E]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Patron Database</span>
                <h3 className="text-3xl font-serif text-[#172B15] font-medium pt-1">
                  {customerStats?.total_customers ?? "—"}
                </h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Verified Emails:</span>
                <span className="text-[#639E1F] font-semibold">{customerStats?.email_verified_count ?? 0}</span>
              </div>
            </div>

            {/* Featured Formulations */}
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Featured Formulations</span>
                <h3 className="text-3xl font-serif text-[#172B15] font-medium pt-1">{featuredCount}</h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Active Campaigns:</span>
                <span className="text-amber-700 font-semibold">{coupons.filter(c => c.is_active).length} Coupons</span>
              </div>
            </div>

          </div>

          {/* Row 2: Secondary Quick Metric Strips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">Warehouses</span>
                <span className="text-lg font-bold text-[#172B15]">{warehouses.filter(w => w.is_active).length} Active Hubs</span>
              </div>
              <Link href="/admin/inventory/warehouses" className="text-xs font-bold text-[#2D5A1E] hover:underline">
                View
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">Stock Holds</span>
                <span className="text-lg font-bold text-amber-600">{totalReservedStock} Units Reserved</span>
              </div>
              <Link href="/admin/inventory" className="text-xs font-bold text-[#2D5A1E] hover:underline">
                Audit
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">Recent Volume</span>
                <span className="text-lg font-bold text-[#172B15]">₹{totalGrossOrderRevenue.toLocaleString("en-IN")}</span>
              </div>
              <Link href="/admin/orders" className="text-xs font-bold text-[#2D5A1E] hover:underline">
                Orders
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">Active Promos</span>
                <span className="text-lg font-bold text-[#2D5A1E]">{coupons.filter(c => c.is_active).length} Live Codes</span>
              </div>
              <Link href="/admin/coupons" className="text-xs font-bold text-[#2D5A1E] hover:underline">
                Manage
              </Link>
            </div>
          </div>

          {/* Lower Section Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            
            {/* Left Column: Recent Orders & Catalog Entries */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Recent Orders Ledger */}
              <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-light text-[#172B15]">Recent Customer Orders</h3>
                    <p className="text-xs text-neutral-500">Live fulfillment and dispatch telemetry.</p>
                  </div>
                  <Link
                    href="/admin/orders"
                    className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E] hover:underline flex items-center space-x-1"
                  >
                    <span>View All Orders</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-neutral-200 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        <th className="pb-3 px-3">Order Number</th>
                        <th className="pb-3 px-3">Customer</th>
                        <th className="pb-3 px-3">Total Amount</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.public_id} className="hover:bg-[#F2F8ED]/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-[#172B15]">
                            {order.order_number}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#172B15] block">{order.customer_name}</span>
                            <span className="text-[10px] text-neutral-400 truncate max-w-[150px] block">
                              {order.customer_email || order.customer_phone || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#172B15]">
                            ₹{Number(order.total_amount).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#8CC63F]/20 text-[#2D5A1E]">
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/admin/orders/${order.public_id}`}
                              className="px-3 py-1 rounded-lg bg-[#2D5A1E]/10 text-[#2D5A1E] font-bold hover:bg-[#2D5A1E] hover:text-white transition-all text-[11px]"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}

                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-neutral-400 text-xs">
                            No recent customer orders found in the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Catalog Entries Table */}
              <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-light text-[#172B15]">Recent Catalog Entries</h3>
                    <p className="text-xs text-neutral-500">Latest active items synchronized from FastAPI endpoints.</p>
                  </div>
                  <Link
                    href="/admin/products"
                    className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E] hover:underline flex items-center space-x-1"
                  >
                    <span>View All Catalog</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-neutral-200 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        <th className="pb-3 px-3">Product</th>
                        <th className="pb-3 px-3">Selling Price</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                      {products.slice(0, 5).map((item) => (
                        <tr key={item.public_id} className="hover:bg-[#F2F8ED]/40 transition-colors">
                          <td className="py-3 px-3 font-semibold text-[#172B15]">
                            <div className="line-clamp-1">{item.name}</div>
                            <div className="text-[10px] font-mono text-neutral-400">ID: #{item.id}</div>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-bold text-[#172B15]">
                              {item.price != null && !isNaN(Number(item.price))
                                ? `₹${Number(item.price).toLocaleString("en-IN")}`
                                : "—"}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.is_active ? "bg-[#8CC63F]/20 text-[#2D5A1E]" : "bg-neutral-100 text-neutral-500"
                            }`}>
                              {item.is_active ? "Active" : "Draft"}
                            </span>
                          </td>

                          <td className="py-4 px-3 text-right">
                            <Link 
                              href={`/admin/products/${item.public_id}`}
                              className="px-3 py-1.5 rounded-lg bg-[#2D5A1E]/10 text-[#2D5A1E] font-bold hover:bg-[#2D5A1E] hover:text-white transition-all text-[11px]"
                            >
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      ))}

                      {products.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-neutral-400 text-xs">
                            No products found in backend database. Use "New SKU" to add items.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column Box */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Telemetry Status Card */}
              <div className="bg-[#172B15] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">Connection Telemetry</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8CC63F] animate-pulse" />
                  </div>

                  <h4 className="text-lg font-light tracking-tight">FastAPI Tunnel Synced</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    Real-time catalog, customer CRM, cold-chain fulfillment, and voucher engines are active.
                  </p>

                  <div className="pt-2">
                    <Link
                      href="/admin/products/create"
                      className="w-full py-3 rounded-xl bg-[#8CC63F] text-[#172B15] text-xs font-bold uppercase tracking-wider hover:bg-[#7AB82A] transition-all flex items-center justify-center space-x-2 shadow-md"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Register New Product</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D5A1E]">Administrative Hub</h4>
                <div className="space-y-2">
                  <Link
                    href="/admin/orders"
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F2F8ED] hover:bg-[#E8F3DF] transition-all text-xs font-semibold text-[#172B15]"
                  >
                    <span className="flex items-center space-x-2">
                      <ShoppingBag className="w-4 h-4 text-[#639E1F]" />
                      <span>Order Fulfillment Desk</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>

                  <Link
                    href="/admin/customers"
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-all text-xs font-semibold text-[#172B15]"
                  >
                    <span className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#2D5A1E]" />
                      <span>Customer Directory & CRM</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>

                  <Link
                    href="/admin/coupons"
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-all text-xs font-semibold text-[#172B15]"
                  >
                    <span className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-neutral-600" />
                      <span>Coupons & Campaign Rules</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>

                  <Link
                    href="/admin/access-control"
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-all text-xs font-semibold text-[#172B15]"
                  >
                    <span className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-[#2D5A1E]" />
                      <span>RBAC Governance Roles</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}