"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
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
  Leaf,
  ArrowRight,
  Loader2
} from "lucide-react";
import LuxuryNavbar from "@/app/components/Navbar";
import LuxuryFooter from "@/app/components/LuxuryFooter";
import { 
  getProductByPublicId, 
  getProducts, 
  Product, 
  ProductImage 
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
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("/prod1.png");
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"overview" | "science" | "usage" | "compliance">("overview");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isExpressCheckingOut, setIsExpressCheckingOut] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<boolean>(false);

  // 1. Data Ingestion: Resolve product by UUID public_id or fallback slug matching
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
          const listRes = await getProducts(1, 100);
          const found = listRes.items?.find(
            (p) => p.slug === slugParam || p.public_id === slugParam
          );
          if (found) {
            targetProduct = await getProductByPublicId(found.public_id).catch(() => found);
          }
        }

        if (!isMounted) return;

        if (!targetProduct) {
          throw new Error("The requested product formulation could not be located in the catalog.");
        }

        setProduct(targetProduct);

        const imgs = targetProduct.images || [];
        const sortedImages = [...imgs].sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return (a.display_order || 0) - (b.display_order || 0);
        });

        setImages(sortedImages);

        const primaryImgUrl = 
          sortedImages.find((img) => img.is_primary)?.image_url || 
          sortedImages[0]?.image_url || 
          "/prod1.png";
          
        setSelectedImage(primaryImgUrl);

      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load product detail:", err);
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

  // 2. Commercial Pricing & Discounts
  const numericPrice = product?.price != null ? Number(product.price) : 0;
  const numericMrp = product?.mrp != null ? Number(product.mrp) : 0;
  const hasDiscount = numericMrp > numericPrice && numericMrp > 0;
  const discountPercent = hasDiscount 
    ? Math.round(((numericMrp - numericPrice) / numericMrp) * 100) 
    : 0;

  // 3. Share link handler
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // 4. E-Commerce Cart Connection
 const handleAddToCart = async () => {
  if (!product) return;
  setIsAdding(true);
  try {
    // Pass only product.public_id and quantity
    await addItem(product.public_id, quantity);
    setActionSuccess(true);
    setTimeout(() => setActionSuccess(false), 2500);
  } catch (err) {
    console.error("Cart dispatch failed:", err);
  } finally {
    setIsAdding(false);
  }
};

  // 5. Direct Express Checkout Flow
const handleDirectCheckout = async () => {
  if (!product) return;
  setIsExpressCheckingOut(true);
  try {
    // Pass only product.public_id and quantity
    await addItem(product.public_id, quantity);
    if (isAuthenticated) {
      router.push("/checkout");
    } else {
      router.push("/shop/auth/login?redirect=/checkout");
    }
  } catch (err) {
    console.error("Express checkout failed:", err);
    setIsExpressCheckingOut(false);
  }
};

  // 6. WhatsApp Direct Concierge Order
  const handleWhatsAppInquiry = () => {
    if (!product) return;
    const phone = "919451444406";
    const message = encodeURIComponent(
      `Hello EnergyMax Concierge, I would like to inquire/order:\n\n*Product:* ${product.name}\n*SKU / Slug:* ${product.slug}\n*Price:* ₹${numericPrice.toLocaleString("en-IN")}\n*Quantity:* ${quantity} unit(s)\n*Total Value:* ₹${(numericPrice * quantity).toLocaleString("en-IN")}\n\nPlease confirm availability and dispatch procedures.`
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
            Synthesizing Clinical Profile & Media...
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
            <h3 className="text-base font-semibold text-[#172B15]">Product Unavailable</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {error || "The formulation you are attempting to inspect does not exist or has been archived."}
            </p>
            <Link
              href="/shop"
              className="inline-flex px-6 py-3 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all"
            >
              Return to Collection
            </Link>
          </div>
        </div>
        <LuxuryFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] selection:bg-[#8CC63F]/30 font-sans">
      <LuxuryNavbar />

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 pb-4">
        <div className="flex items-center space-x-2 text-xs text-neutral-400 font-medium">
          <Link href="/" className="hover:text-[#2D5A1E] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-[#2D5A1E] transition-colors">Collection</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#172B15] font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Interactive Multi-Angle Gallery */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary Hero Showcase Stage */}
            <div className="relative aspect-square rounded-3xl bg-white border border-[#2D5A1E]/15 overflow-hidden shadow-sm flex items-center justify-center p-8 sm:p-12 group">
              
              {/* Badges Overlay */}
              <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                <span className="px-3 py-1 rounded-full bg-white/95 border border-[#2D5A1E]/15 text-[#2D5A1E] text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-[#639E1F]" />
                  <span>{product.brand_name || "EnergyMax Masterseries"}</span>
                </span>

                {product.is_featured && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Featured Masterpiece</span>
                  </span>
                )}
              </div>

              {/* Lightbox Trigger Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/90 border border-[#2D5A1E]/15 text-[#172B15] flex items-center justify-center shadow-sm hover:bg-[#2D5A1E] hover:text-white transition-all cursor-pointer"
                title="Expand Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Central Image Canvas */}
              <div className="relative w-full h-full cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Zoom Instruction Hint */}
              <div className="absolute bottom-4 z-10 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest pointer-events-none">
                Click photo to expand high-resolution viewer
              </div>
            </div>

            {/* Thumbnail Multi-Angle Selector */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3 sm:gap-4">
                {images.map((img, idx) => {
                  const isSelected = selectedImage === img.image_url;
                  return (
                    <button
                      type="button"
                      key={img.public_id || idx}
                      onClick={() => setSelectedImage(img.image_url)}
                      className={`relative aspect-square rounded-2xl bg-white border-2 overflow-hidden p-2 transition-all shadow-sm cursor-pointer ${
                        isSelected 
                          ? "border-[#8CC63F] ring-2 ring-[#8CC63F]/30 scale-[1.03]" 
                          : "border-neutral-200 hover:border-[#2D5A1E]/40"
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={img.alt_text || `Angle ${idx + 1}`}
                        fill
                        sizes="120px"
                        className="object-contain p-1"
                      />
                      {img.is_primary && (
                        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#8CC63F] ring-2 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Scientific Trust Accreditation Footnote */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 flex items-center space-x-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#172B15]">100% Certified</h4>
                  <p className="text-[10px] text-neutral-500">AYUSH & GMP Compliant</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 flex items-center space-x-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#172B15]">Acid-Resistant</h4>
                  <p className="text-[10px] text-neutral-500">Live Microflora Survival</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 flex items-center space-x-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#172B15]">Temperature Sealed</h4>
                  <p className="text-[10px] text-neutral-500">Protected Bio-Transport</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Acquisition Funnel & Commercial Telemetry */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Header & Typography */}
            <div className="space-y-3 border-b border-[#2D5A1E]/15 pb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F] block">
                {product.brand_name || "EnergyMax Formulations"}
              </span>

              <h1 className="text-2xl sm:text-4xl font-light text-[#172B15] tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.short_description && (
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Commercial Pricing Presentation */}
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A1E]/15 shadow-sm space-y-4">
              <div className="flex items-baseline justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                    Investment Value
                  </span>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-serif text-[#172B15] font-normal">
                      ₹{numericPrice.toLocaleString("en-IN")}
                    </span>

                    {hasDiscount && (
                      <>
                        <span className="text-sm text-neutral-400 line-through font-mono">
                          ₹{numericMrp.toLocaleString("en-IN")}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#8CC63F]/20 text-[#2D5A1E] text-[10px] font-bold uppercase">
                          Save {discountPercent}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock & Ready</span>
                  </span>
                </div>
              </div>

              {/* Quantity Selector & Quick Actions */}
              <div className="pt-4 border-t border-neutral-100 flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-2xl p-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isAdding || isExpressCheckingOut}
                    className="w-8 h-8 rounded-xl bg-white text-[#172B15] flex items-center justify-center hover:bg-neutral-100 transition-all shadow-sm cursor-pointer disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#172B15]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={isAdding || isExpressCheckingOut}
                    className="w-8 h-8 rounded-xl bg-white text-[#172B15] flex items-center justify-center hover:bg-neutral-100 transition-all shadow-sm cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Wishlist & Share buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-3 rounded-2xl border transition-all shadow-sm cursor-pointer ${
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
                    onClick={handleShare}
                    className="p-3 rounded-2xl bg-white border border-[#2D5A1E]/15 text-neutral-600 hover:border-[#639E1F] transition-all shadow-sm cursor-pointer"
                    title="Copy Share Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Direct Acquisition & Checkout CTA Buttons */}
              <div className="space-y-3 pt-2">
                {/* Add to Bag (Opens Drawer) */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding || isExpressCheckingOut || cartLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#234717] transition-all shadow-xl shadow-[#2D5A1E]/20 flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-60"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding to Wellness Bag...</span>
                    </>
                  ) : actionSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag • ₹{(numericPrice * quantity).toLocaleString("en-IN")}</span>
                    </>
                  )}
                </button>

                {/* Instant Checkout Forwarding */}
                <button
                  type="button"
                  onClick={handleDirectCheckout}
                  disabled={isAdding || isExpressCheckingOut || cartLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isExpressCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Securing Allocation...</span>
                    </>
                  ) : (
                    <>
                      <span>Express Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Clinical Concierge Inquiry */}
                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="w-full py-3 px-6 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Consult Clinical Concierge</span>
                </button>
              </div>

            </div>

            {/* Micro-Telemetry Specifications */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Formulation Type</span>
                <span className="font-semibold text-[#172B15]">Active Multi-Strain Probiotic</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#2D5A1E]/10 space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Potency Count</span>
                <span className="font-semibold text-[#172B15]">Clinically Verified CFU</span>
              </div>
            </div>

          </div>

        </div>

        {/* Detailed Informational Tabs Section */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Tab Navigation */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-3 border-b border-neutral-200/80 scrollbar-none">
            {[
              { id: "overview", label: "Scientific Overview" },
              { id: "science", label: "Strain Architecture" },
              { id: "usage", label: "Recommended Protocol" },
              { id: "compliance", label: "Accreditation & Quality" },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#172B15] text-white shadow-md"
                    : "bg-[#FAFAF7] text-neutral-600 hover:text-[#172B15]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-[#172B15]">Clinical Summary</h3>
                <p className="whitespace-pre-line text-neutral-600 leading-relaxed">
                  {product.description || "Formulated with rigorous clinical precision, this advanced formulation delivers a resilient bacterial matrix designed to bypass gastric acidity and nourish your microflora ecosystem from within."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-200/80 space-y-1">
                    <span className="text-xs font-bold text-[#2D5A1E] block">Targeted Bio-Delivery</span>
                    <p className="text-xs text-neutral-600">Engineered with specialized enteric encapsulation to safeguard fragile live cultures through stomach bile.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-200/80 space-y-1">
                    <span className="text-xs font-bold text-[#2D5A1E] block">Microbiome Harmonization</span>
                    <p className="text-xs text-neutral-600">Supplements beneficial lactic and bifido strains to assist digestive equilibrium and systemic immunity.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "science" && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-[#172B15]">Strain Durability & CFU Purity</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Every batch of {product.name} undergoes independent high-performance liquid chromatography (HPLC) and microbial counts to confirm viability until expiry.
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
                    <span>Thermal-stable packaging designed for Indian ambient shelf life</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "usage" && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-[#172B15]">Daily Intake Protocol</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Consume 1 serving daily with room-temperature water, ideally 20 minutes before your morning meal. Avoid consumption with boiling hot liquids to protect live microbial cultures.
                </p>
                <div className="p-4 rounded-2xl bg-[#F2F8ED] border border-[#2D5A1E]/15 text-xs text-[#2D5A1E] font-medium">
                  <strong>Physician Consultation:</strong> If you are pregnant, nursing, or undergoing clinical immunosuppressive protocols, consult your certified healthcare practitioner prior to commencement.
                </div>
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-[#172B15]">Accreditation & Batch Traceability</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Manufactured under ISO 22000, WHO-GMP, and FSSAI certified production facilities. Every batch includes a Certificate of Analysis (CoA) verified for heavy metal absence and bacterial purity.
                </p>
                <div className="pt-2 text-neutral-500 text-xs font-mono">
                  Catalog Public Identifier: {product.public_id}
                </div>
              </div>
            )}
          </div>

        </div>

      </section>

      {/* Fullscreen Interactive Lightbox Modal */}
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
                title="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative w-full h-full p-4">
                <Image
                  src={selectedImage}
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