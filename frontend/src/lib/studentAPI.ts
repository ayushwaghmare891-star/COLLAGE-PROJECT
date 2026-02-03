import { API_BASE_URL, getHeaders } from './api';

const STUDENT_API_BASE = `${API_BASE_URL}/student/dashboard`;
const COUPON_API_BASE = `${API_BASE_URL}/coupons`;

// Get student dashboard
export const getStudentDashboard = async () => {
  const response = await fetch(`${STUDENT_API_BASE}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard');
  return response.json();
};

// Get student's active discounts
export const getStudentDiscounts = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${STUDENT_API_BASE}/discounts?page=${page}&limit=${limit}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch discounts');
  return response.json();
};

// Get all active coupons for student
export const getActiveCoupons = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${STUDENT_API_BASE}/coupons?page=${page}&limit=${limit}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch coupons');
  return response.json();
};

// Get offers by category
export const getOffersByCategory = async (category: string, page = 1, limit = 10) => {
  const response = await fetch(
    `${STUDENT_API_BASE}/offers/category/${category}?page=${page}&limit=${limit}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch offers');
  return response.json();
};

// Search offers
export const searchOffers = async (query?: string, category?: string, page = 1, limit = 10) => {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (category) params.append('category', category);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await fetch(`${STUDENT_API_BASE}/offers/search?${params}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to search offers');
  return response.json();
};

// Redeem an offer
export const redeemOffer = async (offerId: string, redemptionType: 'online' | 'in-store') => {
  const response = await fetch(`${STUDENT_API_BASE}/offers/redeem`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ offerId, redemptionType }),
  });
  if (!response.ok) throw new Error('Failed to redeem offer');
  return response.json();
};

// Save an offer
export const saveOffer = async (offerId: string) => {
  const response = await fetch(`${STUDENT_API_BASE}/offers/save`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ offerId }),
  });
  if (!response.ok) throw new Error('Failed to save offer');
  return response.json();
};

// Unsave an offer
export const unsaveOffer = async (offerId: string) => {
  const response = await fetch(`${STUDENT_API_BASE}/offers/unsave`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ offerId }),
  });
  if (!response.ok) throw new Error('Failed to unsave offer');
  return response.json();
};

// Get saved offers
export const getSavedOffers = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${STUDENT_API_BASE}/offers/saved?page=${page}&limit=${limit}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch saved offers');
  return response.json();
};

// Get verification status
export const getVerificationStatus = async () => {
  const response = await fetch(`${STUDENT_API_BASE}/verification-status`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch verification status');
  return response.json();
};
