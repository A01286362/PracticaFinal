// Check if we're in a Vite environment (browser) or Node.js environment (tests)
const API_URL = typeof window !== 'undefined' && import.meta?.env?.VITE_API_URL 
  ? import.meta.env.VITE_API_URL 
  : process.env.VITE_API_URL || 'http://localhost:3000';

export default API_URL; 