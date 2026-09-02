"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  FileText, 
  Globe, 
  Sliders, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  UploadCloud,
  FolderTree,
  IndianRupee
} from "lucide-react";
import { 
  getProductByPublicId, 
  getProducts,
  updateProduct, 
  getProductImages, 
  uploadProductImage, 
  deleteProductImage, 
  setPrimaryProductImage,
  getCategories,
  getSubcategoriesByCategory,
  ProductPayload, 
  ProductImage,
  Category,
  Subcategory
} from "@/lib/services/productService";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const publicId = params?.public_id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productId, setProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Taxonomy State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryPublicId, setSelectedCategoryPublicId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState<boolean>(false);

  // Product Form State with Pricing Fields
  const [formData, setFormData] = useState<ProductPayload>({
    subcategory_id: 1,
    name: "",
    slug: "",
    short_description: "",
    description: "",
    brand_name: "EnergyMax",
    price: 0,
    mrp: 0,
    cost_price: 0,
    seo_title: "",
    seo_description: "",
    is_active: true,
    is_featured: false,
    display_order: 0,
  });

  // Images State
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImg, setUploadingImg] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!publicId) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch product detail, complete inventory list (for fallback ID resolution), and categories
        const [productData, catalogListRes, catRes] = await Promise.all([
          getProductByPublicId(publicId),
          getProducts(1, 100).catch(() => ({ items: [], total: 0, page: 1, page_size: 100 })),
          getCategories(1, 100).catch(() => ({ items: [], total: 0, page: 1, page_size: 100 }))
        ]);

        if (!isMounted) return;

        // Fallback match to ensure integer primary key is extracted
        const matchedFromList = (catalogListRes.items || []).find(
          (p: any) => p.public_id === publicId
        );

        const numericId = 
          productData.id ?? 
          (productData as any).pk ?? 
          (productData as any).product_id ??
          matchedFromList?.id ??
          (matchedFromList as any)?.pk;

        if (numericId) {
          setProductId(Number(numericId));
        }

        const categoryList = catRes.items || [];
        setCategories(categoryList);

        setFormData({
          subcategory_id: productData.subcategory_id,
          name: productData.name,
          slug: productData.slug,
          short_description: productData.short_description || "",
          description: productData.description || "",
          brand_name: productData.brand_name || "EnergyMax",
          price: productData.price != null ? Number(productData.price) : undefined,
          mrp: productData.mrp != null ? Number(productData.mrp) : undefined,
          cost_price: productData.cost_price != null ? Number(productData.cost_price) : undefined,
          seo_title: productData.seo_title || "",
          seo_description: productData.seo_description || "",
          is_active: productData.is_active,
          is_featured: productData.is_featured,
          display_order: productData.display_order,
        });

        // 2. Load images using the resolved numeric ID
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
        }

        // 3. Populate subcategories if categories exist
        if (categoryList.length > 0) {
          const defaultCat = categoryList[0];
          setSelectedCategoryPublicId(defaultCat.public_id);
          const subs = await getSubcategoriesByCategory(defaultCat.public_id);
          if (isMounted) {
            setSubcategories(subs);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load product details:", err);
          setError("Unable to retrieve product information from the backend.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setCategoriesLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [publicId]);

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const publicId = e.target.value;
    setSelectedCategoryPublicId(publicId);
    try {
      setSubcategoriesLoading(true);
      const subs = await getSubcategoriesByCategory(publicId);
      setSubcategories(subs || []);
      if (subs && subs.length > 0) {
        setFormData((prev) => ({
          ...prev,
          subcategory_id: Number(subs[0].id || subs[0].category_id || 1),
        }));
      }
    } catch (err) {
      console.error("Failed to load subcategories:", err);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "price" || name === "mrp" || name === "cost_price" || name === "subcategory_id" || name === "display_order") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProduct(publicId, formData);
      setSuccess("Product details updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Failed to update product:", err);
      setError(err.response?.data?.detail || "Failed to save changes to secure backend.");
    } finally {
      setSaving(false);
    }
  };

  // Batch Image Upload Handler (Supports up to 5 images in one go)
  const handleBatchImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (!productId) {
      alert("Product ID is not yet synchronized. Please refresh the page.");
      return;
    }

    const availableSlots = 5 - images.length;
    if (availableSlots <= 0) {
      alert("Maximum limit of 5 images already reached for this product.");
      return;
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      alert(`Uploading the first ${availableSlots} images to remain within the 5 image limit.`);
    }

    try {
      setUploadingImg(true);
      
      const uploadPromises = filesToUpload.map((file, idx) => {
        const isFirst = images.length === 0 && idx === 0;
        return uploadProductImage(
          productId,
          file,
          formData.name || file.name,
          isFirst,
          images.length + idx
        );
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedImages]);
    } catch (err: any) {
      console.error("Failed to upload images:", err);
      alert(err.response?.data?.detail || "Error uploading product images to Cloudinary.");
    } finally {
      setUploadingImg(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBatchImageUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = async (imgPublicId: string) => {
    if (!confirm("Are you sure you want to remove this image?")) return;
    try {
      await deleteProductImage(imgPublicId);
      setImages((prev) => {
        const remaining = prev.filter((img) => img.public_id !== imgPublicId);
        if (remaining.length > 0 && !remaining.some((img) => img.is_primary)) {
          remaining[0].is_primary = true;
        }
        return remaining;
      });
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Error deleting image.");
    }
  };

  const handleSetPrimary = async (imgPublicId: string) => {
    try {
      await setPrimaryProductImage(imgPublicId);
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.public_id === imgPublicId,
        }))
      );
    } catch (err) {
      console.error("Failed to set primary image:", err);
      alert("Error setting primary image.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Loading product & media assets...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link href="/admin/products" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Inventory</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F]">Edit SKU & Media</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-light text-[#172B15] tracking-tight">
            Manage Product: <span className="font-serif italic text-[#639E1F]">{formData.name}</span>
          </h1>
        </div>

        <Link
          href="/admin/products"
          className="px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all shadow-sm"
        >
          Back to Inventory
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#172B15] flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-[#2D5A1E]" />
          <span className="text-xs font-bold uppercase tracking-wider">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}

      {/* Gallery Section with Drag-and-Drop Batch Upload */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center space-x-2 text-[#2D5A1E]">
            <ImageIcon className="w-5 h-5" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Product Gallery & Media ({images.length}/5)</h3>
          </div>
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Cloudinary CDN Synced</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.public_id} className={`relative group rounded-2xl border-2 overflow-hidden bg-[#FAFAF7] aspect-square flex items-center justify-center p-2 transition-all ${
              img.is_primary ? "border-[#8CC63F] shadow-md shadow-[#8CC63F]/20" : "border-neutral-200"
            }`}>
              {img.image_url ? (
                <img src={img.image_url} alt={img.alt_text || "Product"} className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="w-8 h-8 text-neutral-300" />
              )}

              {img.is_primary && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#8CC63F] text-[#172B15] text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>Primary</span>
                </span>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.public_id)}
                    className="w-full py-1.5 rounded-lg bg-white/90 text-[#172B15] text-[10px] font-bold uppercase tracking-wider hover:bg-white shadow"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.public_id)}
                  className="w-full py-1.5 rounded-lg bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 shadow flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-full py-8 text-center text-neutral-400 text-xs bg-[#FAFAF7] rounded-2xl border border-dashed border-neutral-300">
              No product images uploaded yet. Drag & drop or select up to 5 images below.
            </div>
          )}
        </div>

        {images.length < 5 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !uploadingImg && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging ? "border-[#2D5A1E] bg-[#F2F8ED]" : "border-neutral-300 bg-[#FAFAF7] hover:border-[#2D5A1E]/50"
            } ${uploadingImg ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleBatchImageUpload(e.target.files)}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mx-auto">
                {uploadingImg ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#2D5A1E]" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-[#172B15]">
                  {uploadingImg ? "Uploading assets to Cloudinary..." : "Click to select or drag & drop images in one go"}
                </p>
                <p className="text-[10px] text-neutral-400 pt-1">
                  Upload up to {5 - images.length} remaining images (PNG, JPG, WEBP)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Edit Form */}
      <form onSubmit={handleUpdateProduct} className="space-y-8">
        
        {/* Section: Taxonomy Placement */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <FolderTree className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Taxonomy & Category Placement</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Parent Category</label>
              <select
                disabled={categoriesLoading}
                value={selectedCategoryPublicId}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.public_id} value={cat.public_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Subcategory *</label>
              <select
                disabled={subcategoriesLoading || subcategories.length === 0}
                value={formData.subcategory_id}
                onChange={handleChange}
                name="subcategory_id"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
              >
                {subcategories.map((sub) => {
                  const subId = sub.id || sub.category_id || 1;
                  return (
                    <option key={sub.public_id} value={subId}>
                      {sub.name} (ID: #{subId})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Section: Core Information & Pricing */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <Tag className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Core Product Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Product Name *</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">URL Slug *</label>
              <input
                type="text"
                required
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-mono text-[#172B15]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Brand Name</label>
              <input
                type="text"
                name="brand_name"
                value={formData.brand_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Display Order</label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>

            {/* Commercial Pricing Inputs */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                <IndianRupee className="w-3 h-3 text-[#2D5A1E]" />
                <span>Selling Price (₹) *</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price ?? ""}
                onChange={handleChange}
                placeholder="2499"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-bold text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                <IndianRupee className="w-3 h-3 text-neutral-400" />
                <span>MRP (₹)</span>
              </label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp ?? ""}
                onChange={handleChange}
                placeholder="2999"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                <IndianRupee className="w-3 h-3 text-neutral-400" />
                <span>Cost Price (₹)</span>
              </label>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price ?? ""}
                onChange={handleChange}
                placeholder="1200"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />
            </div>
          </div>
        </div>

        {/* Section: Descriptions */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <FileText className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Editorial & Descriptions</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Short Description</label>
              <input
                type="text"
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Full Description</label>
              <textarea
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>
          </div>
        </div>

        {/* Section: SEO Metadata */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <Globe className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Search Engine Optimization (SEO)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">SEO Title</label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">SEO Description</label>
              <textarea
                rows={2}
                name="seo_description"
                value={formData.seo_description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>
          </div>
        </div>

        {/* Section: Publishing Parameters */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <Sliders className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Publishing Parameters</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#2D5A1E]"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B15]">Active Product</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#2D5A1E]"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B15]">Featured Product</span>
            </label>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-4 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
          >
            Back
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#234717] transition-all shadow-xl shadow-[#2D5A1E]/20 flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Product Changes</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}