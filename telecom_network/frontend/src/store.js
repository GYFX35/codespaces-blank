import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import connectionReducer from './features/connection/connectionSlice';
import postReducer from './features/post/postSlice'; // New import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    connections: connectionReducer,
    posts: postReducer, // Add new reducer
  },
  // Optional: configure middleware for development (e.g., logger)
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
