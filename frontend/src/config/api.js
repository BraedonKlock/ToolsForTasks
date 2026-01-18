// API configuration for different environments
// In development: VITE_API_URL is empty, relative paths work with Vite's proxy
// In production: VITE_API_URL should be set to the backend URL (e.g., https://backend-xxx.railway.app)
export const API_URL = import.meta.env.VITE_API_URL || '';
