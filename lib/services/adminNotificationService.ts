// lib/services/adminNotificationService.ts
import { apiClient } from "@/lib/api-client";

export interface AdminNotificationItem {
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

export interface AdminNotificationListResponse {
  items: AdminNotificationItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminNotificationUnreadCountResponse {
  unread_count: number;
}

export interface AdminNotificationReadResponse {
  message: string;
  notification: AdminNotificationItem;
}

export interface AdminNotificationReadAllResponse {
  message: string;
  updated_count: number;
}

/**
 * GET /api/v1/admin/notifications
 */
export async function getAdminNotifications(params?: {
  limit?: number;
  offset?: number;
  unread_only?: boolean;
}): Promise<AdminNotificationListResponse> {
  const res = await apiClient.get<AdminNotificationListResponse>(
    "/api/v1/admin/notifications",
    { params }
  );
  return res.data;
}

/**
 * GET /api/v1/admin/notifications/unread-count
 */
export async function getAdminUnreadNotificationCount(): Promise<number> {
  const res = await apiClient.get<AdminNotificationUnreadCountResponse>(
    "/api/v1/admin/notifications/unread-count"
  );
  return res.data.unread_count;
}

/**
 * GET /api/v1/admin/notifications/{public_id}
 */
export async function getAdminNotification(
  publicId: string
): Promise<AdminNotificationItem> {
  const res = await apiClient.get<AdminNotificationItem>(
    `/api/v1/admin/notifications/${publicId}`
  );
  return res.data;
}

/**
 * PATCH /api/v1/admin/notifications/{public_id}/read
 */
export async function markAdminNotificationAsRead(
  publicId: string
): Promise<AdminNotificationItem> {
  const res = await apiClient.patch<AdminNotificationReadResponse>(
    `/api/v1/admin/notifications/${publicId}/read`
  );
  return res.data.notification;
}

/**
 * PATCH /api/v1/admin/notifications/read-all
 */
export async function markAllAdminNotificationsAsRead(): Promise<number> {
  const res = await apiClient.patch<AdminNotificationReadAllResponse>(
    "/api/v1/admin/notifications/read-all"
  );
  return res.data.updated_count;
}