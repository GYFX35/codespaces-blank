import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

const initialState = {
  users: [],
  incomingPending: [],
  outgoingPending: [],
  acceptedConnections: [], // New state field
  isLoading: false,
  isError: false,
  message: '',
};

// Existing Thunks
export const fetchAllUsers = createAsyncThunk('connections/fetchAllUsers', async (_, thunkAPI) => {
  try {
    return await userService.getAllUsers();
  } catch (error) {
    const message = (error.response?.data?.detail) || error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const sendRequest = createAsyncThunk('connections/sendRequest', async (toUserId, thunkAPI) => {
  try {
    const response = await userService.sendConnectionRequest(toUserId);
    thunkAPI.dispatch(fetchOutgoingPending());
    return response;
  } catch (error) {
    const message = (error.response?.data?.detail) || error.response?.data?.message || (error.response?.data ? JSON.stringify(error.response.data) : false) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchIncomingPending = createAsyncThunk('connections/fetchIncomingPending', async (_, thunkAPI) => {
  try {
    return await userService.getIncomingPendingRequests();
  } catch (error) { // Fixed syntax error here: changed error)_ to error
    const message = (error.response?.data?.detail) || error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchOutgoingPending = createAsyncThunk('connections/fetchOutgoingPending', async (_, thunkAPI) => {
  try {
    return await userService.getOutgoingPendingRequests();
  } catch (error) {
    const message = (error.response?.data?.detail) || error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// New Thunks
export const connectionAction = createAsyncThunk(
  'connections/connectionAction',
  async ({ connectionId, action }, thunkAPI) => {
    try {
      const response = await userService.performConnectionAction(connectionId, action);
      // Refresh relevant lists after action
      thunkAPI.dispatch(fetchIncomingPending());
      thunkAPI.dispatch(fetchOutgoingPending());
      thunkAPI.dispatch(fetchAcceptedConnections()); // Ensure this is fetched
      return { actionDone: action, connectionId, data: response }; // Changed 'action' key to 'actionDone' to avoid conflict if any
    } catch (error) {
      const message = (error.response?.data?.detail) || error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchAcceptedConnections = createAsyncThunk(
  'connections/fetchAcceptedConnections',
  async (_, thunkAPI) => {
    try {
      return await userService.getAcceptedConnections();
    } catch (error) {
      const message = (error.response?.data?.detail) || error.response?.data || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    resetConnectionState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetchAllUsers
      .addCase(fetchAllUsers.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false; state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      // Cases for sendRequest
      .addCase(sendRequest.pending, (state) => {
        state.isLoading = true;
        state.message = '';
        state.isError = false;
      })
      .addCase(sendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = 'Connection request sent!'; // Changed from 'sent successfully!' for consistency
      })
      .addCase(sendRequest.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      // Cases for fetchIncomingPending
      .addCase(fetchIncomingPending.pending, (state) => { state.isLoading = true; })
      .addCase(fetchIncomingPending.fulfilled, (state, action) => {
        state.isLoading = false; state.incomingPending = action.payload;
      })
      .addCase(fetchIncomingPending.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      // Cases for fetchOutgoingPending
      .addCase(fetchOutgoingPending.pending, (state) => { state.isLoading = true; })
      .addCase(fetchOutgoingPending.fulfilled, (state, action) => {
        state.isLoading = false; state.outgoingPending = action.payload;
      })
      .addCase(fetchOutgoingPending.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      // New cases for connectionAction
      .addCase(connectionAction.pending, (state) => { state.isLoading = true; })
      .addCase(connectionAction.fulfilled, (state, action) => {
        state.isLoading = false;
        // Using actionDone from payload to make message more specific
        state.message = `Request ${action.payload.actionDone}ed successfully.`;
      })
      .addCase(connectionAction.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      // New cases for fetchAcceptedConnections
      .addCase(fetchAcceptedConnections.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAcceptedConnections.fulfilled, (state, action) => {
        state.isLoading = false; state.acceptedConnections = action.payload;
      })
      .addCase(fetchAcceptedConnections.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      });
  }
});

export const { resetConnectionState } = connectionSlice.actions;
// Re-export existing thunks along with new ones if they are used by components directly
export {
    fetchAllUsers,
    sendRequest,
    fetchIncomingPending,
    fetchOutgoingPending
    // connectionAction and fetchAcceptedConnections are already exported above
};
export default connectionSlice.reducer;
