"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Star, 
  CheckCircle, 
  Layers, 
  ExternalLink, 
  Loader2, 
  Globe,
  AlertTriangle,
  FileText,
  Clock,
  Copy,
  Check,
  IndianRupee,
  TrendingUp,
  Percent
} from "lucide-react";
import { 
  getProductByPublicId, 
  getProducts,
  deleteProduct, 
  getProductImages, 
  Product, 
  ProductImage 
} from "@/lib/services/productService";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const publicId = params?.public_id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProductDetails() {
      if (!publicId) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch product record and complete inventory list for ID fallback matching
        const [productData, catalogListRes] = await Promise.all([
          getProductByPublicId(publicId),
          getProducts(1, 100).catch(() => ({ items: [], total: 0, page: 1, page_size: 100 }))
        ]);
        
        if (!isMounted) return;
        setProduct(productData);

        // Extract integer primary key across all schema representations
        const matchedFromList = (catalogListRes.items || []).find(
          (p: any) => p.public_id === publicId
        );

        const numericId = 
          productData.id ?? 
          (productData as any).pk ?? 
          (productData as any).product_id ??
          matchedFromList?.id ??
          (matchedFromList as any)?.pk;

        // 2. Fetch associated product images using the resolved numeric product ID
        let productImgs: ProductImage[] = productData.images || [];

        if (productImgs.length === 0 && numericId) {
          try {
            productImgs = await getProductImages(Number(numericId));
          } catch {
            productImgs = [];
          }
        }

        if (isMounted) {
          setImages(productImgs);

          // 3. Set default preview image (primary image first)
          const primaryImg = productImgs.find((img) => img.is_primary)?.image_url || productImgs[0]?.image_url;
          setSelectedImage(primaryImg || null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load product details:", err);
          setError("Unable to locate this product SKU in the catalog backend.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProductDetails();

    return () => {
      isMounted = false;
    };
  }, [publicId]);

  const handleDelete = async () => {
    if (!product || !confirm(`Permanently delete "${product.name}" from the catalog?`)) return;

    try {
      setDeleting(true);
      await deleteProduct(product.public_id);
      router.push("/admin/products");
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Error deleting product.");
      setDeleting(false);
    }
  };

  const copyPublicId = () => {
    if (!product) return;
    navigator.clipboard.writeText(product.public_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 space-y-4">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Loading catalog telemetry & assets...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-4">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#172B15]">Product Not Found</h3>
          <p className="text-xs text-neutral-600">{error || "This item does not exist or has been removed."}</p>
          <Link
            href="/admin/products"
            className="inline-flex px-6 py-3 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all"
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  // Commercial Metrics Calculations
  const numericPrice = product.price != null ? Number(product.price) : 0;
  const numericMrp = product.mrp != null ? Number(product.mrp) : 0;
  const numericCost = product.cost_price != null ? Number(product.cost_price) : 0;
  
  const discountPercent = numericMrp > numericPrice && numericMrp > 0
    ? Math.round(((numericMrp - numericPrice) / numericMrp) * 100)
    : 0;

  const grossMargin = numericPrice > numericCost && numericPrice > 0 && numericCost > 0
    ? Math.round(((numericPrice - numericCost) / numericPrice) * 100)
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link href="/admin/products" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Inventory</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F]">Product Inspection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#172B15] tracking-tight">
            {product.name}
          </h1>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link
            href={`/shop/${product.slug || product.public_id}`}
            target="_blank"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live</span>
          </Link>

          <Link
            href={`/admin/products/edit/${product.public_id}`}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-1.5 shadow-md"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit SKU</span>
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
            title="Delete Product"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Core Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Media Gallery Showcase */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2D5A1E] flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Asset Gallery ({images.length})</span>
            </span>
            {images.length > 0 && (
              <span className="text-[10px] text-neutral-400 font-mono">Cloudinary CDN</span>
            )}
          </div>

          {/* Main Selected Image Showcase */}
          <div className="relative aspect-square rounded-2xl bg-[#FAFAF7] border border-neutral-200 overflow-hidden flex items-center justify-center p-6 group">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="text-center text-neutral-400 space-y-2">
                <Layers className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">No media assets connected</p>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 pt-2">
              {images.map((img, idx) => (
                <button
                  key={img.public_id || idx}
                  onClick={() => img.image_url && setSelectedImage(img.image_url)}
                  className={`relative aspect-square rounded-xl border-2 overflow-hidden p-1 bg-[#FAFAF7] transition-all ${
                    selectedImage === img.image_url
                      ? "border-[#8CC63F] shadow-sm"
                      : "border-neutral-200 hover:border-[#2D5A1E]/40"
                  }`}
                >
                  {img.image_url && (
                    <img src={img.image_url} alt={img.alt_text || "Thumbnail"} className="w-full h-full object-contain" />
                  )}
                  {img.is_primary && (
                    <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#8CC63F]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Parameters, Status & Commercials */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick Metrics & Commercial Badges */}
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Brand Portfolio</span>
                <h3 className="text-base font-semibold text-[#172B15]">{product.brand_name || "EnergyMax Global"}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  product.is_active 
                    ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/30" 
                    : "bg-neutral-100 text-neutral-500"
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  <span>{product.is_active ? "Active on Store" : "Draft Status"}</span>
                </span>

                {product.is_featured && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Featured SKU</span>
                  </span>
                )}
              </div>
            </div>

            {/* Commercial Pricing Valuation Card */}
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D5A1E] flex items-center space-x-1">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Commercial Valuation</span>
              </span>

              <div className="grid grid-cols-3 gap-4 pt-1">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Selling Price</span>
                  <span className="text-base sm:text-lg font-bold text-[#172B15]">
                    {numericPrice ? `₹${numericPrice.toLocaleString("en-IN")}` : "₹0"}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">MRP</span>
                  <span className="text-sm font-semibold text-neutral-500">
                    {numericMrp ? `₹${numericMrp.toLocaleString("en-IN")}` : "—"}
                  </span>
                  {discountPercent > 0 && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Cost Price</span>
                  <span className="text-sm font-semibold text-neutral-500">
                    {numericCost ? `₹${numericCost.toLocaleString("en-IN")}` : "—"}
                  </span>
                  {grossMargin > 0 && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-[#8CC63F]/20 text-[#2D5A1E] text-[9px] font-bold">
                      {grossMargin}% Margin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Spec Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Numeric ID</span>
                <span className="font-mono font-bold text-[#172B15]">#{product.id ?? "N/A"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Subcategory ID</span>
                <span className="font-mono font-bold text-[#172B15]">#{product.subcategory_id}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-neutral-100 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Display Order</span>
                <span className="font-mono font-bold text-[#172B15]">Rank: {product.display_order}</span>
              </div>
            </div>

            {/* Public ID Token Box */}
            <div className="p-3.5 rounded-2xl bg-[#F2F8ED] border border-[#2D5A1E]/15 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-[#639E1F] block">FastAPI Identifier (Public ID)</span>
                <code className="text-xs font-mono text-[#172B15]">{product.public_id}</code>
              </div>
              <button
                onClick={copyPublicId}
                className="p-2 rounded-xl bg-white hover:bg-neutral-50 text-[#2D5A1E] transition-all shadow-sm"
                title="Copy Public ID"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Editorial Content */}
          <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-[#2D5A1E] pb-2 border-b border-neutral-100">
              <FileText className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Editorial & Content Breakdown</h3>
            </div>

            {product.short_description && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Short Summary</span>
                <p className="text-xs text-neutral-700 leading-relaxed italic bg-[#FAFAF7] p-3 rounded-2xl border border-neutral-100">
                  "{product.short_description}"
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Full Description</span>
              <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                {product.description || "No full description provided for this product."}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Lower Section: Search Engine Preview & Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Google SERP Snippet Simulator */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center space-x-2 text-[#2D5A1E]">
              <Globe className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Search Engine Snippet Simulation</h3>
            </div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase">Google Index Preview</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-neutral-200 space-y-1 font-sans">
            <div className="flex items-center space-x-1.5 text-xs text-[#202124]">
              <span className="w-4 h-4 rounded-full bg-[#172B15] text-[#8CC63F] text-[9px] font-bold flex items-center justify-center">E</span>
              <span className="text-[11px] text-neutral-600 truncate">energymax.com › shop › {product.slug}</span>
            </div>
            <h4 className="text-base text-[#1a0dab] font-medium hover:underline cursor-pointer">
              {product.seo_title || `${product.name} | EnergyMax Wellness`}
            </h4>
            <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
              {product.seo_description || product.short_description || product.description || "Explore advanced probiotic formulations and clinical health solutions from EnergyMax."}
            </p>
          </div>
        </div>

        {/* Timestamp Telemetry */}
        <div className="lg:col-span-4 bg-[#172B15] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-[#8CC63F] pb-2 border-b border-[#2D5A1E]/50">
            <Clock className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em]">Audit Timestamps</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Created On</span>
              <span className="text-neutral-200 font-mono text-[11px]">
                {product.created_at ? new Date(product.created_at).toLocaleString("en-IN") : "Syncing..."}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Last Updated</span>
              <span className="text-neutral-200 font-mono text-[11px]">
                {product.updated_at ? new Date(product.updated_at).toLocaleString("en-IN") : "Syncing..."}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}