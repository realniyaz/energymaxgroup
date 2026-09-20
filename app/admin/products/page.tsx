"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Star, 
  Loader2, 
  AlertTriangle, 
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Eye,
  ImageIcon
} from "lucide-react";
import { 
  getProducts, 
  updateProduct,
  deleteProduct, 
  Product 
} from "@/lib/services/productService";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchInventory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts(page, pageSize);
      const items = res.items || [];
      
      setProducts(items);
      setTotalItems(res.total ?? items.length);
      setCurrentPage(page);
    } catch (err: any) {
      console.error("Inventory fetch error:", err);
      setError(err.message || "Failed to retrieve inventory from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(currentPage);
  }, [currentPage]);

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = !product.is_active;
    
    setProducts((prev) =>
      prev.map((p) => (p.public_id === product.public_id ? { ...p, is_active: nextStatus } : p))
    );
    setTogglingId(product.public_id);

    try {
      await updateProduct(product.public_id, { is_active: nextStatus });
    } catch (err) {
      setProducts((prev) =>
        prev.map((p) => (p.public_id === product.public_id ? { ...p, is_active: !nextStatus } : p))
      );
      alert("Status update failed on server.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeletingId(publicId);
      await deleteProduct(publicId);
      setProducts((prev) => prev.filter((p) => p.public_id !== publicId));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const brands = ["All", ...Array.from(new Set(products.map((p) => p.brand_name).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(query) ||
      (p.brand_name && p.brand_name.toLowerCase().includes(query)) ||
      p.slug.toLowerCase().includes(query);
    
    const matchesBrand = selectedBrand === "All" || p.brand_name === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="w-full space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link 
              href="/admin/dashboard" 
              className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F]">Catalog Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            Product <span className="font-serif italic text-[#639E1F]">Inventory</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => fetchInventory(currentPage)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <Link
            href="/admin/products/create"
            className="px-5 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 shadow-sm shadow-[#2D5A1E]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search SKUs, brands, or names..."
            value={searchQuery}
            onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F]"
          />
        </div>

        {/* Brand Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 shrink-0 mr-1">Brand:</span>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand as string)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all shrink-0 ${
                selectedBrand === brand
                  ? "bg-[#2D5A1E] text-white shadow-sm"
                  : "bg-[#FAFAF7] text-neutral-600 border border-neutral-200 hover:border-[#639E1F]"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && !loading && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-900">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => fetchInventory(currentPage)} 
            className="font-bold underline uppercase tracking-wider hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#FAFAF7] border-b border-neutral-200/80 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <th className="py-3.5 px-6">Product & Asset</th>
                <th className="py-3.5 px-6">Brand / Slug</th>
                <th className="py-3.5 px-6">Pricing</th>
                <th className="py-3.5 px-6 text-center">Subcat</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
              
              {/* Skeletons */}
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-neutral-200 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 bg-neutral-200 rounded w-3/4" />
                      <div className="h-2.5 bg-neutral-100 rounded w-1/4" />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-3 bg-neutral-200 rounded w-16 mb-1.5" />
                    <div className="h-2.5 bg-neutral-100 rounded w-24" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 bg-neutral-200 rounded w-16" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-4 bg-neutral-200 rounded w-12 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-5 bg-neutral-200 rounded-full w-16 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="h-8 bg-neutral-200 rounded-xl w-20 ml-auto" />
                  </td>
                </tr>
              ))}

              {/* Rows */}
              {!loading && filteredProducts.map((product) => {
                const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
                const thumbnail = primaryImage?.image_url;

                return (
                  <tr key={product.public_id} className="hover:bg-[#F2F8ED]/30 transition-colors">
                    
                    <td className="py-4 px-6 align-middle max-w-sm">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#FAFAF7] border border-neutral-200 shrink-0 overflow-hidden flex items-center justify-center relative">
                          {thumbnail ? (
                            <Image 
                              src={thumbnail} 
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                              loading="lazy"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-neutral-300" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <Link
                            href={`/admin/products/${product.public_id}`}
                            className="font-semibold text-[#172B15] text-sm leading-snug hover:text-[#2D5A1E] transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <div className="text-neutral-400 font-mono text-[10px]">
                            ID: #{product.id} {product.images?.length > 0 && `• ${product.images.length} photo(s)`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 align-middle space-y-0.5">
                      <div className="font-bold text-[#2D5A1E] uppercase text-[10px] tracking-wider">
                        {product.brand_name || "EnergyMax"}
                      </div>
                      <div className="text-neutral-400 font-mono text-[10px]">/{product.slug}</div>
                    </td>

                    <td className="py-4 px-6 align-middle whitespace-nowrap">
                      <div className="font-bold text-[#172B15] text-sm">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </div>
                      {product.mrp && Number(product.mrp) > Number(product.price) && (
                        <div className="text-neutral-400 text-[10px] line-through font-mono">
                          MRP: ₹{Number(product.mrp).toLocaleString("en-IN")}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 align-middle text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-neutral-100 font-mono text-[10px] text-neutral-600 font-semibold border border-neutral-200">
                        #{product.subcategory_id}
                      </span>
                    </td>

                    <td className="py-4 px-6 align-middle text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          disabled={togglingId === product.public_id}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            product.is_active 
                              ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40 hover:bg-[#8CC63F]/30" 
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-200"
                          }`}
                        >
                          {togglingId === product.public_id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          <span>{product.is_active ? "Active" : "Draft"}</span>
                        </button>

                        {product.is_featured && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase tracking-wider">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 align-middle text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        href={`/admin/products/${product.public_id}`}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-[#2D5A1E] hover:text-white transition-all shadow-sm"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/admin/products/edit/${product.public_id}`}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-[#2D5A1E]/10 text-[#2D5A1E] hover:bg-[#234717] hover:text-white transition-all shadow-sm"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDelete(product.public_id)}
                        disabled={deletingId === product.public_id}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        title="Delete Product"
                      >
                        {deletingId === product.public_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                  </tr>
                );
              })}

              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400 text-xs">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <PackageCheck className="w-8 h-8 text-neutral-300" />
                      <p>No products found in the catalog.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 bg-[#FAFAF7] border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-500">
            Showing page <span className="font-bold text-[#172B15]">{currentPage}</span> of <span className="font-bold text-[#172B15]">{totalPages}</span> ({totalItems} total items)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-[#F2F8ED] transition-all disabled:opacity-40 flex items-center space-x-1 shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || loading}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-[#F2F8ED] transition-all disabled:opacity-40 flex items-center space-x-1 shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}