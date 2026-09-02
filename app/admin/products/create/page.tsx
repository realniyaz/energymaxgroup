"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
  UploadCloud,
  Trash2,
  Star,
  FolderTree,
  IndianRupee
} from "lucide-react";
import { 
  createProduct, 
  uploadProductImage, 
  getCategories, 
  getSubcategoriesByCategory,
  ProductPayload, 
  Category,
  Subcategory
} from "@/lib/services/productService";

interface DraftFileImage {
  file: File;
  preview_url: string;
  alt_text: string;
  is_primary: boolean;
}

export default function CreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Taxonomy State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryPublicId, setSelectedCategoryPublicId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // Form State with Commercial Pricing Parameters
  const [formData, setFormData] = useState<ProductPayload>({
    subcategory_id: 0,
    name: "",
    slug: "",
    short_description: "Clinical-grade multi-strain broad-spectrum probiotic engineered for advanced gut restoration and immune fortification.",
    description: "Formulated with rigorous clinical precision, this advanced formulation delivers a potent matrix across clinically researched, resilient bacterial strains designed to bypass gastric acidity and optimize microflora balance.",
    brand_name: "EnergyMax",
    price: 2499,
    mrp: 2999,
    cost_price: 1200,
    seo_title: "",
    seo_description: "",
    is_active: true,
    is_featured: false,
    display_order: 0,
  });

  const [draftImages, setDraftImages] = useState<DraftFileImage[]>([]);

  // Cleanup object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      draftImages.forEach((img) => URL.revokeObjectURL(img.preview_url));
    };
  }, [draftImages]);

  // Fetch Parent Categories on mount
  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const res = await getCategories(1, 100);
        const list = res.items || [];
        
        if (!isMounted) return;
        setCategories(list);

        if (list.length > 0) {
          const firstCat = list[0];
          setSelectedCategoryPublicId(firstCat.public_id);
          await loadSubcategories(firstCat.public_id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    }
    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch subcategories when parent category changes
  const loadSubcategories = async (catPublicId: string) => {
    try {
      setSubcategoriesLoading(true);
      const subs = await getSubcategoriesByCategory(catPublicId);
      setSubcategories(subs || []);

      if (subs && subs.length > 0) {
        const firstSubId = subs[0].id || subs[0].category_id || 1;
        setFormData((prev) => ({
          ...prev,
          subcategory_id: Number(firstSubId),
        }));
      } else {
        setFormData((prev) => ({ ...prev, subcategory_id: 0 }));
      }
    } catch (err) {
      console.error("Failed to load subcategories:", err);
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const publicId = e.target.value;
    setSelectedCategoryPublicId(publicId);
    await loadSubcategories(publicId);
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      subcategory_id: Number(e.target.value),
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: generatedSlug,
      seo_title: prev.seo_title || `${val} | EnergyMax Wellness`,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "price" || name === "mrp" || name === "cost_price" || name === "display_order" || name === "subcategory_id") {
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

  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (draftImages.length + fileArray.length > 5) {
      alert("You can upload a maximum of 5 images per product.");
      return;
    }

    const newDrafts: DraftFileImage[] = fileArray.map((file, idx) => {
      const isFirst = draftImages.length === 0 && idx === 0;
      return {
        file,
        preview_url: URL.createObjectURL(file),
        alt_text: formData.name || file.name,
        is_primary: isFirst,
      };
    });

    setDraftImages((prev) => [...prev, ...newDrafts]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setDraftImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview_url);

      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleSetPrimary = (index: number) => {
    setDraftImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subcategory_id || formData.subcategory_id <= 0) {
      setError("Please select a valid parent category and subcategory.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    // Sanitize and normalize payload to prevent validation rejections
    const sanitizedPayload: ProductPayload = {
      subcategory_id: Number(formData.subcategory_id),
      name: formData.name.trim(),
      slug: (formData.slug || formData.name).trim().toLowerCase().replace(/[\s_-]+/g, "-"),
      short_description: formData.short_description?.trim() || "",
      description: formData.description?.trim() || "",
      brand_name: formData.brand_name?.trim() || "EnergyMax",
      price: Number(formData.price) || 0,
      mrp: Number(formData.mrp) || 0,
      cost_price: Number(formData.cost_price) || 0,
      seo_title: formData.seo_title?.trim() || `${formData.name.trim()} | EnergyMax Wellness`,
      seo_description: formData.seo_description?.trim() || "",
      is_active: Boolean(formData.is_active),
      is_featured: Boolean(formData.is_featured),
      display_order: Number(formData.display_order) || 0,
    };

    try {
      // 1. Create product entity
      const createdProduct = await createProduct(sanitizedPayload);
      
      const newProductId = 
        createdProduct.id ?? 
        (createdProduct as any).pk ?? 
        (createdProduct as any).product_id;

      if (!newProductId) {
        throw new Error("Product creation succeeded but failed to return a numeric primary key.");
      }

      // 2. Upload physical binary images concurrently via multipart form-data
      if (draftImages.length > 0) {
        const imageUploadPromises = draftImages.map((img, i) =>
          uploadProductImage(
            Number(newProductId),
            img.file,
            img.alt_text || sanitizedPayload.name,
            img.is_primary,
            i
          )
        );

        await Promise.all(imageUploadPromises);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      console.error("Failed to create product & images:", err);
      
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => `${d.loc?.slice(1).join(".")}: ${d.msg}`).join(" | "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(err.message || "Failed to create product. Please verify database connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link href="/admin/products" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Inventory</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F]">New SKU Registration</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-light text-[#172B15] tracking-tight">
            Create New <span className="font-serif italic text-[#639E1F]">Product</span>
          </h1>
        </div>

        <Link
          href="/admin/products"
          className="px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all shadow-sm"
        >
          Cancel
        </Link>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#172B15] flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-[#2D5A1E]" />
          <span className="text-xs font-bold uppercase tracking-wider">Product & media successfully registered! Redirecting...</span>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-xs font-medium">{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Taxonomy & Relational Selectors */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <FolderTree className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Taxonomy & Category Placement</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Parent Category *</label>
              <select
                disabled={categoriesLoading}
                value={selectedCategoryPublicId}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
              >
                {categoriesLoading ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.public_id} value={cat.public_id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Subcategory *</label>
              <select
                disabled={subcategoriesLoading || subcategories.length === 0}
                value={formData.subcategory_id}
                onChange={handleSubcategoryChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
              >
                {subcategoriesLoading ? (
                  <option>Loading subcategories...</option>
                ) : subcategories.length > 0 ? (
                  subcategories.map((sub) => {
                    const subId = sub.id || sub.category_id || 1;
                    return (
                      <option key={sub.public_id} value={subId}>
                        {sub.name} (ID: #{subId})
                      </option>
                    );
                  })
                ) : (
                  <option value={0}>No subcategories available under this category</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Core Details & Commercial Valuation */}
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
                onChange={handleNameChange}
                placeholder="e.g. maXilin Superprobiotics 1 Trillion CFU"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
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
                placeholder="maxilin-superprobiotics"
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
                placeholder="EnergyMax"
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

        {/* Section 3: Media Gallery */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center space-x-2 text-[#2D5A1E]">
              <ImageIcon className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Product Gallery & Media Assets ({draftImages.length}/5)</h3>
            </div>
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Cloudinary Direct Upload</span>
          </div>

          {draftImages.length < 5 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragging ? "border-[#2D5A1E] bg-[#F2F8ED]" : "border-neutral-300 bg-[#FAFAF7] hover:border-[#2D5A1E]/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                multiple
                accept="image/*"
                className="hidden"
              />
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172B15]">Click to upload or drag and drop images</p>
                  <p className="text-[10px] text-neutral-400 pt-1">PNG, JPG, WEBP (Direct binary file upload to Cloudinary)</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
            {draftImages.map((img, idx) => (
              <div key={idx} className={`relative group rounded-2xl border-2 overflow-hidden bg-[#FAFAF7] aspect-square flex items-center justify-center p-2 transition-all ${
                img.is_primary ? "border-[#8CC63F] shadow-md shadow-[#8CC63F]/20" : "border-neutral-200"
              }`}>
                <img src={img.preview_url} alt="Upload preview" className="w-full h-full object-contain" />

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
                      onClick={() => handleSetPrimary(idx)}
                      className="w-full py-1.5 rounded-lg bg-white/90 text-[#172B15] text-[10px] font-bold uppercase tracking-wider hover:bg-white shadow"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="w-full py-1.5 rounded-lg bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 shadow flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Descriptions */}
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
                placeholder="Brief summary for catalog cards..."
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
                placeholder="Comprehensive scientific or product overview..."
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>
          </div>
        </div>

        {/* Section 5: SEO Metadata */}
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
                placeholder="Meta title for Google indexing"
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
                placeholder="Meta description summary..."
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Publishing Parameters */}
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
            disabled={loading || subcategories.length === 0}
            className="px-8 py-4 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#234717] transition-all shadow-xl shadow-[#2D5A1E]/20 flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing SKU & Assets...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Publish Product</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}