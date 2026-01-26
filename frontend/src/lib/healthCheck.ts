import { API_BASE_URL } from './api';

/**
 * Health check to verify backend server is running
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const healthUrl = `${API_BASE_URL.replace('/api', '')}/health`;
    console.log(`Checking backend health at: ${healthUrl}`);
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Backend returned status ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Backend is running:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    console.warn(`⚠️ Backend server at ${API_BASE_URL} is not accessible.`);
    console.warn('Make sure to:');
    console.warn('1. Start the backend server: cd backend && npm run dev');
    console.warn('2. Ensure MongoDB connection is working');
    console.warn(`3. Check that backend is running on port 5000`);
    return false;
  }
};

/**
 * Verify API configuration
 */
export const verifyAPIConfiguration = () => {
  console.log('API Configuration:');
  console.log('- API_BASE_URL:', API_BASE_URL);
  console.log('- Environment:', import.meta.env.MODE);
  console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL || 'Not set (using default)');
};

/**
 * Initialize API health check on app startup
 */
export const initializeAPIHealthCheck = async () => {
  console.log('🔍 Initializing API health check...');
  verifyAPIConfiguration();
  const isHealthy = await checkBackendHealth();
  
  if (!isHealthy) {
    console.error('⚠️ API health check failed. The application may not work properly.');
  }
  
  return isHealthy;
};
