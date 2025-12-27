import { apiRequest, API_BASE_URL } from './api';

export const verificationAPI = {
  // Send verification code to email
  sendVerificationCode: async (email: string) => {
    return apiRequest('/verification/send-code', 'POST', { email });
  },

  // Verify code sent to email
  verifyEmailCode: async (email: string, code: string) => {
    return apiRequest('/verification/verify-code', 'POST', { email, code });
  },

  // Upload student ID document
  uploadStudentId: async (file: File) => {
    const formData = new FormData();
    formData.append('studentId', file);

    const authToken = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const url = `${API_BASE_URL}/verification/upload-student-id`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error('File upload error:', error);
      throw error;
    }
  },

  // Initiate SheerID verification
  initiateSheerIdVerification: async (
    email: string,
    affiliationType: string,
    affiliationValue: string
  ) => {
    return apiRequest('/verification/sheerid', 'POST', {
      email,
      affiliationType,
      affiliationValue,
    });
  },

  // Get verification status
  getVerificationStatus: async () => {
    return apiRequest('/verification/status', 'GET');
  },

  // Get verification status for specific user (admin)
  getUserVerificationStatus: async (userId: string) => {
    return apiRequest(`/verification/${userId}/status`, 'GET');
  },

  // Admin: Approve verification
  approveVerification: async (userId: string) => {
    return apiRequest(`/verification/${userId}/approve`, 'PUT');
  },

  // Admin: Reject verification
  rejectVerification: async (userId: string, reason: string) => {
    return apiRequest(`/verification/${userId}/reject`, 'PUT', { reason });
  },
};
