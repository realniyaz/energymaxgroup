// app/shop/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  PackageCheck,
  Star,
  Search,
  X,
  ShoppingBag,
  CheckCircle2,
  Activity
} from "lucide-react";
import LuxuryNavbar from "@/app/components/Navbar";
import LuxuryFooter from "@/app/components/LuxuryFooter";
import { 
  getProducts, 
  getCategories, 
  getSubcategoriesByCategory,
  Product, 
  Category, 
  Subcategory 
} from "@/lib/services/productService";
import { useCart } from "@/context/cart-context";

export default function ShopPage() {
  const { addItem, loading: cartLoading } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        setLoading(true);
        setError(null);

        const [productRes, categoryRes] = await Promise.all([
          getProducts(1, 100, undefined, true),
          getCategories(1, 50).catch(() => ({ items: [], total: 0, page: 1, page_size: 50 }))
        ]);

        if (!isMounted) return;

        const rawProducts: Product[] = Array.isArray(productRes) 
          ? productRes 
          : productRes.items || [];
        
        const activeList = rawProducts.filter((p) => p.is_active !== false);
        setProducts(activeList);

        const catList = categoryRes.items || [];
        setCategories(catList);

        const subResults = await Promise.allSettled(
          catList.map((c) => getSubcategoriesByCategory(c.public_id))
        );

        const accumulatedSubs: Subcategory[] = [];
        subResults.forEach((res) => {
          if (res.status === "fulfilled" && Array.isArray(res.value)) {
            accumulatedSubs.push(...res.value);
          }
        });

        if (isMounted) {
          setSubcategories(accumulatedSubs);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Storefront catalog synchronization error:", err);
          setError("Our formulations catalog is currently synchronizing. Please check back shortly.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleWishlist = (publicId: string) => {
    setWishlist((prev) => 
      prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId]
    );
  };

  const handleQuickAdd = async (e: React.MouseEvent, productPublicId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(productPublicId);
    try {
      await addItem(productPublicId, 1);
    } catch (err) {
      console.error("Cart addition failed:", err);
    } finally {
      setAddingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesBrand = item.brand_name?.toLowerCase().includes(q);
          const matchesDesc = item.short_description?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
          const matchesSlug = item.slug.toLowerCase().includes(q);
          if (!matchesName && !matchesBrand && !matchesDesc && !matchesSlug) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        if (sortBy === "price-desc") {
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        }
        if (sortBy === "newest") {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (a.display_order ?? 0) - (b.display_order ?? 0);
      });
  }, [products, searchQuery, sortBy]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />

      {/* Header Banner - Clinical & Health Formulation Focus */}
      <section className="relative py-16 sm:py-24 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md"
          >
            <Activity className="w-3.5 h-3.5 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8CC63F]">
              Clinical Probiotic Science
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight"
          >
            Nutraceutical <span className="font-serif italic text-[#8CC63F]">Formulations</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm text-neutral-300 font-normal max-w-xl mx-auto leading-relaxed"
          >
            Targeted live microbial cultures and synbiotic supplements engineered to restore microflora equilibrium, cellular defense, and systemic health.
          </motion.p>
        </div>
      </section>

      {/* Catalog & Products Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 space-y-8">
        
        {/* Search & Sorting Toolbar */}
        <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search formulations, strains, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] transition-all"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#172B15] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end space-x-6">
            <span className="text-[11px] font-semibold text-neutral-500 font-mono">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Formulation" : "Formulations"}
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-medium text-[#172B15] focus:outline-none focus:border-[#639E1F] cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Latest Release</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Retrieving Catalog...
            </p>
          </div>
        )}

        {/* Error Notice */}
        {error && !loading && (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 text-center space-y-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-[#2D5A1E] mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#172B15]">Catalog Notice</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-sm cursor-pointer"
            >
              Reload Catalog
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="space-y-14">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#2D5A1E]/15 p-8 shadow-sm space-y-3 max-w-md mx-auto">
                <PackageCheck className="w-10 h-10 text-neutral-300 mx-auto" />
                <h4 className="text-base font-semibold text-[#172B15]">No Formulations Found</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  We could not find any active product matches for your search.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-5 py-2 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-sm cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredProducts.slice(0, visibleCount).map((product, idx) => {
                    const primaryImg = 
                      product.images?.find((img) => img.is_primary) || 
                      product.images?.[0];
                    const productImage = primaryImg?.image_url || "/prod1.png";

                    const numericPrice = product.price != null ? Number(product.price) : 0;
                    const numericMrp = product.mrp != null ? Number(product.mrp) : 0;
                    const discountPercent = numericMrp > numericPrice && numericMrp > 0
                      ? Math.round(((numericMrp - numericPrice) / numericMrp) * 100)
                      : 0;

                    const isWishlisted = wishlist.includes(product.public_id);
                    const isItemAdding = addingId === product.public_id;

                    return (
                      <motion.div
                        key={product.public_id || idx}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.45, delay: (idx % 3) * 0.06 }}
                        className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#8CC63F]/50 transition-all duration-300 flex flex-col justify-between group"
                      >
                        {/* Image Frame */}
                        <Link 
                          href={`/shop/${product.slug || product.public_id}`}
                          className="relative h-64 sm:h-72 bg-[#FAFAF7] overflow-hidden p-6 flex items-center justify-center border-b border-neutral-100 block"
                        >
                          <Image
                            src={productImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-sm"
                          />

                          {/* Featured & Discount Badges */}
                          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                            {product.is_featured && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>Featured</span>
                              </span>
                            )}
                            {discountPercent > 0 && (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#2D5A1E] text-[10px] font-bold tracking-wider uppercase">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product.public_id);
                            }}
                            aria-label="Save formulation"
                            className={`absolute top-4 right-4 w-8 h-8 rounded-full border flex items-center justify-center shadow-sm transition-all z-10 cursor-pointer ${
                              isWishlisted 
                                ? "bg-red-50 border-red-200 text-red-500" 
                                : "bg-white/90 border-[#2D5A1E]/15 text-[#2D5A1E] hover:bg-[#2D5A1E] hover:text-white"
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} />
                          </button>
                        </Link>

                        {/* Product Details */}
                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#639E1F] block">
                              {product.brand_name || "maXilin Series"}
                            </span>
                            <Link href={`/shop/${product.slug || product.public_id}`}>
                              <h3 className="text-base sm:text-lg font-medium text-[#172B15] tracking-tight group-hover:text-[#2D5A1E] transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                              {product.short_description || product.description || "Microbial probiotic formulation engineered to support mucosal barrier health and microflora balance."}
                            </p>
                          </div>

                          {/* Price & Action Row */}
                          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 block">
                                Price
                              </span>
                              <div className="flex items-baseline space-x-1.5">
                                <span className="text-base sm:text-lg font-bold text-[#172B15]">
                                  {numericPrice > 0 ? `₹${numericPrice.toLocaleString("en-IN")}` : "₹2,499"}
                                </span>
                                {numericMrp > numericPrice && (
                                  <span className="text-xs text-neutral-400 line-through font-mono">
                                    ₹{numericMrp.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Quick Add To Bag */}
                              <button
                                type="button"
                                onClick={(e) => handleQuickAdd(e, product.public_id)}
                                disabled={isItemAdding || cartLoading}
                                title="Add to Bag"
                                className="p-2.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/20 text-[#2D5A1E] hover:bg-[#F2F8ED] hover:border-[#639E1F] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                              >
                                {isItemAdding ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-[#2D5A1E]" />
                                ) : (
                                  <ShoppingBag className="w-4 h-4" />
                                )}
                              </button>

                              {/* View Product Details */}
                              <Link
                                href={`/shop/${product.slug || product.public_id}`}
                                className="px-3.5 py-2.5 rounded-xl bg-[#172B15] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center space-x-1.5 shadow-sm"
                              >
                                <span>View</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {visibleCount < filteredProducts.length && (
                  <div className="text-center pt-6">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="px-7 py-3 rounded-2xl bg-white border border-[#2D5A1E]/30 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] hover:text-white transition-all shadow-sm inline-flex items-center space-x-2 cursor-pointer"
                    >
                      <span>Load More Formulations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </section>

      <LuxuryFooter />
    </div>
  );
}