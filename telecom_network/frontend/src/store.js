import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import connectionReducer from './features/connection/connectionSlice';
import postReducer from './features/post/postSlice';
import gameReducer from './features/game/gameSlice';
import affiliateItemsReducer from './features/affiliate/affiliateSlice'; // New import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    connections: connectionReducer,
    posts: postReducer,
    games: gameReducer,
    affiliateItems: affiliateItemsReducer, // Add the new reducer
  },
  // Optional: configure middleware to disable serializableCheck if using non-serializable values
  // (though not strictly needed for this slice as defined, as URLs are strings)
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
  //   serializableCheck: false,
  // }),
});
