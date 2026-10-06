// lib/services/paymentService.ts
import { customerClient } from "@/lib/customer-client";

export interface PaymentResponse {
  public_id: string;
  order_id: number;
  amount: string | number;
  currency: string;
  provider: string | null;
  provider_order_id: string | null;
  payment_session_id: string | null;
  provider_payment_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VerifyPaymentRequest {
  provider_payment_id?: string;
}

export interface RefundRequest {
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  public_id: string;
  payment_id: number;
  amount: string | number;
  currency: string;
  status: string;
  provider: string;
  provider_refund_id: string | null;
  idempotency_key: string;
  reason: string | null;
  failure_code: string | null;
  failure_message: string | null;
}

/**
 * 1. Initialize or retrieve Payment for an order in 'pending_payment' status.
 * POST /api/v1/shop/payments/from-order/{order_public_id}
 */
export async function createPaymentFromOrder(orderPublicId: string): Promise<PaymentResponse> {
  const response = await customerClient.post<PaymentResponse>(
    `/api/v1/shop/payments/from-order/${orderPublicId}`
  );
  return response.data;
}

/**
 * 2. Verify payment status with Cashfree.
 * POST /api/v1/shop/payments/{payment_public_id}/verify
 */
export async function verifyPayment(
  paymentPublicId: string,
  payload: VerifyPaymentRequest = {}
): Promise<PaymentResponse> {
  const response = await customerClient.post<PaymentResponse>(
    `/api/v1/shop/payments/${paymentPublicId}/verify`,
    payload
  );
  return response.data;
}

/**
 * 3. Initiate a refund request.
 * POST /api/v1/shop/payments/{payment_public_id}/refunds
 * Requires an Idempotency-Key header.
 */
export async function requestRefund(
  paymentPublicId: string,
  payload: RefundRequest = {},
  idempotencyKey?: string
): Promise<RefundResponse> {
  const key = idempotencyKey || (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()));
  const response = await customerClient.post<RefundResponse>(
    `/api/v1/shop/payments/${paymentPublicId}/refunds`,
    payload,
    {
      headers: {
        "Idempotency-Key": key,
      },
    }
  );
  return response.data;
}

/**
 * 4. Reconcile refund state with Cashfree.
 * POST /api/v1/shop/payments/refunds/{refund_public_id}/reconcile
 */
export async function reconcileRefund(refundPublicId: string): Promise<RefundResponse> {
  const response = await customerClient.post<RefundResponse>(
    `/api/v1/shop/payments/refunds/${refundPublicId}/reconcile`
  );
  return response.data;
}