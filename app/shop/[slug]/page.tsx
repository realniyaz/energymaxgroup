// app/shop/[slug]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ShieldCheck, 
  Star, 
  Truck, 
  RefreshCw, 
  Heart, 
  Share2, 
  ShoppingBag, 
  MessageCircle, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  Maximize2, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Leaf,
  ArrowRight,
  Loader2,
  Copy,
  Activity,
  Zap,
  Layers,
  Ban
} from "lucide-react";
import LuxuryNavbar from "@/app/components/Navbar";
import LuxuryFooter from "@/app/components/LuxuryFooter";
import { 
  getProductByPublicId, 
  getProducts, 
  getProductVariants,
  Product, 
  ProductImage,
  ProductVariant
} from "@/lib/services/productService";
import { useCart } from "@/context/cart-context";
import { useCustomerAuth } from "@/context/customer-auth-context";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug as string;

  const { addItem, loading: cartLoading } = useCart();
  const { isAuthenticated } = useCustomerAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"overview" | "science" | "usage" | "compliance">("overview");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isExpressCheckingOut, setIsExpressCheckingOut] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<boolean>(false);

  // 1. Data Ingestion: Resolve Product & Product Variants
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!slugParam) return;
      try {
        setLoading(true);
        setError(null);

        let targetProduct: Product | null = null;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugParam);
        
        if (isUUID) {
          try {
            targetProduct = await getProductByPublicId(slugParam);
          } catch {
            targetProduct = null;
          }
        }

        if (!targetProduct) {
          const listRes = await getProducts(1, 100, undefined, true);
          const found = listRes.items?.find(
            (p) => p.slug === slugParam || p.public_id === slugParam
          );
          if (found) {
            targetProduct = await getProductByPublicId(found.public_id).catch(() => found);
          }
        }

        if (!isMounted) return;

        if (!targetProduct) {
          throw new Error("The requested formulation could not be located in our clinical catalog.");
        }

        setProduct(targetProduct);

        // Fetch variants for this product
        try {
          const fetchedVariants = await getProductVariants(targetProduct.public_id);
          if (isMounted) {
            setVariants(fetchedVariants);
            const activeOnly = fetchedVariants.filter((v) => v.is_active);
            setSelectedVariant(activeOnly[0] || fetchedVariants[0] || null);
          }
        } catch {
          if (isMounted) {
            setVariants([]);
            setSelectedVariant(null);
          }
        }

        const imgs = targetProduct.images || [];
        const sortedImages = [...imgs].sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return (a.display_order || 0) - (b.display_order || 0);
        });

        setImages(sortedImages);
        setSelectedImageIndex(0);

      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load product details.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slugParam]);

  // Determine Stock Status
  // If product has variants, check selected variant; if standalone product, check product.is_active
  const isAvailableInStock = useMemo(() => {
    if (!product || !product.is_active) return false;
    if (variants.length > 0) {
      return selectedVariant ? selectedVariant.is_active : false;
    }
    return true; // Self-variant product that is active
  }, [product, variants, selectedVariant]);

  // Pricing: Selected Variant price fallback to Product base price
  const currentPrice = useMemo(() => {
    if (selectedVariant?.price != null && Number(selectedVariant.price) > 0) {
      return Number(selectedVariant.price);
    }
    return product?.price != null ? Number(product.price) : 0;
  }, [selectedVariant, product]);

  const currentMrp = useMemo(() => {
    if (selectedVariant?.mrp != null && Number(selectedVariant.mrp) > 0) {
      return Number(selectedVariant.mrp);
    }
    return product?.mrp != null ? Number(product.mrp) : 0;
  }, [selectedVariant, product]);

  const hasDiscount = currentMrp > currentPrice && currentMrp > 0;
  const discountPercent = hasDiscount 
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) 
    : 0;

  const currentImageUrl = images[selectedImageIndex]?.image_url || "/prod1.png";

  const handleNextImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Add Item to Cart (Handles both Multi-Variant & Standalone Self-Variant items)
  const handleAddToCart = async () => {
    if (!product || !isAvailableInStock) return;

    // Use variant public_id if defined; otherwise fallback to product's own public_id
    const targetVariantId = selectedVariant?.public_id || product.public_id;

    setIsAdding(true);
    try {
      await addItem(
        product.public_id,
        targetVariantId,
        quantity,
        `${product.name} ${selectedVariant?.flavour ? `(${selectedVariant.flavour})` : ""}`,
        currentPrice
      );
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 2500);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Could not add item to bag.");
    } finally {
      setIsAdding(false);
    }
  };

  // Direct Buy Now / Express Checkout
  const handleBuyNow = async () => {
    if (!product || !isAvailableInStock) return;

    const targetVariantId = selectedVariant?.public_id || product.public_id;

    setIsExpressCheckingOut(true);
    try {
      await addItem(
        product.public_id,
        targetVariantId,
        quantity,
        `${product.name} ${selectedVariant?.flavour ? `(${selectedVariant.flavour})` : ""}`,
        currentPrice
      );
      if (isAuthenticated) {
        router.push("/checkout");
      } else {
        router.push("/shop/auth/login?redirect=/checkout");
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Could not proceed to checkout.");
      setIsExpressCheckingOut(false);
    }
  };

  const handleConsultSpecialist = () => {
    if (!product) return;
    const phone = "919315956745";
    const variantInfo = selectedVariant 
      ? `\n*Variant:* ${selectedVariant.sku} (${selectedVariant.flavour || "Standard"} - ${selectedVariant.pack_size || "Default"})` 
      : "";
    const message = encodeURIComponent(
      `Hello EnergyMax Clinical Support,\nI would like to consult regarding:\n\n*Product:* ${product.name}${variantInfo}\n*Price:* ₹${currentPrice.toLocaleString("en-IN")}\n*Planned Quantity:* ${quantity} unit(s)\n\nPlease share usage guidelines for this formulation.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-between">
        <LuxuryNavbar />
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <RefreshCw className="w-8 h-8 text-[#2D5A1E] animate-spin" />
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
            Connecting Formulation Data...
          </p>
        </div>
        <LuxuryFooter />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-between">
        <LuxuryNavbar />
        <div className="max-w-md mx-auto py-32 px-6 text-center space-y-4">
          <div className="p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-4">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="text-base font-semibold text-[#172B15]">Formulation Not Found</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {error || "The requested health formulation does not exist or has been temporarily archived."}
            </p>
            <Link
              href="/shop"
              className="inline-flex px-6 py-3 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all"
            >
              Return to Catalog
            </Link>
          </div>
        </div>
        <LuxuryFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] selection:bg-[#8CC63F]/30 font-sans pb-24 lg:pb-12">
      <LuxuryNavbar />

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-3">
        <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-neutral-400 font-medium">
          <Link href="/" className="hover:text-[#2D5A1E] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-[#2D5A1E] transition-colors">Catalog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#172B15] font-semibold truncate max-w-[160px] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 space-y-12 sm:space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Gallery Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="relative aspect-square rounded-3xl bg-white border border-[#2D5A1E]/15 overflow-hidden shadow-sm flex items-center justify-center p-6 sm:p-12 group">
              
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 sm:gap-2">
                <span className="px-3 py-1 rounded-full bg-white/95 border border-[#2D5A1E]/15 text-[#2D5A1E] text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1.5 backdrop-blur-md">
                  <Activity className="w-3 h-3 text-[#639E1F]" />
                  <span>{product.brand_name || "maXilin Series"}</span>
                </span>

                {product.is_featured && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Featured</span>
                  </span>
                )}
              </div>

              {/* Lightbox Trigger */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-[#2D5A1E]/15 text-[#172B15] flex items-center justify-center shadow-sm hover:bg-[#2D5A1E] hover:text-white transition-all cursor-pointer"
                title="Expand View"
              >
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Gallery Swipes */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous angle"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 border border-[#2D5A1E]/20 text-[#172B15] flex items-center justify-center shadow-md hover:bg-[#2D5A1E] hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next angle"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 border border-[#2D5A1E]/20 text-[#172B15] flex items-center justify-center shadow-md hover:bg-[#2D5A1E] hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </>
              )}

              {/* Image Preview Canvas */}
              <div 
                className="relative w-full h-full cursor-zoom-in" 
                onClick={() => setIsLightboxOpen(true)}
              >
                <Image
                  src={currentImageUrl}
                  alt={product.name}
                  fill
                  priority
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain p-2 sm:p-4 transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 z-10 px-3 py-1 rounded-full bg-white/90 border border-neutral-200 text-[10px] font-mono font-bold text-neutral-600 shadow-sm pointer-events-none">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 sm:gap-4">
                {images.map((img, idx) => {
                  const isSelected = selectedImageIndex === idx;
                  return (
                    <button
                      type="button"
                      key={img.public_id || idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-square rounded-2xl bg-white border-2 overflow-hidden p-1.5 transition-all shadow-sm cursor-pointer ${
                        isSelected 
                          ? "border-[#8CC63F] ring-2 ring-[#8CC63F]/30 scale-[1.02]" 
                          : "border-neutral-200 hover:border-[#2D5A1E]/40"
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={img.alt_text || `Angle ${idx + 1}`}
                        fill
                        sizes="100px"
                        className="object-contain p-1"
                      />
                      {img.is_primary && (
                        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#8CC63F] ring-2 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quality Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 sm:pt-2">
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-3 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] sm:text-xs font-bold text-[#172B15]">Quality Assured</h4>
                  <p className="text-[9px] sm:text-[10px] text-neutral-500 hidden sm:block">AYUSH & GMP Compliant</p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-3 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] sm:text-xs font-bold text-[#172B15]">Enteric Barrier</h4>
                  <p className="text-[9px] sm:text-[10px] text-neutral-500 hidden sm:block">Gastric Resilient</p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-3 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] sm:text-xs font-bold text-[#172B15]">Cold Chain</h4>
                  <p className="text-[9px] sm:text-[10px] text-neutral-500 hidden sm:block">Live CFU Protected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Selection Column */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div className="space-y-2 sm:space-y-3 border-b border-[#2D5A1E]/15 pb-4 sm:pb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
                {product.brand_name || "EnergyMax Formulations"}
              </span>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-light text-[#172B15] tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.short_description && (
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Pricing & Commercial Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-5">
              <div className="flex items-baseline justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Formulation Price
                  </span>
                  <div className="flex items-baseline space-x-2 sm:space-x-3">
                    <span className="text-2xl sm:text-3xl font-serif text-[#172B15] font-normal">
                      ₹{currentPrice > 0 ? currentPrice.toLocaleString("en-IN") : "0"}
                    </span>

                    {hasDiscount && (
                      <>
                        <span className="text-xs sm:text-sm text-neutral-400 line-through font-mono">
                          ₹{currentMrp.toLocaleString("en-IN")}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] text-[10px] font-bold uppercase">
                          Save {discountPercent}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stock Indicator Badge */}
                <div className="text-right">
                  {isAvailableInStock ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>In Stock</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-red-800 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                      <Ban className="w-3.5 h-3.5 text-red-600" />
                      <span>Out of Stock</span>
                    </span>
                  )}
                </div>
              </div>

              {/* VARIANT SELECTOR (Displayed if product has sub-variants) */}
              {variants.length > 0 && (
                <div className="pt-3 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A1E] flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Formulation Options ({variants.length})</span>
                    </span>
                    {selectedVariant && (
                      <span className="text-[10px] font-mono text-neutral-400">
                        SKU: {selectedVariant.sku}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {variants.map((v) => {
                      const isSelected = selectedVariant?.public_id === v.public_id;
                      return (
                        <button
                          type="button"
                          key={v.public_id}
                          onClick={() => setSelectedVariant(v)}
                          disabled={!v.is_active}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                            isSelected
                              ? "bg-[#F2F8ED] border-[#2D5A1E] shadow-sm ring-1 ring-[#2D5A1E]"
                              : v.is_active
                              ? "bg-white border-neutral-200 hover:border-[#2D5A1E]/40"
                              : "bg-neutral-50 border-neutral-200 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-[#172B15] block truncate">
                              {v.flavour || v.pack_size || v.sku}
                            </span>
                            {v.pack_size && v.flavour && (
                              <span className="text-[10px] text-neutral-500 block truncate">
                                {v.pack_size}
                              </span>
                            )}
                            <div className="flex items-center justify-between pt-1">
                              <span className="font-mono font-bold text-xs text-[#2D5A1E]">
                                ₹{Number(v.price).toLocaleString("en-IN")}
                              </span>
                              {!v.is_active && (
                                <span className="text-[9px] font-bold uppercase text-red-600">
                                  Sold Out
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#8CC63F]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Wishlist */}
              <div className="pt-3 border-t border-neutral-100 flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-2 bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl p-1 sm:p-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isAdding || isExpressCheckingOut || !isAvailableInStock}
                    className="w-8 h-8 rounded-xl bg-white text-[#172B15] flex items-center justify-center hover:bg-neutral-100 transition-all shadow-sm cursor-pointer disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 sm:w-10 text-center font-bold text-xs sm:text-sm text-[#172B15]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={isAdding || isExpressCheckingOut || !isAvailableInStock}
                    className="w-8 h-8 rounded-xl bg-white text-[#172B15] flex items-center justify-center hover:bg-neutral-100 transition-all shadow-sm cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all shadow-sm cursor-pointer ${
                      isWishlisted 
                        ? "bg-red-50 border-red-200 text-red-500" 
                        : "bg-white border-[#2D5A1E]/15 text-neutral-600 hover:border-[#639E1F]"
                    }`}
                    title="Add to wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#2D5A1E]/15 text-neutral-600 hover:border-[#639E1F] transition-all shadow-sm cursor-pointer"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding || isExpressCheckingOut || cartLoading || !isAvailableInStock}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-lg shadow-[#2D5A1E]/15 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding to Bag...</span>
                    </>
                  ) : actionSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" />
                      <span>Added to Bag</span>
                    </>
                  ) : !isAvailableInStock ? (
                    <>
                      <Ban className="w-4 h-4" />
                      <span>Currently Out of Stock</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart • ₹{(currentPrice * quantity).toLocaleString("en-IN")}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isAdding || isExpressCheckingOut || cartLoading || !isAvailableInStock}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExpressCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Proceeding to Checkout...</span>
                    </>
                  ) : !isAvailableInStock ? (
                    <span>Unavailable</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-[#8CC63F]" />
                      <span>Buy Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleConsultSpecialist}
                  className="w-full py-3 px-6 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Consult Clinical Specialist</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Formulation Type</span>
                <span className="font-semibold text-[#172B15]">Active Multi-Strain Probiotic</span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Potency Count</span>
                <span className="font-semibold text-[#172B15]">Clinically Verified CFU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Tabs Section */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-5 sm:p-10 shadow-sm space-y-6 sm:space-y-8">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-3 border-b border-neutral-200/80 scrollbar-none">
            {[
              { id: "overview", label: "Scientific Overview" },
              { id: "science", label: "Strain Architecture" },
              { id: "usage", label: "Dosage Protocol" },
              { id: "compliance", label: "Quality & Testing" },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#172B15] text-white shadow-md"
                    : "bg-[#FAFAF7] text-neutral-600 hover:text-[#172B15]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-[#172B15]">Clinical Summary</h3>
                <p className="whitespace-pre-line text-neutral-600 leading-relaxed">
                  {product.description || "Formulated with clinical precision, this multi-strain probiotic formulation delivers viable beneficial cultures engineered to bypass gastric acidity and support intestinal microflora balance."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-200/80 space-y-1">
                    <span className="text-xs font-bold text-[#2D5A1E] block">Targeted Bio-Delivery</span>
                    <p className="text-xs text-neutral-600">Enteric-protected microflora matrix ensures live cultures navigate past harsh gastric acids intact.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-200/80 space-y-1">
                    <span className="text-xs font-bold text-[#2D5A1E] block">Microbiome Balance</span>
                    <p className="text-xs text-neutral-600">Replenishes beneficial strains to optimize natural digestive harmony and cellular resilience.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "science" && (
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-[#172B15]">Strain Durability & CFU Purity</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Every batch undergoes independent high-performance liquid chromatography (HPLC) and microbial counts to confirm viability until expiry.
                </p>
                <ul className="space-y-2 pt-2 text-xs">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#639E1F]" />
                    <span>Non-GMO, hypoallergenic certified bacterial substrates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#639E1F]" />
                    <span>Symbiotic prebiotic pairing for accelerated colony formation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#639E1F]" />
                    <span>Thermal-stable packaging designed for ambient shelf life</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "usage" && (
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-[#172B15]">Recommended Intake Protocol</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Consume 1 serving daily with room-temperature water, ideally 20 minutes before your morning meal. Avoid consumption with boiling hot liquids to protect live microbial cultures.
                </p>
                <div className="p-4 rounded-2xl bg-[#F2F8ED] border border-[#2D5A1E]/15 text-xs text-[#2D5A1E] font-medium">
                  <strong>Healthcare Advisory:</strong> If you are pregnant, nursing, or undergoing clinical treatment, consult your certified healthcare practitioner prior to commencement.
                </div>
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-[#172B15]">Accreditation & Batch Traceability</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Manufactured under ISO 22000, WHO-GMP, and FSSAI certified production facilities. Every batch includes a Certificate of Analysis (CoA) verified for purity and CFU integrity.
                </p>
                <div className="pt-2 text-neutral-500 text-xs font-mono">
                  Catalog Public Identifier: {product.public_id}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Bottom Sticky Bar for Direct Checkout */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#2D5A1E]/20 p-3 sm:p-4 shadow-2xl flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-lg font-bold text-[#172B15]">
              ₹{(currentPrice * quantity).toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-neutral-400 line-through">
                ₹{(currentMrp * quantity).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || isExpressCheckingOut || cartLoading || !isAvailableInStock}
            className="px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/30 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Add to Cart"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isAdding || isExpressCheckingOut || cartLoading || !isAvailableInStock}
            className="px-5 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isExpressCheckingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : !isAvailableInStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span>Buy Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2D5A1E]/20 text-[#172B15] z-10 space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] text-[10px] font-bold uppercase tracking-wider">
                    <Share2 className="w-3 h-3 text-[#639E1F]" />
                    <span>Share Formulation</span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-[#172B15]">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Copy the link below or share directly with clients or practitioners.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-600 font-mono truncate select-all">
                  {typeof window !== "undefined" ? window.location.href : `/shop/${product.slug}`}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center space-x-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#8CC63F]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-400">Direct Share:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = typeof window !== "undefined" ? window.location.href : "";
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${product.name}:${url}`)}`, "_blank");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const url = typeof window !== "undefined" ? window.location.href : "";
                      window.open(`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(`Take a look at this formulation:\n${url}`)}`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Email
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center"
            >
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              <div className="relative w-full h-full p-4">
                <Image
                  src={currentImageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LuxuryFooter />
    </div>
  );
}