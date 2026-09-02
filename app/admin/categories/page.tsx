"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  PlusCircle, 
  Trash2, 
  Edit2, 
  Loader2, 
  ArrowLeft,
  FolderTree,
  Tag,
  X,
  Save,
  RefreshCw
} from "lucide-react";
import { 
  getCategories, 
  createCategory, 
  updateCategory,
  deleteCategory,
  getSubcategoriesByCategory, 
  createSubcategory, 
  deleteSubcategory,
  Category, 
  Subcategory 
} from "@/lib/services/productService";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSubcats, setLoadingSubcats] = useState<boolean>(false);

  // New Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatSlug, setEditCatSlug] = useState("");
  const [updatingCat, setUpdatingCat] = useState(false);

  // New Subcategory Form State
  const [newSubName, setNewSubName] = useState("");
  const [newSubSlug, setNewSubSlug] = useState("");
  const [creatingSub, setCreatingSub] = useState(false);

  // Initial Load (Safely fetches using public_id string)
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      const list = res.items || [];
      setCategories(list);
      
      if (list.length > 0) {
        const defaultCat = list[0];
        setSelectedCategory(defaultCat);
        
        if (defaultCat.public_id) {
          const subs = await getSubcategoriesByCategory(defaultCat.public_id);
          setSubcategories(subs || []);
        }
      } else {
        setSelectedCategory(null);
        setSubcategories([]);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle selecting a category from the left column list
  const handleSelectCategory = async (cat: Category) => {
    setSelectedCategory(cat);
    setLoadingSubcats(true);
    
    try {
      if (cat.public_id) {
        const subs = await getSubcategoriesByCategory(cat.public_id);
        setSubcategories(subs || []);
      } else {
        setSubcategories([]);
      }
    } catch (err) {
      setSubcategories([]);
    } finally {
      setLoadingSubcats(false);
    }
  };

  // Handle Category Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      setCreatingCat(true);
      const created = await createCategory({
        name: newCatName,
        slug: newCatSlug || newCatName.toLowerCase().replace(/\s+/g, "-"),
        display_order: categories.length,
        is_active: true,
      });

      const updatedCategories = [...categories, created];
      setCategories(updatedCategories);
      setNewCatName("");
      setNewCatSlug("");
      
      handleSelectCategory(created);
    } catch (err) {
      alert("Failed to create category.");
    } finally {
      setCreatingCat(false);
    }
  };

  // Handle Category Update
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      setUpdatingCat(true);
      const updated = await updateCategory(editingCategory.public_id, {
        name: editCatName,
        slug: editCatSlug,
      });

      const updatedCategories = categories.map((c) => c.public_id === updated.public_id ? updated : c);
      setCategories(updatedCategories);
      if (selectedCategory?.public_id === updated.public_id) {
        setSelectedCategory(updated);
      }
      setEditingCategory(null);
    } catch (err) {
      alert("Failed to update category.");
    } finally {
      setUpdatingCat(false);
    }
  };

  // Handle Category Deletion
  const handleDeleteCategory = async (publicId: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(publicId);
      
      const remainingCategories = categories.filter((c) => c.public_id !== publicId);
      setCategories(remainingCategories);

      if (selectedCategory?.public_id === publicId) {
        if (remainingCategories.length > 0) {
          handleSelectCategory(remainingCategories[0]);
        } else {
          setSelectedCategory(null);
          setSubcategories([]);
        }
      }
    } catch (err) {
      alert("Failed to delete category.");
    }
  };

  // Handle Subcategory Creation using category_public_id string
  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !selectedCategory?.public_id) {
      alert("Please select a valid parent category from the left list.");
      return;
    }

    try {
      setCreatingSub(true);
      await createSubcategory({
        category_public_id: selectedCategory.public_id,
        name: newSubName,
        slug: newSubSlug || newSubName.toLowerCase().replace(/\s+/g, "-"),
        description: "",
        image_url: "",
        display_order: subcategories.length,
        is_active: true,
      });
      setNewSubName("");
      setNewSubSlug("");
      
      const subs = await getSubcategoriesByCategory(selectedCategory.public_id);
      setSubcategories(subs || []);
    } catch (err: any) {
      console.error("Error creating subcategory:", err);
      if (err.message && err.message.includes("already exists")) {
        alert("A subcategory with this slug already exists in this category.");
      } else {
        alert("Failed to create subcategory.");
      }
    } finally {
      setCreatingSub(false);
    }
  };

  // Handle Subcategory Deletion
  const handleDeleteSubcategory = async (publicId: string) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      await deleteSubcategory(publicId);
      if (selectedCategory?.public_id) {
        const subs = await getSubcategoriesByCategory(selectedCategory.public_id);
        setSubcategories(subs || []);
      }
    } catch (err) {
      alert("Failed to delete subcategory.");
    }
  };

  return (
    <div className="w-full space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D5A1E]/15">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link href="/admin/dashboard" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#2D5A1E] transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#639E1F]">Taxonomy Control</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-light text-[#172B15] tracking-tight">
            Categories & <span className="font-serif italic text-[#639E1F]">Subcategories</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchInitialData}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#2D5A1E]/20 text-[#2D5A1E] text-xs font-bold uppercase tracking-wider hover:bg-[#F2F8ED] transition-all flex items-center space-x-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Fast Refresh</span>
          </button>

          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all shadow-sm"
          >
            Inventory
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Categories Section */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <FolderTree className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Parent Categories</h3>
          </div>

          <form onSubmit={handleCreateCategory} className="space-y-4 bg-[#FAFAF7] p-4 rounded-2xl border border-neutral-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Probiotics & Gut Health"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs text-[#172B15] focus:outline-none focus:border-[#639E1F]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Slug</label>
              <input
                type="text"
                required
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs font-mono text-[#172B15]"
              />
            </div>
            <button
              type="submit"
              disabled={creatingCat}
              className="w-full py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {creatingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Create Category</span>
            </button>
          </form>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Existing Categories (Click to Select)</h4>
            {loading ? (
              <div className="py-8 text-center text-neutral-400 text-xs flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#2D5A1E]" />
                <span>Loading taxonomy...</span>
              </div>
            ) : categories.length > 0 ? (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory?.public_id === cat.public_id;
                  return (
                    <div
                      key={cat.public_id}
                      onClick={() => handleSelectCategory(cat)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#F2F8ED] border-[#8CC63F] shadow-sm ring-1 ring-[#8CC63F]"
                          : "bg-white border-neutral-200 hover:border-[#2D5A1E]/30"
                      }`}
                    >
                      <div className="flex-1">
                        <h5 className="font-semibold text-[#172B15] text-sm">{cat.name}</h5>
                        <span className="text-[10px] font-mono text-neutral-400">/{cat.slug}</span>
                      </div>

                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditCatName(cat.name);
                            setEditCatSlug(cat.slug);
                          }}
                          className="p-2 rounded-xl bg-[#2D5A1E]/10 text-[#2D5A1E] hover:bg-[#2D5A1E] hover:text-white transition-all shadow-sm"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteCategory(cat.public_id)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-400 text-xs">No categories found in database.</div>
            )}
          </div>
        </div>

        {/* Subcategories Section */}
        <div className="bg-white rounded-3xl border border-[#2D5A1E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 text-[#2D5A1E]">
            <Tag className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">
              Subcategories for "{selectedCategory ? selectedCategory.name : "Select a Category"}"
            </h3>
          </div>

          <form onSubmit={handleCreateSubcategory} className="space-y-4 bg-[#FAFAF7] p-4 rounded-2xl border border-neutral-200">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Active Parent Category</label>
              <div className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-[#2D5A1E] flex items-center justify-between">
                <span>{selectedCategory ? selectedCategory.name : "None selected"}</span>
                <span className="text-[10px] font-mono text-neutral-400">Ready</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Subcategory Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Daily Capsules 50B"
                value={newSubName}
                onChange={(e) => {
                  setNewSubName(e.target.value);
                  setNewSubSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs text-[#172B15]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Slug</label>
              <input
                type="text"
                required
                value={newSubSlug}
                onChange={(e) => setNewSubSlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs font-mono text-[#172B15]"
              />
            </div>

            <button
              type="submit"
              disabled={creatingSub || !selectedCategory}
              className="w-full py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {creatingSub ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Create Subcategory</span>
            </button>
          </form>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Associated Subcategories</h4>
            {loadingSubcats ? (
              <div className="py-8 text-center text-neutral-400 text-xs flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#2D5A1E]" />
                <span>Syncing subcategories...</span>
              </div>
            ) : subcategories.length > 0 ? (
              <div className="space-y-2">
                {subcategories.map((sub) => (
                  <div key={sub.public_id} className="p-4 rounded-2xl bg-[#FAFAF7] border border-neutral-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-[#172B15] text-sm">{sub.name}</h5>
                      <span className="text-[10px] font-mono text-neutral-400">/{sub.slug}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSubcategory(sub.public_id)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Delete Subcategory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-400 text-xs">No subcategories found for this category.</div>
            )}
          </div>
        </div>

      </div>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-[#2D5A1E]/15">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2D5A1E]">Edit Category</h3>
                <button onClick={() => setEditingCategory(null)} className="p-2 rounded-full hover:bg-neutral-100 transition-all">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Category Name</label>
                  <input
                    type="text"
                    required
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs text-[#172B15]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Slug</label>
                  <input
                    type="text"
                    required
                    value={editCatSlug}
                    onChange={(e) => setEditCatSlug(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-neutral-200 text-xs font-mono text-[#172B15]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingCat}
                    className="px-6 py-2.5 rounded-xl bg-[#2D5A1E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234717] flex items-center space-x-2"
                  >
                    {updatingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}