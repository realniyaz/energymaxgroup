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
  updateProduct, 
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

// Helper function to guarantee primary image is always at index 0
function sortImagesPrimaryFirst(imgs: ProductImage[]): ProductImage[] {
  return [...imgs].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });
}

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

  // Taxonomy State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryPublicId, setSelectedCategoryPublicId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState<boolean>(false);

  // Form State
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

  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImg, setUploadingImg] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!publicId) return;
      try {
        setLoading(true);
        setError(null);

        const [productData, catRes] = await Promise.all([
          getProductByPublicId(publicId),
          getCategories(1, 100).catch(() => ({ items: [], total: 0, page: 1, page_size: 100 }))
        ]);

        if (!isMounted) return;

        setProductId(productData.id);

        const categoryList = catRes.items || [];
        setCategories(categoryList);

        setFormData({
          subcategory_id: productData.subcategory_id ?? 1,
          name: productData.name ?? "",
          slug: productData.slug ?? "",
          short_description: productData.short_description || "",
          description: productData.description || "",
          brand_name: productData.brand_name || "EnergyMax",
          price: productData.price != null ? Number(productData.price) : 0,
          mrp: productData.mrp != null ? Number(productData.mrp) : 0,
          cost_price: productData.cost_price != null ? Number(productData.cost_price) : 0,
          seo_title: productData.seo_title || "",
          seo_description: productData.seo_description || "",
          is_active: Boolean(productData.is_active),
          is_featured: Boolean(productData.is_featured),
          display_order: productData.display_order ?? 0,
        });

        // Always sort images so that primary is placed first
        setImages(sortImagesPrimaryFirst(productData.images || []));

        if (categoryList.length > 0) {
          const defaultCat = categoryList[0];
          setSelectedCategoryPublicId(defaultCat.public_id);
          const subs = await getSubcategoriesByCategory(defaultCat.public_id);
          if (isMounted) setSubcategories(subs || []);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load product details:", err);
          setError(err.message || "Unable to retrieve product information from the backend.");
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
    const publicIdVal = e.target.value;
    setSelectedCategoryPublicId(publicIdVal);
    try {
      setSubcategoriesLoading(true);
      const subs = await getSubcategoriesByCategory(publicIdVal);
      setSubcategories(subs || []);
      if (subs && subs.length > 0) {
        const resolvedId = Number(subs[0].id ?? (subs[0] as any).category_id ?? 1);
        setFormData((prev) => ({
          ...prev,
          subcategory_id: resolvedId > 0 ? resolvedId : 1,
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
        [name]: value === "" ? 0 : Number(value),
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

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setError("Selling price must be greater than 0.");
      return;
    }

    if (formData.mrp && Number(formData.price) > Number(formData.mrp)) {
      setError("Product price cannot be greater than MRP.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateProduct(publicId, {
        ...formData,
        price: Number(formData.price),
        mrp: formData.mrp ? Number(formData.mrp) : null,
        cost_price: formData.cost_price ? Number(formData.cost_price) : null,
        subcategory_id: Number(formData.subcategory_id),
        display_order: Number(formData.display_order ?? 0),
      });

      // Synchronize local state with the returned entity
      setFormData({
        subcategory_id: updated.subcategory_id ?? Number(formData.subcategory_id),
        name: updated.name ?? formData.name,
        slug: updated.slug ?? formData.slug,
        short_description: updated.short_description || "",
        description: updated.description || "",
        brand_name: updated.brand_name || "EnergyMax",
        price: updated.price != null ? Number(updated.price) : Number(formData.price),
        mrp: updated.mrp != null ? Number(updated.mrp) : (formData.mrp ? Number(formData.mrp) : 0),
        cost_price: updated.cost_price != null ? Number(updated.cost_price) : (formData.cost_price ? Number(formData.cost_price) : 0),
        seo_title: updated.seo_title || "",
        seo_description: updated.seo_description || "",
        is_active: Boolean(updated.is_active),
        is_featured: Boolean(updated.is_featured),
        display_order: updated.display_order ?? 0,
      });

      setSuccess("Product updated successfully! Redirecting to inventory...");

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1000);

    } catch (err: any) {
      console.error("Failed to update product:", err);
      setError(err.message || "Failed to save changes to secure backend.");
    } finally {
      setSaving(false);
    }
  };

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

    try {
      setUploadingImg(true);
      const newlyUploaded: ProductImage[] = [];

      for (let idx = 0; idx < filesToUpload.length; idx++) {
        const file = filesToUpload[idx];
        const isFirst = images.length === 0 && idx === 0;
        const uploaded = await uploadProductImage(
          productId,
          file,
          formData.name || file.name,
          images.length + idx,
          isFirst
        );
        newlyUploaded.push(uploaded);
      }

      setImages((prev) => sortImagesPrimaryFirst([...prev, ...newlyUploaded]));
    } catch (err: any) {
      console.error("Failed to upload images:", err);
      alert(err.message || "Error uploading product images to Cloudinary.");
    } finally {
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSetPrimary = async (imgPublicId: string) => {
    try {
      await setPrimaryProductImage(imgPublicId);
      setImages((prev) => {
        const updated = prev.map((img) => ({
          ...img,
          is_primary: img.public_id === imgPublicId,
        }));
        return sortImagesPrimaryFirst(updated);
      });
    } catch (err: any) {
      console.error("Failed to set primary image:", err);
      alert(err.message || "Error setting primary image.");
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
        return sortImagesPrimaryFirst(remaining);
      });
    } catch (err: any) {
      console.error("Failed to delete image:", err);
      alert(err.message || "Error deleting image.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-[#2D5A1E] animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Loading product & media assets...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link 
              href="/admin/products" 
              className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1"
            >
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
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}

      {/* Gallery Section with Primary Image First */}
      <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center space-x-2 text-[#2D5A1E]">
            <ImageIcon className="w-5 h-5" />
            <h3 className="text-xs font-bold uppercase tracking-widest">
              Product Gallery ({images.length}/5)
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            Lead Photo = First in Storefront
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {images.map((img) => (
            <div 
              key={img.public_id} 
              className={`relative group rounded-2xl border-2 overflow-hidden bg-[#FAFAF7] aspect-square flex items-center justify-center p-2 transition-all ${
                img.is_primary ? "border-[#8CC63F] shadow-md shadow-[#8CC63F]/20 ring-2 ring-[#8CC63F]/30" : "border-neutral-200"
              }`}
            >
              {img.image_url ? (
                <img src={img.image_url} alt={img.alt_text || "Product"} className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="w-8 h-8 text-neutral-300" />
              )}

              {img.is_primary && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#8CC63F] text-[#172B15] text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>Lead Hero</span>
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
              No images uploaded yet. Upload up to 5 images below.
            </div>
          )}
        </div>

        {images.length < 5 && (
          <div
            onClick={() => !uploadingImg && fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all border-neutral-300 bg-[#FAFAF7] hover:border-[#2D5A1E]/50"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleBatchImageUpload(e.target.files)}
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mx-auto">
                {uploadingImg ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              </div>
              <p className="text-xs font-bold text-[#172B15]">
                {uploadingImg ? "Uploading to Cloudinary..." : "Click to upload more angles (Max 5 total)"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Product Edit Form */}
      <form onSubmit={handleUpdateProduct} className="space-y-8">
        
        {/* Taxonomy Section */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <FolderTree className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Taxonomy & Category Placement</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Parent Category</label>
              <select
                disabled={categoriesLoading}
                value={selectedCategoryPublicId}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.public_id} value={cat.public_id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Subcategory</label>
              <select
                disabled={subcategoriesLoading || subcategories.length === 0}
                value={formData.subcategory_id}
                onChange={handleChange}
                name="subcategory_id"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
              >
                {subcategories.map((sub, idx) => {
                  const resolvedId = Number(sub.id ?? (sub as any).category_id ?? (idx + 1));
                  return (
                    <option key={sub.public_id} value={resolvedId}>
                      {sub.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Subcategory DB ID</label>
              <input
                type="number"
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-mono font-bold text-[#172B15]"
              />
            </div>
          </div>
        </div>

        {/* Core Information & Pricing */}
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
                value={formData.brand_name || ""}
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

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1">
                <IndianRupee className="w-3 h-3 text-[#2D5A1E]" />
                <span>Selling Price (₹) *</span>
              </label>
              <input
                type="number"
                required
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-bold text-[#172B15]"
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
                value={formData.mrp || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
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
                value={formData.cost_price || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
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
                value={formData.short_description || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Full Description</label>
              <textarea
                rows={4}
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <Globe className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">SEO Metadata</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">SEO Title</label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">SEO Description</label>
              <textarea
                rows={2}
                name="seo_description"
                value={formData.seo_description || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>
          </div>
        </div>

        {/* Publishing Parameters */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <Sliders className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Publishing Parameters</h3>
          </div>

          <div className="flex items-center gap-8">
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

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-4 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
          >
            Cancel
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