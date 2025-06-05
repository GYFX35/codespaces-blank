import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Get user from localStorage if exists (e.g. after refresh)
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user ? user : null,
  token: token ? token : null,
  isAuthenticated: !!token,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Register user
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const data = await authService.register(userData);
    return data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.detail) || (error.response && error.response.data) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Login user
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const data = await authService.login(userData);
    // After login, App.jsx will dispatch getProfile due to token change
    return data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.detail) || (error.response && error.response.data) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get user profile
export const getProfile = createAsyncThunk('auth/getProfile', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    return await authService.getProfile(token);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.detail) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Update user profile
export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    return await authService.updateProfile(profileData, token);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.detail) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// createAction is good for defining standard actions.
// For logout, which is purely client-side state change, a simple reducer is also fine.
// Exporting the action creator from slice.actions is common.
// const logoutUserAction = createAction('auth/logoutUser'); // If needed for specific middleware or sagas

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    logout: (state) => { // This is the actual logout reducer
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      authService.setAuthToken(null); // Clear axios header
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Registration successful! Please login.';
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true; // Indicates login call was successful
        state.token = action.payload.access;
        state.isAuthenticated = true;
        // User data (profile) will be fetched by App.jsx's useEffect due to token change
        // No need to store action.payload.user here if login response doesn't include full user profile
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        // Also clear from localStorage and authService if login fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authService.setAuthToken(null);
      })
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // state.isSuccess = true; // Can set this if needed, but user object is the main payload
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload)); // Keep user in sync
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        // If profile fetch fails (e.g. invalid token), dispatch logout to clear state
        if (action.payload && (String(action.payload).includes('401') || String(action.payload).includes('Unauthorized') || String(action.payload).includes('denied'))) {
          // This is a side-effect in a reducer, ideally should be handled by dispatching logout from component or thunk
          // For now, directly mutating state for logout.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          authService.setAuthToken(null);
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.message = 'Session expired or invalid. Please login again.';
        }
      })
       .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
        state.message = 'Profile updated successfully!';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
      // No need to handle createAction('auth/logout') here if it's directly used as a reducer key
  },
});

export const { reset, logout } = authSlice.actions; // Export logout action creator from here
export default authSlice.reducer;
