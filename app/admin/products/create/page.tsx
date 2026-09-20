"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryPublicId, setSelectedCategoryPublicId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

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

  const [draftImages, setDraftImages] = useState<DraftFileImage[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const res = await getCategories(1, 100, true);
        const list = res.items || [];
        setCategories(list);

        if (list.length > 0) {
          const firstCat = list[0];
          setSelectedCategoryPublicId(firstCat.public_id);
          await loadSubcategories(firstCat.public_id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  const loadSubcategories = async (catPublicId: string) => {
    try {
      setSubcategoriesLoading(true);
      const subs = await getSubcategoriesByCategory(catPublicId);
      setSubcategories(subs || []);

      if (subs && subs.length > 0) {
        const fallbackId = Number(subs[0].id ?? (subs[0] as any).category_id ?? 1);
        setFormData((prev) => ({
          ...prev,
          subcategory_id: fallbackId > 0 ? fallbackId : 1,
        }));
      } else {
        setFormData((prev) => ({ ...prev, subcategory_id: 1 }));
      }
    } catch (err) {
      console.error("Failed to load subcategories:", err);
      setSubcategories([]);
      setFormData((prev) => ({ ...prev, subcategory_id: 1 }));
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pubId = e.target.value;
    setSelectedCategoryPublicId(pubId);
    loadSubcategories(pubId);
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setFormData((prev) => ({
      ...prev,
      subcategory_id: !isNaN(val) && val > 0 ? val : 1,
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
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleSetPrimary = (index: number) => {
    setDraftImages((prev) => {
      const updated = prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }));
      return [...updated].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);
    setError(null);

    try {
      const createdProduct = await createProduct({
        ...formData,
        price: Number(formData.price),
        mrp: formData.mrp ? Number(formData.mrp) : null,
        cost_price: formData.cost_price ? Number(formData.cost_price) : null,
        subcategory_id: Number(formData.subcategory_id),
      });

      const targetNumericId = createdProduct.id ?? (createdProduct as any).pk;

      if (draftImages.length > 0 && targetNumericId) {
        const sortedDrafts = [...draftImages].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
        for (let i = 0; i < sortedDrafts.length; i++) {
          const img = sortedDrafts[i];
          await uploadProductImage(
            targetNumericId,
            img.file,
            img.alt_text || formData.name,
            i,
            img.is_primary
          );
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      console.error("Failed to create product & images:", err);
      setError(err.message || "Failed to create product on secure backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
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
        <div className="p-4 rounded-2xl bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#172B15] flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-[#2D5A1E]" />
          <span className="text-xs font-bold uppercase tracking-wider">Product & media successfully registered! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Taxonomy */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <FolderTree className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Taxonomy & Category Placement</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Parent Category *
              </label>
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Subcategory *
              </label>
              <select
                disabled={subcategoriesLoading || subcategories.length === 0}
                value={formData.subcategory_id || 1}
                onChange={handleSubcategoryChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F] font-medium"
              >
                {subcategoriesLoading ? (
                  <option value={1}>Loading subcategories...</option>
                ) : subcategories.length > 0 ? (
                  subcategories.map((sub, idx) => {
                    const resolvedId = Number(sub.id ?? (sub as any).category_id ?? (idx + 1));
                    return (
                      <option key={sub.public_id || idx} value={resolvedId}>
                        {sub.name}
                      </option>
                    );
                  })
                ) : (
                  <option value={1}>probiotics</option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Subcategory DB ID *
                </label>
                <span className="text-[9px] text-[#639E1F] font-mono font-semibold">Backend Integer</span>
              </div>
              <input
                type="number"
                required
                min={1}
                name="subcategory_id"
                value={formData.subcategory_id || 1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    subcategory_id: val > 0 ? val : 1,
                  }));
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs font-mono font-bold text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Product Media */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center space-x-2 text-[#2D5A1E]">
              <ImageIcon className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Product Gallery & Media Assets ({draftImages.length}/5)</h3>
            </div>
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Primary = First in Catalog</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {draftImages.map((img, idx) => (
              <div key={idx} className={`relative group rounded-2xl border-2 overflow-hidden bg-[#FAFAF7] aspect-square flex items-center justify-center p-2 transition-all ${
                img.is_primary ? "border-[#8CC63F] shadow-md shadow-[#8CC63F]/20 ring-2 ring-[#8CC63F]/30" : "border-neutral-200"
              }`}>
                <img src={img.preview_url} alt="Upload preview" className="w-full h-full object-contain" />

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

            {draftImages.length === 0 && (
              <div className="col-span-full py-8 text-center text-neutral-400 text-xs bg-[#FAFAF7] rounded-2xl border border-dashed border-neutral-300">
                No images added yet. Click below or drag and drop up to 5 images.
              </div>
            )}
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
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#8CC63F]/20 text-[#2D5A1E] flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172B15]">Click to upload or drag and drop images</p>
                  <p className="text-[10px] text-neutral-400 pt-1">PNG, JPG, WEBP up to 5MB (Maximum 5 images)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Core Specs & Commercial Pricing */}
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
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
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
                placeholder="2499"
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
                placeholder="2999"
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
                placeholder="1200"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAF7] border border-[#2D5A1E]/15 text-xs text-[#172B15]"
              />
            </div>
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Short Summary</label>
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

        {/* Section 5: SEO */}
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

        {/* Section 6: Publishing Controls */}
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

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-4 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
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