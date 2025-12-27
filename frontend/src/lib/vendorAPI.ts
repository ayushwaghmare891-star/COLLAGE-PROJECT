import { API_BASE_URL, getHeaders } from './api';

const VENDOR_API_BASE = `${API_BASE_URL}/vendor/dashboard`;

// Get vendor dashboard
export const getVendorDashboard = async () => {
  const response = await fetch(`${VENDOR_API_BASE}/dashboard`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard');
  return response.json();
};

// Get vendor's offers
export const getVendorOffers = async (page = 1, limit = 10, status = 'all') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status,
  });
  
  const response = await fetch(`${VENDOR_API_BASE}/offers?${params}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch offers');
  return response.json();
};

// Create a new offer
export const createOffer = async (offerData: any) => {
  const response = await fetch(`${VENDOR_API_BASE}/offers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(offerData),
  });
  if (!response.ok) throw new Error('Failed to create offer');
  return response.json();
};

// Update an offer
export const updateOffer = async (offerId: string, offerData: any) => {
  const response = await fetch(`${VENDOR_API_BASE}/offers/${offerId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(offerData),
  });
  if (!response.ok) throw new Error('Failed to update offer');
  return response.json();
};

// Delete an offer
export const deleteOffer = async (offerId: string) => {
  const response = await fetch(`${VENDOR_API_BASE}/offers/${offerId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete offer');
  return response.json();
};

// Get offer analytics
export const getOfferAnalytics = async (offerId: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(
    `${VENDOR_API_BASE}/offers/${offerId}/analytics?${params}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

// Get vendor analytics (all offers)
export const getVendorAnalytics = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(`${VENDOR_API_BASE}/analytics?${params}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

// Get vendor profile
export const getVendorProfile = async () => {
  const response = await fetch(`${VENDOR_API_BASE}/profile`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

// Update vendor profile
export const updateVendorProfile = async (profileData: any) => {
  const response = await fetch(`${VENDOR_API_BASE}/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};
