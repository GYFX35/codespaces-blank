import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import platformInfoService from '../../services/platformInfoService'; // Adjust path if needed

const initialState = {
  bankingDetails: null,
  isLoading: false,
  isError: false,
  message: '', // For storing error messages or info like "no details configured"
};

export const fetchBankingDetails = createAsyncThunk(
  'platformInfo/fetchBankingDetails',
  async (_, thunkAPI) => {
    try {
      const response = await platformInfoService.getActiveBankingDetails();
      // The backend view ActiveBankingDetailsView returns {} if no active details,
      // or the serialized active details object.
      return response.data;
    } catch (error) {
      const message =
        (error.response?.data?.detail) ||
        (error.response?.data?.error) || // Common error field names
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const platformInfoSlice = createSlice({
  name: 'platformInfo',
  initialState,
  reducers: {
    resetPlatformInfoState: (state) => {
      state.bankingDetails = null;
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBankingDetails.pending, (state) => {
        state.isLoading = true;
        state.message = ''; // Clear previous messages
        state.isError = false; // Clear previous error state
        state.bankingDetails = null; // Clear previous details
      })
      .addCase(fetchBankingDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false; // Clear previous error state
        // Check if the payload is an empty object, meaning no active details
        if (action.payload && Object.keys(action.payload).length === 0 && action.payload.constructor === Object) {
            state.bankingDetails = null;
            state.message = 'No banking details are currently configured by the administrator.';
        } else if (action.payload && Object.keys(action.payload).length > 0) {
            // If payload has keys, assume it's valid banking details
            state.bankingDetails = action.payload;
            state.message = ''; // Clear message on success if data is present
        } else {
            // Handles null, undefined, or other unexpected non-object (but not empty object) payloads
            state.bankingDetails = null;
            state.message = 'Received unexpected or no data for banking details.';
        }
      })
      .addCase(fetchBankingDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to fetch banking details.';
        state.bankingDetails = null;
      });
  },
});

export const { resetPlatformInfoState } = platformInfoSlice.actions;
export default platformInfoSlice.reducer;
