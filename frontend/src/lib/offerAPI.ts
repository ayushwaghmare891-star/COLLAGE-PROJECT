const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface OfferData {
  id?: string;
  title: string;
  description: string;
  offerType: string;
  offerValue: number;
  category: string;
  startDate: string;
  endDate: string;
  terms?: string;
  image?: string;
  code?: string;
}

// Fetch vendor's own offers
export const fetchVendorOffers = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/offers/my-offers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch offers');
  }

  return response.json();
};

// Fetch all active offers (for students/admins)
export const fetchAllActiveOffers = async () => {
  const response = await fetch(`${API_BASE_URL}/offers/active`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch offers');
  }

  return response.json();
};

// Create a new offer
export const createOffer = async (token: string, offerData: OfferData) => {
  const response = await fetch(`${API_BASE_URL}/offers/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(offerData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create offer');
  }

  return response.json();
};

// Update an offer
export const updateOffer = async (token: string, offerId: string, updates: Partial<OfferData>) => {
  const response = await fetch(`${API_BASE_URL}/offers/update/${offerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update offer');
  }

  return response.json();
};

// Delete an offer
export const deleteOffer = async (token: string, offerId: string) => {
  const response = await fetch(`${API_BASE_URL}/offers/delete/${offerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete offer');
  }

  return response.json();
};

// Toggle offer status
export const toggleOfferStatus = async (token: string, offerId: string) => {
  const response = await fetch(`${API_BASE_URL}/offers/toggle/${offerId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to toggle offer status');
  }

  return response.json();
};
