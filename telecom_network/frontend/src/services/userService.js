import axios from 'axios';

const API_URL = 'http://localhost:8000/api/'; // Ensure this is consistent

// Assumes axios instance is already configured with Authorization header by authService.js
// when a user is logged in. All these endpoints require authentication.

const getAllUsers = async () => {
  const response = await axios.get(API_URL + 'users/');
  return response.data;
};

const sendConnectionRequest = async (toUserId) => {
  const response = await axios.post(API_URL + 'connections/send_request/', { to_user_id: toUserId });
  return response.data;
};

const getIncomingPendingRequests = async () => {
  const response = await axios.get(API_URL + 'connections/pending/incoming/');
  return response.data;
};

const getOutgoingPendingRequests = async () => {
  const response = await axios.get(API_URL + 'connections/pending/outgoing/');
  return response.data;
};

// New functions
const performConnectionAction = async (connectionId, action) => {
  const response = await axios.post(API_URL + `connections/${connectionId}/action/`, { action });
  return response.data;
};

const getAcceptedConnections = async () => {
  const response = await axios.get(API_URL + 'connections/accepted/');
  return response.data;
};

const userService = {
  getAllUsers,
  sendConnectionRequest,
  getIncomingPendingRequests,
  getOutgoingPendingRequests,
  performConnectionAction, // Added new function
  getAcceptedConnections, // Added new function
};

export default userService;
