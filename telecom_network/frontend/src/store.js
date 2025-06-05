import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import connectionReducer from './features/connection/connectionSlice';
import postReducer from './features/post/postSlice';
import gameReducer from './features/game/gameSlice'; // New import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    connections: connectionReducer,
    posts: postReducer,
    games: gameReducer, // Add new reducer
  },
});
