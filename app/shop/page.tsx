"use client";

import React, { useState, useEffect, startTransition, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  SlidersHorizontal,
  PackageCheck,
  Star
} from "lucide-react";
import LuxuryNavbar from "../components/Navbar";
import LuxuryFooter from "../components/LuxuryFooter";
import { 
  getProducts, 
  getProductImages, 
  getCategories, 
  getSubcategoriesByCategory,
  Product, 
  Category,
  Subcategory 
} from "@/lib/services/productService";

export default function LuxuryShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [imagesMap, setImagesMap] = useState<Record<number, string>>({});
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState<number>(6);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalogData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch products & categories concurrently
        const [productRes, categoryRes] = await Promise.all([
          getProducts(1, 100),
          getCategories(1, 50).catch(() => ({ items: [], total: 0, page: 1, page_size: 50 }))
        ]);

        if (!isMounted) return;

        const rawProducts: Product[] = Array.isArray(productRes) 
          ? productRes 
          : productRes.items || [];
        
        const activeProducts = rawProducts.filter((p) => p.is_active !== false);
        setProducts(activeProducts);

        const categoryList = Array.isArray(categoryRes) ? categoryRes : categoryRes.items || [];
        setCategories(categoryList);

        // 2. Fetch all subcategories concurrently to establish taxonomy mapping
        const subcategoryResults = await Promise.allSettled(
          categoryList.map((cat) => getSubcategoriesByCategory(cat.public_id))
        );

        const allSubcategories: Subcategory[] = [];
        subcategoryResults.forEach((res) => {
          if (res.status === "fulfilled" && Array.isArray(res.value)) {
            allSubcategories.push(...res.value);
          }
        });
        if (isMounted) {
          setSubcategories(allSubcategories);
        }

        // 3. Populate images map using numeric product.id
        const imgMap: Record<number, string> = {};
        
        const fetchMissingImages = activeProducts.map(async (prod) => {
          if (prod.images && prod.images.length > 0) {
            const primary = prod.images.find((img) => img.is_primary) || prod.images[0];
            if (primary?.image_url) {
              imgMap[prod.id] = primary.image_url;
              return;
            }
          }

          if (!prod.id) return;

          try {
            const images = await getProductImages(prod.id);
            if (Array.isArray(images) && images.length > 0) {
              const primary = images.find((img) => img.is_primary) || images[0];
              if (primary?.image_url) {
                imgMap[prod.id] = primary.image_url;
              }
            }
          } catch {
            // Silently ignore individual thumbnail load errors
          }
        });

        await Promise.allSettled(fetchMissingImages);

        if (isMounted) {
          setImagesMap(imgMap);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Catalog synchronization error:", err);
          setError("Our boutique collection is momentarily refreshing. Please explore our featured selections shortly.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCatalogData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filterTabs = useMemo(() => ["All", ...categories.map((c) => c.name)], [categories]);

  // Map chosen category tab to its valid subcategory IDs for filtering
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;

    const targetCategory = categories.find(
      (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
    );

    if (targetCategory) {
      const matchingSubIds = subcategories
        .filter((sub) => sub.category_id === targetCategory.id)
        .map((sub) => sub.id);

      return products.filter((item) => {
        const matchesSubcategory = matchingSubIds.includes(item.subcategory_id);
        const matchesBrand = item.brand_name?.toLowerCase() === selectedCategory.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(selectedCategory.toLowerCase());
        return matchesSubcategory || matchesBrand || matchesName;
      });
    }

    return products.filter((item) => {
      const matchesBrand = item.brand_name?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesBrand || matchesName;
    });
  }, [products, categories, subcategories, selectedCategory]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    startTransition(() => {
      setTimeout(() => {
        setVisibleCount((prev) => prev + 6);
        setLoadingMore(false);
      }, 350);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#172B15] font-sans selection:bg-[#8CC63F]/30">
      <LuxuryNavbar />

      {/* Hero Header */}
      <section className="relative py-20 lg:py-32 bg-[#172B15] text-white overflow-hidden border-b border-[#2D5A1E]/30">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#8CC63F_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#8CC63F]/15 border border-[#8CC63F]/30 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-[#8CC63F]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8CC63F]">
              EnergyMax Global 
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight"
          >
            The Wellness <span className="font-serif italic text-[#8CC63F]">Collection</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs sm:text-sm text-neutral-300 font-normal max-w-xl mx-auto leading-relaxed"
          >
            Immaculately formulated probiotic solutions designed to harmonize your body's microbiome and elevate everyday vitality.
          </motion.p>
        </div>
      </section>

      {/* Main Storefront Area */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-20 space-y-12">
        
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#2D5A1E]/15">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#2D5A1E]">
            <SlidersHorizontal className="w-4 h-4 text-[#639E1F]" />
            <span>Filter Catalog</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {filterTabs.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(6);
                }}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-[#2D5A1E] text-white shadow-md shadow-[#2D5A1E]/10"
                    : "bg-white text-neutral-600 border border-[#2D5A1E]/15 hover:border-[#639E1F] hover:text-[#172B15]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Curating your collection...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-[#2D5A1E]/15 text-center space-y-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-[#2D5A1E] mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#172B15]">Boutique Notice</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-sm"
            >
              Refresh Collection
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="space-y-16">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#2D5A1E]/15 p-8 shadow-sm space-y-3">
                <PackageCheck className="w-10 h-10 text-neutral-300 mx-auto" />
                <p className="text-sm font-medium text-neutral-600">No products are currently available in this category.</p>
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="text-xs font-bold text-[#2D5A1E] uppercase tracking-wider hover:underline"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                  {filteredProducts.slice(0, visibleCount).map((product, idx) => {
                    const productImage = imagesMap[product.id] || product.images?.[0]?.image_url;
                    
                    const numericPrice = product.price != null && !isNaN(Number(product.price)) ? Number(product.price) : 0;
                    const numericMrp = product.mrp != null && !isNaN(Number(product.mrp)) ? Number(product.mrp) : 0;
                    const discountPercent = numericMrp > numericPrice && numericMrp > 0
                      ? Math.round(((numericMrp - numericPrice) / numericMrp) * 100)
                      : 0;

                    return (
                      <motion.div
                        key={product.public_id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="bg-white rounded-3xl border border-[#2D5A1E]/15 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#8CC63F]/50 transition-all duration-500 flex flex-col justify-between group"
                      >
                        <div className="relative h-72 sm:h-80 bg-[#FAFAF7] overflow-hidden p-6 flex items-center justify-center border-b border-neutral-100">
                          <div className="absolute inset-0 bg-[#8CC63F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {productImage ? (
                            <Image
                              src={productImage}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-[#8CC63F]/10 flex items-center justify-center text-[#2D5A1E]">
                              <Sparkles className="w-8 h-8" />
                            </div>
                          )}

                          {/* Badges Container */}
                          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
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

                          <button 
                            type="button"
                            aria-label="Add to wishlist"
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 border border-[#2D5A1E]/15 flex items-center justify-center text-[#2D5A1E] shadow-sm hover:bg-[#2D5A1E] hover:text-white transition-all"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-6 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#639E1F] block">
                              {product.brand_name || "Signature Formulation"}
                            </span>
                            <h3 className="text-lg font-light text-[#172B15] tracking-tight group-hover:text-[#2D5A1E] transition-colors line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed font-normal">
                              {product.short_description || product.description || "Clinically engineered to restore balance, enhance cellular wellness, and optimize daily vitality."}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 block">Investment</span>
                              <div className="flex items-baseline space-x-2">
                                <span className="text-lg font-serif text-[#172B15] font-normal">
                                  {numericPrice > 0 ? `₹${numericPrice.toLocaleString("en-IN")}` : "Free"}
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
                              className="px-5 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center space-x-1.5 shadow-md shadow-[#2D5A1E]/10"
                            >
                              <span>Explore</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {visibleCount < filteredProducts.length && (
                  <div className="text-center pt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-8 py-3.5 rounded-2xl bg-white border border-[#2D5A1E]/30 text-[#2D5A1E] text-xs font-bold uppercase tracking-widest hover:bg-[#2D5A1E] hover:text-white transition-all shadow-sm inline-flex items-center space-x-2 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading More...</span>
                        </>
                      ) : (
                        <span>Load More Products</span>
                      )}
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