// lib/services/customerNotificationService.ts
import { customerClient } from "@/lib/customer-client";

export interface CustomerNotificationItem {
  public_id: string;
  notification_type: string;
  title: string;
  message: string;
  entity_type?: string | null;
  entity_public_id?: string | null;
  data?: Record<string, any> | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface CustomerNotificationListResponse {
  items: CustomerNotificationItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface ReadAllResponse {
  updated_count: number;
}

/**
 * GET /api/v1/customer/notifications
 */
export async function getCustomerNotifications(params?: {
  unread_only?: boolean;
  limit?: number;
  offset?: number;
}): Promise<CustomerNotificationListResponse> {
  const res = await customerClient.get<CustomerNotificationListResponse>(
    "/api/v1/customer/notifications",
    { params }
  );
  return res.data;
}

/**
 * GET /api/v1/customer/notifications/unread-count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const res = await customerClient.get<UnreadCountResponse>(
    "/api/v1/customer/notifications/unread-count"
  );
  return res.data.unread_count;
}

/**
 * GET /api/v1/customer/notifications/{public_id}
 */
export async function getCustomerNotification(
  publicId: string
): Promise<CustomerNotificationItem> {
  const res = await customerClient.get<CustomerNotificationItem>(
    `/api/v1/customer/notifications/${publicId}`
  );
  return res.data;
}

/**
 * PATCH /api/v1/customer/notifications/{public_id}/read
 */
export async function markNotificationAsRead(
  publicId: string
): Promise<CustomerNotificationItem> {
  const res = await customerClient.patch<CustomerNotificationItem>(
    `/api/v1/customer/notifications/${publicId}/read`
  );
  return res.data;
}

/**
 * PATCH /api/v1/customer/notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<number> {
  const res = await customerClient.patch<ReadAllResponse>(
    "/api/v1/customer/notifications/read-all"
  );
  return res.data.updated_count;
}