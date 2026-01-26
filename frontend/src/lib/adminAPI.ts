import { API_BASE_URL, getHeaders } from './api';

const ADMIN_API_BASE = `${API_BASE_URL}/admin/dashboard`;

// Get admin dashboard
export const getAdminDashboard = async () => {
  const response = await fetch(`${ADMIN_API_BASE}/dashboard`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard');
  return response.json();
};

// Get all students
export const getStudents = async (page = 1, limit = 10, verificationStatus = 'all', search = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    verificationStatus,
    search,
  });

  const response = await fetch(`${ADMIN_API_BASE}/students?${params}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch students');
  return response.json();
};

// Get all vendors
export const getVendors = async (page = 1, limit = 10, status = 'all', search = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status,
    search,
  });

  const response = await fetch(`${ADMIN_API_BASE}/vendors?${params}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch vendors');
  return response.json();
};

// Verify student
export const verifyStudent = async (studentId: string, status: 'verified' | 'rejected', remarks?: string) => {
  const response = await fetch(`${ADMIN_API_BASE}/students/${studentId}/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ status, remarks }),
  });
  if (!response.ok) throw new Error('Failed to verify student');
  return response.json();
};

// Update vendor status
export const updateVendorStatus = async (vendorId: string, status: string, remarks?: string) => {
  const response = await fetch(`${ADMIN_API_BASE}/vendors/${vendorId}/status`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ status, remarks }),
  });
  if (!response.ok) throw new Error('Failed to update vendor status');
  return response.json();
};

// Get pending verifications
export const getPendingVerifications = async (type = 'all') => {
  const params = new URLSearchParams({ type });
  
  const response = await fetch(`${ADMIN_API_BASE}/pending-verifications?${params}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch pending verifications');
  return response.json();
};

// Approve student verification
export const approveStudentVerification = async (studentId: string, remarks?: string) => {
  const response = await fetch(`${ADMIN_API_BASE}/students/${studentId}/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ approvalStatus: 'approved', remarks }),
  });
  if (!response.ok) throw new Error('Failed to approve student');
  return response.json();
};

// Reject student verification
export const rejectStudentVerification = async (studentId: string, rejectionReason: string) => {
  const response = await fetch(`${ADMIN_API_BASE}/students/${studentId}/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ approvalStatus: 'rejected', rejectionReason }),
  });
  if (!response.ok) throw new Error('Failed to reject student');
  return response.json();
};

// Get vendor campaigns
export const getVendorCampaigns = async (vendorId: string) => {
  const response = await fetch(`${ADMIN_API_BASE}/vendors/${vendorId}/campaigns`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch vendor campaigns');
  return response.json();
};

// Get platform analytics
export const getPlatformAnalytics = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(`${ADMIN_API_BASE}/analytics?${params}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

// Suspend student
export const suspendStudent = async (studentId: string, reason: string) => {
  const response = await fetch(`${ADMIN_API_BASE}/students/${studentId}/suspend`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) throw new Error('Failed to suspend student');
  return response.json();
};

// Suspend vendor
export const suspendVendor = async (vendorId: string, reason: string) => {
  const response = await fetch(`${ADMIN_API_BASE}/vendors/${vendorId}/suspend`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) throw new Error('Failed to suspend vendor');
  return response.json();
};

// Get fraud reports
export const getFraudReports = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${ADMIN_API_BASE}/fraud-reports?${params}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch fraud reports');
  return response.json();
};

// Mark discount as fraudulent
export const markFraudulent = async (discountId: string, reason: string) => {
  const response = await fetch(`${ADMIN_API_BASE}/discounts/${discountId}/mark-fraudulent`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) throw new Error('Failed to mark as fraudulent');
  return response.json();
};

// Handle dispute
export const handleDispute = async (discountId: string, resolution: string, remarks?: string) => {
  const response = await fetch(`${ADMIN_API_BASE}/discounts/${discountId}/handle-dispute`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ resolution, remarks }),
  });
  if (!response.ok) throw new Error('Failed to handle dispute');
  return response.json();
};

// Admin user management endpoints
export const updateUserRole = async (userId: string, role: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw new Error('Failed to update user role');
  return response.json();
};

export const deleteUser = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};
