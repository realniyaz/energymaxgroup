"use client";

import React, { 
  useState, 
  useEffect, 
  useMemo, 
  useTransition, 
  useDeferredValue,
  useCallback 
} from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  PackageCheck, 
  Star, 
  Search, 
  X, 
  Activity 
} from "lucide-react";
import { getProducts, Product } from "@/lib/services/productService";

// Lazy-load non-critical structural components to minimize initial bundle size
const LuxuryNavbar = dynamic(() => import("@/app/components/Navbar"), {
  ssr: true,
});

const LuxuryFooter = dynamic(() => import("@/app/components/LuxuryFooter"), {
  ssr: false,
});

const WishlistHeartButton = dynamic(
  () => import("@/app/components/shop/WishlistHeartButton"),
  { ssr: false }
);

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const deferredSearch = useDeferredValue(searchQuery);

  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        setLoading(true);
        setError(null);

        // Fetch primary catalog list
        const productRes = await getProducts(1, 100, undefined, true);

        if (!isMounted) return;

        const rawProducts: Product[] = Array.isArray(productRes) 
          ? productRes 
          : productRes.items || [];
        
        const activeList = rawProducts.filter((p) => p.is_active !== false);
        setProducts(activeList);
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
      controller.abort();
    };
  }, []);

  // Filter & sort computations with deferred search input
  const filteredProducts = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();

    return products
      .filter((item) => {
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.brand_name?.toLowerCase().includes(q) ||
          item.short_description?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.slug?.toLowerCase().includes(q)
        );
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
  }, [products, deferredSearch, sortBy]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as "featured" | "price-asc" | "price-desc" | "newest";
    startTransition(() => {
      setSortBy(val);
    });
  };

  const handleLoadMore = useCallback(() => {
    startTransition(() => {
      setVisibleCount((prev) => prev + 6);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />

      {/* Header Banner - CSS Native Animations */}
      <section className="relative py-12 sm:py-20 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8CC63F]">
              Clinical Probiotic Science
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white leading-tight">
            Nutraceutical <span className="font-serif italic text-[#8CC63F]">Formulations</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-xl mx-auto leading-relaxed">
            Targeted live microbial cultures and synbiotic supplements engineered to restore microflora equilibrium, cellular defense, and systemic health.
          </p>
        </div>
      </section>

      {/* Main Catalog View */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-6 sm:space-y-8">
        
        {/* Search & Sorting Toolbar */}
        <div className="bg-white rounded-2xl border border-[#2D5A1E]/15 p-3.5 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search formulations or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] placeholder-neutral-400 focus:outline-none focus:border-[#639E1F] transition-colors"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#172B15] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <span className="text-[11px] font-semibold text-neutral-500 font-mono">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Formulation" : "Formulations"}
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sort:</span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-3 py-1.5 sm:py-2 rounded-xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-semibold text-[#172B15] focus:outline-none focus:border-[#639E1F] cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-28 space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Retrieving Catalog...
            </p>
          </div>
        )}

        {/* Error Notice */}
        {error && !loading && (
          <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 text-center space-y-4 shadow-xs">
            <ShieldCheck className="w-8 h-8 text-[#2D5A1E] mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#172B15]">Catalog Notice</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-xs cursor-pointer"
            >
              Reload Catalog
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="space-y-12">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-xs space-y-3 max-w-md mx-auto">
                <PackageCheck className="w-10 h-10 text-neutral-300 mx-auto" />
                <h4 className="text-base font-semibold text-[#172B15]">No Formulations Found</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  We could not find any active product matches for your search.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-5 py-2 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-xs cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
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

                    const isAboveFold = idx < 3;

                    return (
                      <div
                        key={product.public_id || idx}
                        className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#8CC63F]/50 transition-all duration-300 flex flex-col justify-between group"
                      >
                        {/* Image Container with precise size-constraints & lazy loading */}
                        <div className="relative">
                          <Link 
                            href={`/shop/${product.slug || product.public_id}`}
                            className="relative w-full aspect-[4/3] sm:aspect-square bg-[#F4F6F4] overflow-hidden flex items-center justify-center border-b border-neutral-100 block"
                          >
                            <Image
                              src={productImage}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              quality={75}
                              priority={isAboveFold}
                              loading={isAboveFold ? "eager" : "lazy"}
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                            />

                            {/* Badges */}
                            <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
                              {product.is_featured && (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-50/95 backdrop-blur-xs border border-amber-200 text-amber-800 text-[9px] font-bold uppercase tracking-wider shadow-xs flex items-center space-x-1">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  <span>Featured</span>
                                </span>
                              )}
                              {discountPercent > 0 && (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#8CC63F]/90 backdrop-blur-xs border border-[#8CC63F] text-[#172B15] text-[9px] font-bold tracking-wider uppercase shadow-xs">
                                  {discountPercent}% OFF
                                </span>
                              )}
                            </div>
                          </Link>

                          {/* Dynamic Non-blocking Wishlist */}
                          <WishlistHeartButton
                            productId={Number(product.id) || Number((product as any).pk) || 0}
                            productIdentifier={product.public_id}
                            className="absolute top-3.5 right-3.5 w-9 h-9 sm:w-10 sm:h-10 z-10"
                            iconClassName="w-4 h-4"
                          />
                        </div>

                        {/* Product Details & Action Area */}
                        <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
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
                              {product.short_description || product.description || "Targeted live microbial cultures engineered to restore microflora equilibrium."}
                            </p>
                          </div>

                          {/* Price & View Button */}
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

                            <Link
                              href={`/shop/${product.slug || product.public_id}`}
                              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all flex items-center space-x-1.5 shadow-xs shrink-0 group/btn"
                            >
                              <span>View</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#8CC63F] group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {visibleCount < filteredProducts.length && (
                  <div className="text-center pt-6">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="px-7 py-3 rounded-2xl bg-white border border-[#2D5A1E]/30 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] hover:text-white transition-all shadow-xs inline-flex items-center space-x-2 cursor-pointer"
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