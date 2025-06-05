import axios from 'axios';
const API_URL = 'http://localhost:8000/api/affiliate-items/';

// These endpoints are public (AllowAny), so no auth token is strictly needed by default
// unless specific backend logic requires it for other reasons (e.g., tracking).

const getAffiliateItems = (params = {}) => {
  // params could be { category: 'SOFTWARE', search: 'tool', ordering: 'name', page: 1 }
  return axios.get(API_URL, { params });
};

// Optional: Get single affiliate item details (if a detail page is ever needed)
// const getAffiliateItemDetails = (itemId) => {
//   return axios.get(`${API_URL}${itemId}/`);
// };

const affiliateService = {
  getAffiliateItems,
  // getAffiliateItemDetails,
};
export default affiliateService;
