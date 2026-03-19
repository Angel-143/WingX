// Frontend API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

const API_BASE_URL = isDevelopment
  ? 'http://localhost:5000'
  : import.meta.env.VITE_BACKEND_URL || 'https://wingx-backend.onrender.com';

const FRONTEND_URL = isDevelopment
  ? 'http://localhost:5173'
  : import.meta.env.VITE_FRONTEND_URL || 'https://wingx-ufzv.onrender.com';

export { API_BASE_URL, FRONTEND_URL };
