import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import connectionReducer from './features/connection/connectionSlice';
import postReducer from './features/post/postSlice';
import gameReducer from './features/game/gameSlice';
import affiliateItemsReducer from './features/affiliate/affiliateSlice';
import platformInfoReducer from './features/platformInfo/platformInfoSlice'; // New import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    connections: connectionReducer,
    posts: postReducer,
    games: gameReducer,
    affiliateItems: affiliateItemsReducer,
    platformInfo: platformInfoReducer, // Add the new reducer
  },
  // Optional: configure middleware
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
  //   serializableCheck: false,
  // }),
});
