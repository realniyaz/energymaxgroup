// lib/services/adminCustomerService.ts
import { apiClient } from "@/lib/api-client";

export interface CustomerAddressItem {
  public_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerSessionItem {
  public_id: string;
  created_at: string;
  last_used_at?: string | null;
  expires_at: string;
  is_active: boolean;
}

export interface CustomerListItem {
  public_id: string;
  username: string;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at?: string;
  total_orders?: number;
}

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  email_verified_count: number;
  phone_verified_count: number;
  new_customers_30d?: number;
  returning_customers?: number;
}

export interface CustomerDetailResponse extends CustomerListItem {
  addresses?: CustomerAddressItem[];
  sessions?: CustomerSessionItem[];
}

export interface CustomerListResponse {
  items: CustomerListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * GET /api/v1/admin/customers/stats
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  const res = await apiClient.get<CustomerStats>("/api/v1/admin/customers/stats");
  return res.data;
}

/**
 * GET /api/v1/admin/customers
 */
export async function getCustomers(params?: {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
}): Promise<CustomerListResponse> {
  const res = await apiClient.get<CustomerListResponse | CustomerListItem[]>(
    "/api/v1/admin/customers",
    { params }
  );

  if (Array.isArray(res.data)) {
    return {
      items: res.data,
      total: res.data.length,
      page: 1,
      page_size: res.data.length,
      total_pages: 1,
    };
  }

  return res.data;
}

/**
 * GET /api/v1/admin/customers/new
 */
export async function getNewCustomers(params?: {
  page?: number;
  page_size?: number;
}): Promise<CustomerListItem[]> {
  const res = await apiClient.get<CustomerListItem[] | { items: CustomerListItem[] }>(
    "/api/v1/admin/customers/new",
    { params }
  );
  return Array.isArray(res.data) ? res.data : (res.data as any).items || [];
}

/**
 * GET /api/v1/admin/customers/returning
 */
export async function getReturningCustomers(params?: {
  page?: number;
  page_size?: number;
}): Promise<CustomerListItem[]> {
  const res = await apiClient.get<CustomerListItem[] | { items: CustomerListItem[] }>(
    "/api/v1/admin/customers/returning",
    { params }
  );
  return Array.isArray(res.data) ? res.data : (res.data as any).items || [];
}

/**
 * GET /api/v1/admin/customers/{customer_public_id}
 */
export async function getCustomerById(
  customerPublicId: string
): Promise<CustomerDetailResponse> {
  const res = await apiClient.get<CustomerDetailResponse>(
    `/api/v1/admin/customers/${customerPublicId}`
  );
  return res.data;
}

/**
 * DELETE /api/v1/admin/customers/{customer_public_id}
 */
export async function deleteCustomer(customerPublicId: string): Promise<null> {
  const res = await apiClient.delete<null>(
    `/api/v1/admin/customers/${customerPublicId}`
  );
  return res.data;
}