// lib/services/productService.ts

import { apiClient } from "@/lib/api-client";
import { guestClient } from "@/lib/guest-client";
import { customerClient } from "@/lib/customer-client";

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
 * PUBLIC CATALOG QUERIES (guestClient with customerClient fallback)
 * =========================================================
 */

export async function getProducts(
  page = 1,
  pageSize = 50,
  search?: string,
  isActive?: boolean
): Promise<ProductListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (isActive !== undefined) {
    params.append("is_active", String(isActive));
  }
  if (search) {
    params.append("search", search);
  }

  const endpoint = `/api/v1/catalog/products?${params.toString()}`;

  try {
    const response = await guestClient.get<any>(endpoint);
    const data = response.data;
    if (Array.isArray(data)) {
      return { items: data, total: data.length, page: 1, page_size: pageSize };
    }
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || page,
      page_size: data.page_size || pageSize,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const retryResponse = await customerClient.get<any>(endpoint);
      const data = retryResponse.data;
      if (Array.isArray(data)) {
        return { items: data, total: data.length, page: 1, page_size: pageSize };
      }
      return {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        page_size: data.page_size || pageSize,
      };
    }
    throw error;
  }
}

export async function getProductByPublicId(publicId: string): Promise<Product> {
  const endpoint = `/api/v1/catalog/products/${publicId}`;

  try {
    const response = await guestClient.get<Product>(endpoint);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const retryResponse = await customerClient.get<Product>(endpoint);
      return retryResponse.data;
    }
    throw error;
  }
}

export async function getProductImages(productId: number | string): Promise<ProductImage[]> {
  try {
    const cleanId = typeof productId === "string" ? parseInt(productId, 10) : productId;
    if (!cleanId || isNaN(cleanId)) return [];

    const endpoint = `/api/v1/catalog/product-images?product_id=${cleanId}`;

    try {
      const response = await guestClient.get<ProductImage[]>(endpoint);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err: any) {
      if (err.response?.status === 401) {
        const retryResponse = await customerClient.get<ProductImage[]>(endpoint);
        return Array.isArray(retryResponse.data) ? retryResponse.data : [];
      }
      return [];
    }
  } catch (err) {
    console.error(`Failed to fetch images for product ID ${productId}:`, err);
    return [];
  }
}

export async function getCategories(page = 1, pageSize = 50): Promise<CategoryListResponse> {
  const endpoint = `/api/v1/catalog/categories?page=${page}&page_size=${pageSize}`;

  try {
    const response = await guestClient.get<any>(endpoint);
    const data = response.data;
    if (Array.isArray(data)) {
      return { items: data, total: data.length, page: 1, page_size: pageSize };
    }
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || page,
      page_size: data.page_size || pageSize,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const retryResponse = await customerClient.get<any>(endpoint);
      const data = retryResponse.data;
      if (Array.isArray(data)) {
        return { items: data, total: data.length, page: 1, page_size: pageSize };
      }
      return {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        page_size: data.page_size || pageSize,
      };
    }
    throw error;
  }
}

export async function getCategoryByPublicId(publicId: string): Promise<Category> {
  const endpoint = `/api/v1/catalog/categories/${publicId}`;

  try {
    const response = await guestClient.get<Category>(endpoint);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const retryResponse = await customerClient.get<Category>(endpoint);
      return retryResponse.data;
    }
    throw error;
  }
}

export async function getSubcategoriesByCategory(categoryPublicId: string): Promise<Subcategory[]> {
  try {
    if (!categoryPublicId) return [];
    const endpoint = `/api/v1/catalog/subcategories/category/${categoryPublicId}`;

    try {
      const response = await guestClient.get<any>(endpoint);
      const data = response.data;
      return Array.isArray(data) ? data : data.items || data.subcategories || [];
    } catch (err: any) {
      if (err.response?.status === 401) {
        const retryResponse = await customerClient.get<any>(endpoint);
        const data = retryResponse.data;
        return Array.isArray(data) ? data : data.items || data.subcategories || [];
      }
      return [];
    }
  } catch {
    return [];
  }
}

export async function getSubcategoryByPublicId(publicId: string): Promise<Subcategory> {
  const endpoint = `/api/v1/catalog/subcategories/${publicId}`;

  try {
    const response = await guestClient.get<Subcategory>(endpoint);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const retryResponse = await customerClient.get<Subcategory>(endpoint);
      return retryResponse.data;
    }
    throw error;
  }
}

/**
 * =========================================================
 * ADMIN CATALOG MUTATIONS (USES apiClient WITH ADMIN AUTH)
 * =========================================================
 */

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const response = await apiClient.post<Product>("/api/v1/catalog/products", payload);
  return response.data;
}

export async function updateProduct(
  publicId: string,
  payload: Partial<ProductPayload>
): Promise<Product> {
  const response = await apiClient.patch<Product>(
    `/api/v1/catalog/products/${publicId}`,
    payload
  );
  return response.data;
}

export async function deleteProduct(publicId: string): Promise<null> {
  const response = await apiClient.delete<null>(`/api/v1/catalog/products/${publicId}`);
  return response.data;
}

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

export async function getProductImageById(publicId: string): Promise<ProductImage> {
  const response = await apiClient.get<ProductImage>(
    `/api/v1/catalog/product-images/${publicId}`
  );
  return response.data;
}

export async function setPrimaryProductImage(publicId: string): Promise<ProductImage> {
  const response = await apiClient.patch<ProductImage>(
    `/api/v1/catalog/product-images/${publicId}/primary`
  );
  return response.data;
}

export async function deleteProductImage(publicId: string): Promise<void> {
  await apiClient.delete(`/api/v1/catalog/product-images/${publicId}`);
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const response = await apiClient.post<Category>("/api/v1/catalog/categories", payload);
  return response.data;
}

export async function updateCategory(
  publicId: string,
  payload: Partial<CategoryPayload>
): Promise<Category> {
  const response = await apiClient.patch<Category>(
    `/api/v1/catalog/categories/${publicId}`,
    payload
  );
  return response.data;
}

export async function deleteCategory(publicId: string): Promise<null> {
  const response = await apiClient.delete<null>(`/api/v1/catalog/categories/${publicId}`);
  return response.data;
}

export async function createSubcategory(payload: SubcategoryPayload): Promise<Subcategory> {
  const response = await apiClient.post<Subcategory>(
    "/api/v1/catalog/subcategories",
    payload
  );
  return response.data;
}

export async function updateSubcategory(
  publicId: string,
  payload: Partial<SubcategoryPayload>
): Promise<Subcategory> {
  const response = await apiClient.patch<Subcategory>(
    `/api/v1/catalog/subcategories/${publicId}`,
    payload
  );
  return response.data;
}

export async function deleteSubcategory(publicId: string): Promise<null> {
  const response = await apiClient.delete<null>(
    `/api/v1/catalog/subcategories/${publicId}`
  );
  return response.data;
}