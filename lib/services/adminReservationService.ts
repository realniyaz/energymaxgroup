// lib/services/adminReservationService.ts
import { apiClient } from "@/lib/api-client";

export interface ReservationItem {
  id: number;
  warehouse_id: number;
  variant_id: number;
  quantity: string | number;
  status: "ACTIVE" | "CONFIRMED" | "RELEASED" | "EXPIRED" | string;
  reference_type: string;
  reference_id: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationListResponse {
  items: ReservationItem[];
  total: number;
}

export interface ReservationCreatePayload {
  warehouse_id: string; // Warehouse public UUID
  variant_id: string;   // Variant public UUID
  quantity: number;
  reference_type: string;
  reference_id: string;
  idempotency_key?: string | null;
}

export interface ReservationFilterParams {
  warehouse_id?: string;
  variant_id?: string;
  status?: string;
  reference_type?: string;
  reference_id?: string;
  limit?: number;
  offset?: number;
}

// 1. List reservations
export async function getAdminReservations(
  params?: ReservationFilterParams
): Promise<ReservationListResponse> {
  const res = await apiClient.get<ReservationListResponse>(
    "/api/v1/admin/inventory/reservations",
    { params }
  );
  return res.data;
}

// 2. Get single reservation
export async function getAdminReservation(
  reservationId: number
): Promise<ReservationItem> {
  const res = await apiClient.get<ReservationItem>(
    `/api/v1/admin/inventory/reservations/${reservationId}`
  );
  return res.data;
}

// 3. Create reservation
export async function createAdminReservation(
  payload: ReservationCreatePayload
): Promise<ReservationItem> {
  const res = await apiClient.post<ReservationItem>(
    "/api/v1/admin/inventory/reservations",
    payload
  );
  return res.data;
}

// 4. Release reservation (releases reserved units back to available)
export async function releaseAdminReservation(
  reservationId: number
): Promise<ReservationItem> {
  const res = await apiClient.post<ReservationItem>(
    `/api/v1/admin/inventory/reservations/${reservationId}/release`
  );
  return res.data;
}

// 5. Confirm reservation (deducts on_hand and reserves permanently for fulfillment)
export async function confirmAdminReservation(
  reservationId: number
): Promise<ReservationItem> {
  const res = await apiClient.post<ReservationItem>(
    `/api/v1/admin/inventory/reservations/${reservationId}/confirm`
  );
  return res.data;
}