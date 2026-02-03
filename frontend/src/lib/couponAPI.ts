import { API_BASE_URL, getHeaders } from './api';

const COUPON_API_BASE = `${API_BASE_URL}/coupons`;

// Create a new coupon
export const createCoupon = async (couponData: any) => {
  const response = await fetch(`${COUPON_API_BASE}/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(couponData),
  });
  if (!response.ok) throw new Error('Failed to create coupon');
  return response.json();
};

// Update a coupon
export const updateCoupon = async (couponId: string, updates: any) => {
  const response = await fetch(`${COUPON_API_BASE}/update/${couponId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update coupon');
  return response.json();
};

// Delete a coupon
export const deleteCoupon = async (couponId: string) => {
  const response = await fetch(`${COUPON_API_BASE}/${couponId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete coupon');
  return response.json();
};

// Redeem a coupon
export const redeemCoupon = async (code: string) => {
  const response = await fetch(`${COUPON_API_BASE}/redeem`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error('Failed to redeem coupon');
  return response.json();
};

// Get coupon by code (public)
export const getCouponByCode = async (code: string) => {
  const response = await fetch(`${COUPON_API_BASE}/code/${code}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch coupon');
  return response.json();
};

// Get coupon statistics
export const getCouponStats = async () => {
  const response = await fetch(`${COUPON_API_BASE}/stats`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch coupon statistics');
  return response.json();
};

// Get redemption details for a specific coupon
export const getCouponRedemptions = async (couponId: string) => {
  const response = await fetch(`${COUPON_API_BASE}/${couponId}/redemptions`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch coupon redemptions');
  return response.json();
};
