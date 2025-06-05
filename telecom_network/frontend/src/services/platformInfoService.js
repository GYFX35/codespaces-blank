import axios from 'axios';

// The backend URL for this in core/urls.py is 'platform-banking-details/'
// It's a single endpoint to get the *active* details, not a list with an 'active/' sub-path.
const API_URL = 'http://localhost:8000/api/platform-banking-details/';

// This endpoint is public (AllowAny on the backend)
const getActiveBankingDetails = () => {
  // The request should be to the base API_URL defined above for this specific view.
  return axios.get(API_URL);
};

const platformInfoService = {
  getActiveBankingDetails,
};
export default platformInfoService;
