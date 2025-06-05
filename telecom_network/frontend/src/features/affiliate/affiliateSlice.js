import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import affiliateService from '../../services/affiliateService'; // Adjust path as needed

const initialState = {
  items: [],
  isLoading: false,
  isError: false,
  message: '',
  // For DRF pagination support
  count: 0,
  nextPage: null,
  previousPage: null,
};

export const fetchAffiliateItems = createAsyncThunk(
  'affiliate/fetchAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await affiliateService.getAffiliateItems(params);
      // DRF default pagination returns data in an object like:
      // { count: <total_count>, next: <url_or_null>, previous: <url_or_null>, results: [...] }
      if (response.data && typeof response.data.count === 'number' && Array.isArray(response.data.results)) {
        return response.data; // Return the whole paginated object
      } else if (Array.isArray(response.data)) {
        // Handle cases where API might not be paginated or returns a simple list
        // This is a fallback, ideally the API is consistent.
        return { results: response.data, count: response.data.length, next: null, previous: null };
      }
      // If response structure is unexpected
      console.warn("fetchAffiliateItems received unexpected response structure:", response.data);
      // Return an empty-like structure to avoid breaking reducers expecting specific fields
      return { results: [], count: 0, next: null, previous: null };
    } catch (error) {
      const message =
        (error.response?.data?.detail) || // DRF common error field
        (error.response?.data?.message) || // Other potential error field
        error.message ||                   // Axios error message
        error.toString();                  // Fallback
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const affiliateSlice = createSlice({
  name: 'affiliateItems', // This will be the key in the root Redux state
  initialState,
  reducers: {
    resetAffiliateState: (state) => {
      state.items = [];
      state.isLoading = false;
      state.isError = false;
      state.message = '';
      state.count = 0;
      state.nextPage = null;
      state.previousPage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAffiliateItems.pending, (state) => {
        state.isLoading = true;
        // Optionally clear previous error/message on new request
        // state.isError = false;
        // state.message = '';
      })
      .addCase(fetchAffiliateItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false; // Clear any previous error
        state.message = '';    // Clear any previous message
        state.items = action.payload.results;
        state.count = action.payload.count;
        state.nextPage = action.payload.next;
        state.previousPage = action.payload.previous;
      })
      .addCase(fetchAffiliateItems.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to fetch affiliate items.'; // Set error message
        // Optionally clear data on error, or keep stale data
        state.items = [];
        state.count = 0;
        state.nextPage = null;
        state.previousPage = null;
      });
  },
});

export const { resetAffiliateState } = affiliateSlice.actions;
export default affiliateSlice.reducer;
