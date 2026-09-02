"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Package, 
  PlusCircle, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  Loader2, 
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ImageIcon,
  IndianRupee,
  ShieldCheck,
  Star
} from "lucide-react";
import { getProducts, getProductImages, Product } from "@/lib/services/productService";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [imagesMap, setImagesMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Derived Financial Metrics
  const totalProducts = products.length;
  
  const estimatedCatalogValue = products.reduce((acc, curr) => {
    const val = curr.price != null && !isNaN(Number(curr.price)) ? Number(curr.price) : 0;
    return acc + val;
  }, 0);

  const averagePrice = totalProducts > 0 
    ? Math.round(estimatedCatalogValue / totalProducts) 
    : 0;

  const featuredCount = products.filter((p) => p.is_featured).length;

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productRes = await getProducts(1, 50);
      const productList: Product[] = Array.isArray(productRes) 
        ? productRes 
        : productRes.items || [];
      
      setProducts(productList);

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
              // Ignore single thumbnail fetch error
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
    <div className="w-full space-y-8 pb-16">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F]">
            Control Center & Telemetry
          </span>
          <h1 className="text-2xl sm:text-4xl font-light text-[#172B15] tracking-tight">
            Dashboard <span className="font-serif italic text-[#639E1F]">Overview</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Data</span>
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
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Dashboard Data UI */}
      {!loading && !error && (
        <div className="space-y-8">
          
          {/* 4 Financial & Operational Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
            
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/15 flex items-center justify-center text-[#2D5A1E]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Active Inventory</span>
                <h3 className="text-3xl font-serif text-[#172B15] font-medium pt-1">{totalProducts} SKUs</h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Inventory Status</span>
                <Link href="/admin/products" className="text-[#2D5A1E] font-bold hover:underline flex items-center space-x-1">
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

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
                <span>Sum of Active SKUs</span>
                <span className="text-[#2D5A1E] font-semibold">Live DB</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/15 flex items-center justify-center text-[#2D5A1E]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Avg. Selling Price</span>
                <h3 className="text-2xl font-serif text-[#172B15] font-medium pt-1">
                  ₹{averagePrice.toLocaleString("en-IN")}
                </h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Unit Valuation</span>
                <span className="text-[#639E1F] font-semibold">Optimal</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Featured Formulations</span>
                <h3 className="text-3xl font-serif text-[#172B15] font-medium pt-1">{featuredCount}</h3>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Storefront Hero</span>
                <span className="text-amber-700 font-semibold">Promoted</span>
              </div>
            </div>

          </div>

          {/* Lower Section Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            
            {/* Recent Entries Table */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-light text-[#172B15]">Recent Catalog Entries</h3>
                  <p className="text-xs text-neutral-500">Latest active items synchronized from FastAPI endpoints.</p>
                </div>
                <Link
                  href="/admin/products"
                  className="text-xs font-bold uppercase tracking-wider text-[#2D5A1E] hover:underline flex items-center space-x-1"
                >
                  <span>View All</span>
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
                        
                        <td className="py-4 px-3 font-semibold text-[#172B15]">
                          <div className="line-clamp-1">{item.name}</div>
                          <div className="text-[10px] font-mono text-neutral-400">ID: #{item.id}</div>
                        </td>

                        <td className="py-4 px-3 whitespace-nowrap">
                          <span className="font-bold text-[#172B15]">
                            {item.price != null && !isNaN(Number(item.price))
                              ? `₹${Number(item.price).toLocaleString("en-IN")}`
                              : "—"}
                          </span>
                        </td>

                        <td className="py-4 px-3">
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
                    Database schemas, commercial pricing, and Cloudinary media pipelines are active.
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
                    href="/admin/products"
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F2F8ED] hover:bg-[#E8F3DF] transition-all text-xs font-semibold text-[#172B15]"
                  >
                    <span className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-[#639E1F]" />
                      <span>Inventory Catalog</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>

                  <Link
                    href="/admin/access-control"
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-all text-xs font-semibold text-[#172B15]"
                  >
                    <span className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-[#2D5A1E]" />
                      <span>RBAC Security Roles</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>

                  <Link
                    href="/shop"
                    target="_blank"
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-all text-xs font-semibold text-[#172B15]"
                  >
                    <span className="flex items-center space-x-2">
                      <ShoppingBag className="w-4 h-4 text-neutral-600" />
                      <span>Live Boutique Storefront</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-neutral-400" />
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