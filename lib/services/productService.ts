// lib/services/productService.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://energymax-backend.onrender.com";

/**
 * ============================================================================
 * TYPE DEFINITIONS (Synchronized 1:1 with FastAPI Pydantic Models)
 * ============================================================================
 */

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

export interface ProductPayload {
  subcategory_id: number;
  name: string;
  slug: string;
  price: number;
  mrp?: number | null;
  cost_price?: number | null;
  short_description?: string | null;
  description?: string | null;
  brand_name?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export interface Product extends ProductPayload {
  id: number;
  public_id: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
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
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface Category extends CategoryPayload {
  id?: number;
  category_id?: number;
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
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface Subcategory {
  id: number;
  public_id: string;
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubcategoryListResponse {
  items: Subcategory[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * ============================================================================
 * HTTP CLIENT CORE (Token-aware, Error-surfacing)
 * ============================================================================
 */

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  
  // 1. Direct localStorage keys
  const directToken = 
    localStorage.getItem("access_token") ||
    localStorage.getItem("admin_access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("admin_access_token");

  if (directToken) return directToken;

  // 2. Fallback to auth cookies if tokens are stored in cookies
  try {
    const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
  } catch {
    // ignore cookie read errors
  }

  return null;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
    ...(options.headers as Record<string, string>),
  };

  // Attach auth bearer header if token exists
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Set application/json only when sending JSON bodies (skip for FormData)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errorJson = await response.json();
      errorDetail =
        typeof errorJson.detail === "string"
          ? errorJson.detail
          : JSON.stringify(errorJson.detail || errorJson);
    } catch {
      errorDetail = await response.text();
    }
    console.error(`FastAPI Error [${response.status}] at ${endpoint}:`, errorDetail);
    throw new Error(errorDetail || `API Error [${response.status}]: ${response.statusText}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

/**
 * ============================================================================
 * PRODUCT CATALOG ENDPOINTS (/api/v1/catalog/products)
 * ============================================================================
 */

export async function getProducts(
  page: number = 1,
  pageSize: number = 50,
  subcategoryId?: number,
  isActive?: boolean
): Promise<ProductListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (subcategoryId !== undefined && subcategoryId !== null) {
    params.append("subcategory_id", String(subcategoryId));
  }

  if (isActive !== undefined && isActive !== null) {
    params.append("is_active", String(isActive));
  }

  const data = await fetchApi<any>(`/api/v1/catalog/products?${params.toString()}`);

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page,
      page_size: pageSize,
    };
  }

  return {
    items: data.items || [],
    total: data.total ?? (data.items ? data.items.length : 0),
    page: data.page ?? page,
    page_size: data.page_size ?? pageSize,
  };
}

export async function getProductByPublicId(publicId: string): Promise<Product> {
  return fetchApi<Product>(`/api/v1/catalog/products/${publicId}`);
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  return fetchApi<Product>("/api/v1/catalog/products", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      price: Number(payload.price),
      mrp: payload.mrp ? Number(payload.mrp) : null,
      cost_price: payload.cost_price ? Number(payload.cost_price) : null,
      display_order: Number(payload.display_order || 0),
      subcategory_id: Number(payload.subcategory_id),
    }),
  });
}

export async function updateProduct(
  publicId: string,
  payload: Partial<ProductPayload>
): Promise<Product> {
  const cleanPayload: Record<string, any> = { ...payload };
  if (cleanPayload.price !== undefined) cleanPayload.price = Number(cleanPayload.price);
  if (cleanPayload.mrp !== undefined) cleanPayload.mrp = cleanPayload.mrp ? Number(cleanPayload.mrp) : null;
  if (cleanPayload.cost_price !== undefined) cleanPayload.cost_price = cleanPayload.cost_price ? Number(cleanPayload.cost_price) : null;

  return fetchApi<Product>(`/api/v1/catalog/products/${publicId}`, {
    method: "PATCH",
    body: JSON.stringify(cleanPayload),
  });
}

export async function deleteProduct(publicId: string): Promise<null> {
  return fetchApi<null>(`/api/v1/catalog/products/${publicId}`, {
    method: "DELETE",
  });
}

/**
 * ============================================================================
 * PRODUCT IMAGE PIPELINE (/api/v1/catalog/product-images)
 * ============================================================================
 */

export async function uploadProductImage(
  productId: number,
  file: File,
  altText?: string,
  displayOrder: number = 0,
  isPrimary: boolean = false
): Promise<ProductImage> {
  const formData = new FormData();
  formData.append("product_id", String(productId));
  formData.append("file", file);
  if (altText) formData.append("alt_text", altText);
  formData.append("display_order", String(displayOrder));
  formData.append("is_primary", String(isPrimary));

  return fetchApi<ProductImage>("/api/v1/catalog/product-images", {
    method: "POST",
    body: formData,
  });
}

// Backward-compatible alias for existing components
export async function createProductImage(payload: {
  product_id: number;
  file?: File;
  image_url?: string;
  alt_text?: string;
  display_order?: number;
  is_primary?: boolean;
}): Promise<ProductImage> {
  if (payload.file) {
    return uploadProductImage(
      payload.product_id,
      payload.file,
      payload.alt_text,
      payload.display_order ?? 0,
      payload.is_primary ?? false
    );
  }
  throw new Error("Direct binary file upload required by backend Cloudinary service.");
}

export async function getProductImages(productId: number): Promise<ProductImage[]> {
  if (!productId) return [];
  return fetchApi<ProductImage[]>(
    `/api/v1/catalog/product-images?product_id=${productId}`
  );
}

export async function getProductImageById(publicId: string): Promise<ProductImage> {
  return fetchApi<ProductImage>(`/api/v1/catalog/product-images/${publicId}`);
}

export async function setPrimaryProductImage(publicId: string): Promise<ProductImage> {
  return fetchApi<ProductImage>(`/api/v1/catalog/product-images/${publicId}/primary`, {
    method: "PATCH",
  });
}

export async function deleteProductImage(publicId: string): Promise<null> {
  return fetchApi<null>(`/api/v1/catalog/product-images/${publicId}`, {
    method: "DELETE",
  });
}

/**
 * ============================================================================
 * CATEGORIES ENDPOINTS (/api/v1/catalog/categories)
 * ============================================================================
 */

export async function getCategories(
  page: number = 1,
  pageSize: number = 50,
  isActive: boolean = true
): Promise<CategoryListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    is_active: String(isActive),
  });

  const data = await fetchApi<any>(`/api/v1/catalog/categories?${params.toString()}`);

  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, page_size: pageSize };
  }

  return {
    items: data.items || [],
    total: data.total ?? (data.items ? data.items.length : 0),
    page: data.page ?? page,
    page_size: data.page_size ?? pageSize,
  };
}

export async function getCategoryByPublicId(publicId: string): Promise<Category> {
  return fetchApi<Category>(`/api/v1/catalog/categories/${publicId}`);
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  return fetchApi<Category>("/api/v1/catalog/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  publicId: string,
  payload: Partial<CategoryPayload>
): Promise<Category> {
  return fetchApi<Category>(`/api/v1/catalog/categories/${publicId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(publicId: string): Promise<null> {
  return fetchApi<null>(`/api/v1/catalog/categories/${publicId}`, {
    method: "DELETE",
  });
}

/**
 * ============================================================================
 * SUBCATEGORIES ENDPOINTS (/api/v1/catalog/subcategories)
 * ============================================================================
 */

export async function getSubcategoriesByCategory(
  categoryPublicId: string,
  activeOnly: boolean = true
): Promise<Subcategory[]> {
  if (!categoryPublicId) return [];
  try {
    const data = await fetchApi<any>(
      `/api/v1/catalog/subcategories/category/${categoryPublicId}?active_only=${activeOnly}`
    );
    return Array.isArray(data) ? data : data.items || [];
  } catch (err) {
    console.warn(`Could not load subcategories for category [${categoryPublicId}]:`, err);
    return [];
  }
}

export async function getSubcategoryByPublicId(publicId: string): Promise<Subcategory> {
  return fetchApi<Subcategory>(`/api/v1/catalog/subcategories/${publicId}`);
}

export async function createSubcategory(payload: SubcategoryPayload): Promise<Subcategory> {
  return fetchApi<Subcategory>("/api/v1/catalog/subcategories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSubcategory(
  publicId: string,
  payload: Partial<SubcategoryPayload>
): Promise<Subcategory> {
  return fetchApi<Subcategory>(`/api/v1/catalog/subcategories/${publicId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSubcategory(publicId: string): Promise<null> {
  return fetchApi<null>(`/api/v1/catalog/subcategories/${publicId}`, {
    method: "DELETE",
  });
}