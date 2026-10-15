// lib/services/adminAnalyticsService.ts
import { apiClient } from "@/lib/api-client";

export interface AnalyticsMetrics {
  orders: number;
  order_value_total: string | number;
  gross_revenue: string | number;
  refunds: string | number;
  net_revenue: string | number;
  average_order_value: string | number;
}

export interface AnalyticsOverviewResponse {
  current: AnalyticsMetrics;
  previous: AnalyticsMetrics;
}

export interface AnalyticsOverviewParams {
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
}

/**
 * GET /api/v1/admin/analytics/overview
 * Requires admin session token with 'analytics.view' permission
 */
export async function getAdminAnalyticsOverview(
  params: AnalyticsOverviewParams
): Promise<AnalyticsOverviewResponse> {
  const res = await apiClient.get<AnalyticsOverviewResponse>(
    "/api/v1/admin/analytics/overview",
    { params }
  );
  return res.data;
}

/**
 * Helper to calculate period-over-period percentage growth
 */
export function calculateDelta(
  current: string | number,
  previous: string | number
): { deltaPercent: number; isPositive: boolean } {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;

  if (prev === 0) {
    return {
      deltaPercent: curr > 0 ? 100 : 0,
      isPositive: curr >= 0,
    };
  }

  const delta = ((curr - prev) / prev) * 100;
  return {
    deltaPercent: Math.abs(Math.round(delta * 10) / 10),
    isPositive: delta >= 0,
  };
}