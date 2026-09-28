// lib/services/customerAddressService.ts

import { customerClient } from "@/lib/customer-client";

export interface CustomerAddressPayload {
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

export interface CustomerAddressResponse extends CustomerAddressPayload {
  public_id: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddressListResponse {
  addresses: CustomerAddressResponse[];
}

export async function getCustomerAddresses(): Promise<CustomerAddressResponse[]> {
  const response = await customerClient.get<CustomerAddressListResponse>(
    "/api/v1/shop/customer/addresses"
  );
  return response.data.addresses || [];
}

export async function createCustomerAddress(
  payload: CustomerAddressPayload
): Promise<CustomerAddressResponse> {
  const response = await customerClient.post<CustomerAddressResponse>(
    "/api/v1/shop/customer/addresses",
    {
      country: "India",
      is_default: false,
      ...payload,
    }
  );
  return response.data;
}

export async function updateCustomerAddress(
  publicId: string,
  payload: Partial<CustomerAddressPayload>
): Promise<CustomerAddressResponse> {
  const response = await customerClient.patch<CustomerAddressResponse>(
    `/api/v1/shop/customer/addresses/${publicId}`,
    payload
  );
  return response.data;
}

export async function deleteCustomerAddress(publicId: string): Promise<void> {
  await customerClient.delete(`/api/v1/shop/customer/addresses/${publicId}`);
}

export async function setDefaultCustomerAddress(
  publicId: string
): Promise<CustomerAddressResponse> {
  const response = await customerClient.post<CustomerAddressResponse>(
    `/api/v1/shop/customer/addresses/${publicId}/default`
  );
  return response.data;
}