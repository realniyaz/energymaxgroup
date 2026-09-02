// lib/services/productService.ts

import { apiClient } from "@/lib/api-client";

/**
 * =========================================================
 * SCHEMAS & TYPES
 * =========================================================
 */

export interface ProductPayload {
  subcategory_id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  brand_name?: string;
  price?: number;
  mrp?: number;
  cost_price?: number;
  seo_title?: string;
  seo_description?: string;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

export interface ProductImage {
  public_id: string;
  product_id: number;
  image_url: string;
  cloudinary_public_id: string;
  alt_text?: string | null;
  display_order: number;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product extends ProductPayload {
  id: number;
  public_id: string;
  published_at?: string;
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface Category extends CategoryPayload {
  id: number;
  public_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
  page: number;
  page_size: number;
}

export interface SubcategoryPayload {
  category_public_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface Subcategory extends Omit<SubcategoryPayload, "category_public_id"> {
  id: number;
  public_id: string;
  category_id: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * =========================================================
 * PRODUCT CATALOG ENDPOINTS
 * =========================================================
 */

export async function getProducts(page = 1, pageSize = 50): Promise<ProductListResponse> {
  const response = await apiClient.get<any>(`/api/v1/catalog/products?page=${page}&page_size=${pageSize}`);
  const data = response.data;
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, page_size: pageSize };
  }
  return data;
}

export async function getProductByPublicId(publicId: string): Promise<Product> {
  const response = await apiClient.get<Product>(`/api/v1/catalog/products/${publicId}`);
  return response.data;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const response = await apiClient.post<Product>("/api/v1/catalog/products", payload);
  return response.data;
}

export async function updateProduct(publicId: string, payload: Partial<ProductPayload>): Promise<Product> {
  const response = await apiClient.patch<Product>(`/api/v1/catalog/products/${publicId}`, payload);
  return response.data;
}

export async function deleteProduct(publicId: string): Promise<null> {
  const response = await apiClient.delete<null>(`/api/v1/catalog/products/${publicId}`);
  return response.data;
}

/**
 * =========================================================
 * PRODUCT IMAGES ENDPOINTS (MULTIPART & NUMERIC ID SUPPORT)
 * =========================================================
 */

/**
 * Uploads a binary file to FastAPI with Cloudinary processing.
 * Omits manual Content-Type headers so Axios auto-injects the multipart boundary.
 */
export async function uploadProductImage(
  productId: number | string,
  file: File,
  altText?: string,
  isPrimary: boolean = false,
  displayOrder: number = 0
): Promise<ProductImage> {
  const cleanId = typeof productId === "string" ? parseInt(productId, 10) : productId;
  if (!cleanId || isNaN(cleanId)) {
    throw new Error(`Invalid numeric product ID provided for image upload: ${productId}`);
  }

  const formData = new FormData();
  formData.append("product_id", String(cleanId));
  formData.append("file", file);
  if (altText) formData.append("alt_text", altText);
  formData.append("is_primary", isPrimary ? "true" : "false");
  formData.append("display_order", String(displayOrder));

  const response = await apiClient.post<ProductImage>(
    "/api/v1/catalog/product-images",
    formData
  );

  return response.data;
}

/**
 * Lists all active images for a given integer product ID.
 */
export async function getProductImages(productId: number | string): Promise<ProductImage[]> {
  try {
    const cleanId = typeof productId === "string" ? parseInt(productId, 10) : productId;
    if (!cleanId || isNaN(cleanId)) return [];

    const response = await apiClient.get<ProductImage[]>(
      `/api/v1/catalog/product-images?product_id=${cleanId}`
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error(`Failed to fetch images for product ID ${productId}:`, err);
    return [];
  }
}

/**
 * Retrieves a single product image by its public_id
 */
export async function getProductImageById(publicId: string): Promise<ProductImage> {
  const response = await apiClient.get<ProductImage>(`/api/v1/catalog/product-images/${publicId}`);
  return response.data;
}

/**
 * Sets a specific image as the primary cover image
 */
export async function setPrimaryProductImage(publicId: string): Promise<ProductImage> {
  const response = await apiClient.patch<ProductImage>(
    `/api/v1/catalog/product-images/${publicId}/primary`
  );
  return response.data;
}

/**
 * Deletes an image record from both DB and Cloudinary
 */
export async function deleteProductImage(publicId: string): Promise<void> {
  await apiClient.delete(`/api/v1/catalog/product-images/${publicId}`);
}

/**
 * =========================================================
 * CATEGORIES ENDPOINTS
 * =========================================================
 */

export async function getCategories(page = 1, pageSize = 50): Promise<CategoryListResponse> {
  const response = await apiClient.get<any>(`/api/v1/catalog/categories?page=${page}&page_size=${pageSize}`);
  const data = response.data;
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, page_size: pageSize };
  }
  return data;
}

export async function getCategoryByPublicId(publicId: string): Promise<Category> {
  const response = await apiClient.get<Category>(`/api/v1/catalog/categories/${publicId}`);
  return response.data;
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const response = await apiClient.post<Category>("/api/v1/catalog/categories", payload);
  return response.data;
}

export async function updateCategory(publicId: string, payload: Partial<CategoryPayload>): Promise<Category> {
  const response = await apiClient.patch<Category>(`/api/v1/catalog/categories/${publicId}`, payload);
  return response.data;
}

export async function deleteCategory(publicId: string): Promise<null> {
  const response = await apiClient.delete<null>(`/api/v1/catalog/categories/${publicId}`);
  return response.data;
}

/**
 * =========================================================
 * SUBCATEGORIES ENDPOINTS
 * =========================================================
 */

export async function getSubcategoriesByCategory(categoryPublicId: string): Promise<Subcategory[]> {
  try {
    if (!categoryPublicId) return [];
    const response = await apiClient.get<any>(`/api/v1/catalog/subcategories/category/${categoryPublicId}`);
    const data = response.data;
    return Array.isArray(data) ? data : data.items || data.subcategories || [];
  } catch {
    return [];
  }
}

export async function getSubcategoryByPublicId(publicId: string): Promise<Subcategory> {
  const response = await apiClient.get<Subcategory>(`/api/v1/catalog/subcategories/${publicId}`);
  return response.data;
}

export async function createSubcategory(payload: SubcategoryPayload): Promise<Subcategory> {
  const response = await apiClient.post<Subcategory>("/api/v1/catalog/subcategories", payload);
  return response.data;
}

export async function updateSubcategory(publicId: string, payload: Partial<SubcategoryPayload>): Promise<Subcategory> {
  const response = await apiClient.patch<Subcategory>(`/api/v1/catalog/subcategories/${publicId}`, payload);
  return response.data;
}

export async function deleteSubcategory(publicId: string): Promise<null> {
  const response = await apiClient.delete<null>(`/api/v1/catalog/subcategories/${publicId}`);
  return response.data;
}