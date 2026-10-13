// lib/services/forgotPasswordService.ts
import { customerClient } from "@/lib/customer-client";

export type RecoveryMethod = "username" | "email" | "phone";

export interface ForgotPasswordRequest {
  method: RecoveryMethod;
  identifier: string;
}

export interface ForgotPasswordOTPResponse {
  message: string;
}

export interface ForgotPasswordConfirmOTPRequest {
  method: RecoveryMethod;
  identifier: string;
  code: string;
}

export interface ForgotPasswordConfirmOTPResponse {
  message: string;
  reset_token: string;
  expires_at: string;
}

export interface ForgotPasswordResetRequest {
  reset_token: string;
  new_password: string;
}

export interface ForgotPasswordResetResponse {
  message: string;
}

/**
 * 1. POST /api/v1/shop/customer/auth/forgot-password/verify
 * Dispatches a 6-digit recovery code to the registered email address.
 */
export async function requestPasswordResetOTP(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordOTPResponse> {
  const response = await customerClient.post<ForgotPasswordOTPResponse>(
    "/api/v1/shop/customer/auth/forgot-password/verify",
    {
      method: payload.method.trim().toLowerCase(),
      identifier: payload.identifier.trim(),
    }
  );
  return response.data;
}

/**
 * 2. POST /api/v1/shop/customer/auth/forgot-password/resend
 * Re-triggers recovery OTP (subject to cooldown).
 */
export async function resendPasswordResetOTP(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordOTPResponse> {
  const response = await customerClient.post<ForgotPasswordOTPResponse>(
    "/api/v1/shop/customer/auth/forgot-password/resend",
    {
      method: payload.method.trim().toLowerCase(),
      identifier: payload.identifier.trim(),
    }
  );
  return response.data;
}

/**
 * 3. POST /api/v1/shop/customer/auth/forgot-password/confirm-otp
 * Validates the 6-digit OTP code and exchanges it for a single-use reset_token.
 */
export async function confirmPasswordResetOTP(
  payload: ForgotPasswordConfirmOTPRequest
): Promise<ForgotPasswordConfirmOTPResponse> {
  const response = await customerClient.post<ForgotPasswordConfirmOTPResponse>(
    "/api/v1/shop/customer/auth/forgot-password/confirm-otp",
    {
      method: payload.method.trim().toLowerCase(),
      identifier: payload.identifier.trim(),
      code: payload.code.trim(),
    }
  );
  return response.data;
}

/**
 * 4. POST /api/v1/shop/customer/auth/forgot-password/reset
 * Sets a new password using the reset_token and revokes active customer sessions.
 */
export async function resetCustomerPassword(
  payload: ForgotPasswordResetRequest
): Promise<ForgotPasswordResetResponse> {
  const response = await customerClient.post<ForgotPasswordResetResponse>(
    "/api/v1/shop/customer/auth/forgot-password/reset",
    {
      reset_token: payload.reset_token.trim(),
      new_password: payload.new_password,
    }
  );
  return response.data;
}