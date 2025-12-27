import { API_BASE_URL, getHeaders } from './api';

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
export const fetchVendorOffers = async () => {
  const response = await fetch(`${API_BASE_URL}/offers/my-offers`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch offers');
  }

  return response.json();
};

// Fetch all active offers (for students/admins)
export const fetchAllActiveOffers = async (category?: string, search?: string) => {
  try {
    const params = new URLSearchParams();
    
    if (category && category !== 'all') {
      params.append('category', category);
    }
    
    if (search) {
      params.append('search', search);
    }

    const url = params.toString() 
      ? `${API_BASE_URL}/offers/active?${params.toString()}`
      : `${API_BASE_URL}/offers/active`;

    console.log('Fetching offers from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response body:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch offers (${response.status})`);
      } catch (parseError) {
        throw new Error(`Failed to fetch offers: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Successfully fetched offers:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchAllActiveOffers:', error);
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}. Make sure the backend server is running on ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Create a new offer
export const createOffer = async (offerData: OfferData) => {
  const response = await fetch(`${API_BASE_URL}/offers/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(offerData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create offer');
  }

  return response.json();
};

// Update an offer
export const updateOffer = async (offerId: string, updates: Partial<OfferData>) => {
  const response = await fetch(`${API_BASE_URL}/offers/update/${offerId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update offer');
  }

  return response.json();
};

// Delete an offer
export const deleteOffer = async (offerId: string) => {
  const response = await fetch(`${API_BASE_URL}/offers/delete/${offerId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete offer');
  }

  return response.json();
};

// Toggle offer status
export const toggleOfferStatus = async (offerId: string) => {
  const response = await fetch(`${API_BASE_URL}/offers/toggle/${offerId}`, {
    method: 'PATCH',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to toggle offer status');
  }

  return response.json();
};

// Get offer details by ID
export const getOfferById = async (offerId: string) => {
  const response = await fetch(`${API_BASE_URL}/offers/detail/${offerId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch offer details');
  }

  return response.json();
};

// Get offer by code
export const getOfferByCode = async (code: string) => {
  const response = await fetch(`${API_BASE_URL}/offers/code/${code}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch offer by code');
  }

  return response.json();
};

// Get offer statistics
export const getOfferStats = async () => {
  const response = await fetch(`${API_BASE_URL}/offers/stats`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch offer statistics');
  }

  return response.json();
};

// Redeem an offer
export const redeemOffer = async (offerId: string) => {
  const response = await fetch(`${API_BASE_URL}/offers/redeem`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ offerId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to redeem offer');
  }

  return response.json();
};
