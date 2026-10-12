// components/admin/ProductVariantsSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  ProductVariant,
  ProductVariantPayload,
} from "@/lib/services/productService";

interface Props {
  productPublicId: string;
}

const initialForm = {
  sku: "",
  flavour: "",
  pack_size: "",
  serving_size: "",
  servings_per_container: "",
  price: "",
  mrp: "",
  cost_price: "",
  weight_grams: "",
  is_active: true,
  display_order: 0,
};

export default function ProductVariantsSection({ productPublicId }: Props) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchVariants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductVariants(productPublicId);
      setVariants(data);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to load variants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productPublicId) {
      fetchVariants();
    }
  }, [productPublicId]);

  const handleOpenCreate = () => {
    setEditingVariant(null);
    setFormData(initialForm);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: ProductVariant) => {
    setEditingVariant(v);
    setFormData({
      sku: v.sku,
      flavour: v.flavour || "",
      pack_size: v.pack_size || "",
      serving_size: v.serving_size || "",
      servings_per_container: v.servings_per_container != null ? String(v.servings_per_container) : "",
      price: v.price != null ? String(v.price) : "",
      mrp: v.mrp != null && Number(v.mrp) > 0 ? String(v.mrp) : "",
      cost_price: v.cost_price != null && Number(v.cost_price) > 0 ? String(v.cost_price) : "",
      weight_grams: v.weight_grams != null && Number(v.weight_grams) > 0 ? String(v.weight_grams) : "",
      is_active: v.is_active,
      display_order: v.display_order || 0,
    });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(formData.price);
    if (!formData.sku.trim() || isNaN(priceNum) || priceNum <= 0) {
      setError("SKU and a valid price (> 0) are required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Sanitize payload: strip 0 / empty values to satisfy FastAPI's gt=0 / string constraints
    const costPriceNum = parseFloat(formData.cost_price);
    const mrpNum = parseFloat(formData.mrp);
    const weightNum = parseFloat(formData.weight_grams);
    const servingsNum = parseInt(formData.servings_per_container, 10);

    const payload: ProductVariantPayload = {
      sku: formData.sku.trim().toUpperCase(),
      price: priceNum,
      flavour: formData.flavour.trim() || null,
      pack_size: formData.pack_size.trim() || null,
      serving_size: formData.serving_size.trim() || null,
      servings_per_container: !isNaN(servingsNum) && servingsNum > 0 ? servingsNum : null,
      cost_price: !isNaN(costPriceNum) && costPriceNum > 0 ? costPriceNum : null,
      mrp: !isNaN(mrpNum) && mrpNum > 0 ? mrpNum : null,
      weight_grams: !isNaN(weightNum) && weightNum > 0 ? weightNum : null,
      is_active: formData.is_active,
      display_order: Number(formData.display_order) || 0,
    };

    try {
      if (editingVariant) {
        await updateProductVariant(editingVariant.public_id, payload);
        setSuccess(`Variant ${payload.sku} updated successfully.`);
      } else {
        await createProductVariant(productPublicId, payload);
        setSuccess(`Variant ${payload.sku} created successfully.`);
      }

      setIsModalOpen(false);
      await fetchVariants();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join(" | "));
      } else {
        setError(typeof detail === "string" ? detail : "Failed to save product variant.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (v: ProductVariant) => {
    if (!confirm(`Are you sure you want to delete variant ${v.sku}?`)) return;
    setError(null);
    setSuccess(null);

    try {
      await deleteProductVariant(v.public_id);
      setSuccess(`Variant ${v.sku} deleted.`);
      await fetchVariants();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to delete variant.");
    }
  };

  const handleToggleActive = async (v: ProductVariant) => {
    try {
      await updateProductVariant(v.public_id, { is_active: !v.is_active });
      await fetchVariants();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to update variant active status."
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A1E]/15 shadow-sm space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#639E1F]" />
            <h2 className="text-base font-serif font-bold text-[#172B15]">
              Product Variants ({variants.length})
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            SKUs, flavours, pack sizing, and pricing for this formulation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-[#172B15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2D5A1E] transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Variant</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 text-[#2D5A1E] animate-spin" />
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
            Loading Variants...
          </span>
        </div>
      ) : variants.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-400">
          No variants defined for this product yet. Click &quot;Add Variant&quot; to create one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#172B15]">
            <thead className="bg-[#FAFAF7] border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Flavour / Spec</th>
                <th className="px-4 py-3">Pack Size</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">MRP</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {variants.map((v) => (
                <tr key={v.public_id} className="hover:bg-[#FAFAF7]/60">
                  <td className="px-4 py-3 font-mono font-bold text-[#172B15]">
                    {v.sku}
                  </td>
                  <td className="px-4 py-3 text-neutral-700 font-medium">
                    {v.flavour || <span className="text-neutral-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {v.pack_size || <span className="text-neutral-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#2D5A1E]">
                    ₹{Number(v.price).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-400">
                    {v.mrp ? `₹${Number(v.mrp).toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-400">
                    {v.cost_price ? `₹${Number(v.cost_price).toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(v)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                        v.is_active
                          ? "bg-[#8CC63F]/20 text-[#2D5A1E] border border-[#8CC63F]/40"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {v.is_active ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(v)}
                        className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer"
                        title="Edit Variant"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                        title="Delete Variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#639E1F] block">
                Catalog Variant
              </span>
              <h3 className="text-lg font-serif font-bold text-[#172B15]">
                {editingVariant ? `Edit Variant (${editingVariant.sku})` : "Create New Variant"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-500">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PROBIO-VAN-500G"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2 text-xs font-mono uppercase text-[#172B15]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-500">
                    Flavour / Spec
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vanilla Bean"
                    value={formData.flavour}
                    onChange={(e) =>
                      setFormData({ ...formData, flavour: e.target.value })
                    }
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2 text-xs text-[#172B15]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-500">
                    Pack Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500g / 30 Capsules"
                    value={formData.pack_size}
                    onChange={(e) =>
                      setFormData({ ...formData, pack_size: e.target.value })
                    }
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2 text-xs text-[#172B15]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-500">
                    Weight (Grams)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Leave blank if none"
                    value={formData.weight_grams}
                    onChange={(e) =>
                      setFormData({ ...formData, weight_grams: e.target.value })
                    }
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-4 py-2 text-xs text-[#172B15]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-500">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="₹ Price"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#172B15]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-500">
                    MRP
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="₹ MRP"
                    value={formData.mrp}
                    onChange={(e) =>
                      setFormData({ ...formData, mrp: e.target.value })
                    }
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#172B15]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-500">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Leave blank if none"
                    value={formData.cost_price}
                    onChange={(e) =>
                      setFormData({ ...formData, cost_price: e.target.value })
                    }
                    className="w-full bg-[#FAFAF7] border border-[#2D5A1E]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#172B15]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="variant_is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-[#2D5A1E] rounded accent-[#2D5A1E]"
                />
                <label
                  htmlFor="variant_is_active"
                  className="text-xs font-semibold text-[#172B15]"
                >
                  Active and purchasable in store
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#172B15] text-white text-xs font-bold uppercase hover:bg-[#2D5A1E] transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingVariant ? (
                    "Save Changes"
                  ) : (
                    "Create Variant"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}