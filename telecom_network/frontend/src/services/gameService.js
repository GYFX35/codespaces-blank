import axios from 'axios';
const API_URL = 'http://localhost:8000/api/games/'; // Base URL for games

// Assumes axios instance might already be configured with Authorization header by authService.js
// if needed, but these game endpoints are public (AllowAny).

const getAllGames = (filters = {}) => {
  // filters object can contain 'category' or 'is_featured'
  return axios.get(API_URL, { params: filters });
};

const getGameDetails = (gameId) => {
  return axios.get(`${API_URL}${gameId}/`);
};

const gameService = {
  getAllGames,
  getGameDetails,
};
export default gameService;
