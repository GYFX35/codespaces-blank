import axios from 'axios';

const API_URL = 'http://localhost:8000/api/'; // Adjust if your Django API is elsewhere

// Utility to set Axios default headers for authenticated requests
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Call setAuthToken when the service loads, in case a token is already in localStorage
// This ensures that if the page is refreshed, subsequent API calls are authenticated.
const initialToken = localStorage.getItem('token');
if (initialToken) {
  setAuthToken(initialToken);
}

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL + 'auth/register/', userData);
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'auth/login/', userData);
  if (response.data.access) {
    localStorage.setItem('token', response.data.access);
    setAuthToken(response.data.access); // Set token for subsequent requests
    // User profile will be fetched separately after login by App.jsx
  }
  return response.data; // Returns {access: '...', refresh: '...'}
};

// Logout user - client side actions
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user'); // Also clear stored user profile
  setAuthToken(null); // Clear auth header from axios defaults
  // No backend call in this version of logout
};

// Get user profile
const getProfile = async (token) => {
  // Token should ideally be set by setAuthToken on login or app load.
  // This explicit token passing is a fallback but can lead to inconsistencies if not managed well.
  // It's better to rely on axios defaults set by setAuthToken.
  if (token && !axios.defaults.headers.common['Authorization']) {
      setAuthToken(token); // Ensure header is set if not already (e.g. if called before defaults are set)
  }
  const response = await axios.get(API_URL + 'profile/me/');
  return response.data; // Returns user profile data
};

// Update profile
const updateProfile = async (profileData, token) => {
   // Similar to getProfile, rely on axios defaults.
   if (token && !axios.defaults.headers.common['Authorization']) {
      setAuthToken(token);
  }
  // The profileData should be in the format expected by the backend UserSerializer,
  // e.g., { "profile": { "bio": "new bio" }, "first_name": "Test" }
  const response = await axios.put(API_URL + 'profile/me/', profileData);
  return response.data; // Returns updated user profile data
};

const authService = {
  register,
  login,
  logout, // This is the client-side logout function
  getProfile,
  updateProfile,
  setAuthToken, // Expose setAuthToken if needed externally, though typically managed internally
};

export default authService;
