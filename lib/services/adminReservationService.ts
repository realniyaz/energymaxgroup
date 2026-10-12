import { apiClient } from "@/lib/api-client";

export type ReservationStatus = "ACTIVE" | "CONFIRMED" | "RELEASED" | "EXPIRED" | "CANCELLED";

export interface ReservationItem {
  id: number;
  public_id?: string;
  reference_id: string;
  status: ReservationStatus;
  product_id?: number;
  product_name?: string;
  variant_id?: number;
  variant_public_id?: string;
  sku?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  warehouse_code?: string;
  quantity: number | string;
  expires_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ReservationListResponse {
  items: ReservationItem[];
  total: number;
  page?: number;
  page_size?: number;
}

export interface GetReservationsParams {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  warehouse_id?: number;
}

export interface CreateReservationPayload {
  warehouse_id: number | string;
  variant_id: number | string;
  quantity: number;
  reference_type: string;
  reference_id: string;
  expires_at?: string | null;
  idempotency_key?: string;
}

export async function getAdminReservations(
  params?: GetReservationsParams
): Promise<ReservationListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.status) query.append("status", params.status);
  if (params?.warehouse_id) query.append("warehouse_id", String(params.warehouse_id));

  const url = `/api/v1/admin/inventory/reservations${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiClient.get<any>(url);
  const data = response.data;

  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  return {
    items: data.items || [],
    total: data.total || 0,
    page: data.page,
    page_size: data.page_size || params?.limit,
  };
}

export async function createAdminReservation(
  payload: CreateReservationPayload
): Promise<ReservationItem> {
  const response = await apiClient.post<ReservationItem>(
    "/api/v1/admin/inventory/reservations",
    payload
  );
  return response.data;
}

export async function confirmAdminReservation(
  reservationId: number | string,
  adminOverride: boolean = true
): Promise<ReservationItem> {
  const response = await apiClient.post<ReservationItem>(
    `/api/v1/admin/inventory/reservations/${reservationId}/confirm?admin_override=${adminOverride}`
  );
  return response.data;
}

export async function releaseAdminReservation(
  reservationId: number | string
): Promise<ReservationItem> {
  const response = await apiClient.post<ReservationItem>(
    `/api/v1/admin/inventory/reservations/${reservationId}/release`
  );
  return response.data;
}