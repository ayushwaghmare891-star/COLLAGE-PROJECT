// Frontend API Configuration for Student Signup & Login
// This file demonstrates how to use the signup and login APIs

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  message?: string;
  error?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Student Signup
 * First step - Create a new student account
 */
export const studentSignup = async (userData: SignupData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'student',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Student Login
 * Second step - Login after account is created
 */
export const studentLogin = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check if signup is required
      if (data.code === 'SIGNUP_REQUIRED') {
        throw new Error('SIGNUP_REQUIRED: Please sign up first');
      }
      throw new Error(data.message || 'Login failed');
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Unified Login - Supports student and admin login
 * Uses the new /api/auth/login endpoint
 */
export const unifiedLogin = async (email: string, password: string, role: 'student' | 'admin'): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check if signup is required
      if (data.code === 'SIGNUP_REQUIRED') {
        throw new Error('SIGNUP_REQUIRED: Please sign up first');
      }
      throw new Error(data.message || 'Login failed');
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Check Server Health
 * Verify database and server connection
 */
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const data = await response.json();
    return {
      success: response.ok,
      ...data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Health check failed';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Health check failed';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Get Current User Info
 * Requires authentication token
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Logout
 * Clear local storage
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  return { success: true, message: 'Logged out successfully' };
};

/**
 * Get Auth Token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Is User Authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Get Stored User Info
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
/**
 * Get Student Verification Status (Real-time)
 */
export const getStudentVerificationStatus = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/student/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch status');
  }

  return response.json();
};