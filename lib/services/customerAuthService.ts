// lib/services/customerAuthService.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://energymax-backend.onrender.com";

export interface CustomerResponse {
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
}

export interface CustomerAuthResponse {
  customer: CustomerResponse;
  session_token: string;
}

export interface CustomerOTPResponse {
  message: string;
  expires_at: string | null;
}

export interface CustomerRegisterPayload {
  username: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface CustomerLoginPayload {
  identifier: string;
  password: string;
}

export interface CustomerOTPRequestPayload {
  destination: string;
  channel: "email" | "sms"; // SMS will raise 400 until enabled on backend
  purpose: "login" | "registration" | "password_reset";
}

export interface CustomerOTPVerifyPayload {
  destination: string;
  channel: "email" | "sms";
  purpose: "login" | "registration" | "password_reset";
  code: string;
}

async function requestCustomerApi<T>(
  endpoint: string,
  options: RequestInit = {},
  sessionToken?: string | null
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token =
    sessionToken ??
    (typeof window !== "undefined"
      ? localStorage.getItem("customer_session_token")
      : null);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { "X-Customer-Session-Token": token } : {}),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errorDetail = "Authentication request failed";
    try {
      const data = await res.json();
      if (data.detail) {
        errorDetail =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      } else if (data.message) {
        errorDetail = data.message;
      }
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail || `HTTP Error ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

/**
 * Register a new direct customer.
 * POST /api/v1/shop/customer/auth/register
 */
export async function registerCustomer(
  payload: CustomerRegisterPayload
): Promise<CustomerAuthResponse> {
  return requestCustomerApi<CustomerAuthResponse>(
    "/api/v1/shop/customer/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Password-based sign in for direct customers.
 * POST /api/v1/shop/customer/auth/login
 */
export async function loginCustomer(
  payload: CustomerLoginPayload
): Promise<CustomerAuthResponse> {
  return requestCustomerApi<CustomerAuthResponse>(
    "/api/v1/shop/customer/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Terminate the customer session using the X-Customer-Session-Token header.
 * POST /api/v1/shop/customer/auth/logout
 */
export async function logoutCustomer(): Promise<{ message: string }> {
  return requestCustomerApi<{ message: string }>(
    "/api/v1/shop/customer/auth/logout",
    {
      method: "POST",
    }
  );
}

/**
 * Request a 6-digit verification code.
 * POST /api/v1/shop/customer/auth/otp/request
 */
export async function requestCustomerOTP(
  payload: CustomerOTPRequestPayload
): Promise<CustomerOTPResponse> {
  return requestCustomerApi<CustomerOTPResponse>(
    "/api/v1/shop/customer/auth/otp/request",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Verify OTP and receive immediate customer session.
 * POST /api/v1/shop/customer/auth/otp/verify
 */
export async function verifyCustomerOTP(
  payload: CustomerOTPVerifyPayload
): Promise<CustomerAuthResponse> {
  return requestCustomerApi<CustomerAuthResponse>(
    "/api/v1/shop/customer/auth/otp/verify",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}