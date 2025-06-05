import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import gameService from '../../services/gameService';

const initialState = {
  games: [],
  selectedGame: null,
  isLoading: false,
  isError: false,
  message: '',
};

export const fetchGames = createAsyncThunk('games/fetchAll', async (filters, thunkAPI) => {
  try {
    const response = await gameService.getAllGames(filters);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.detail) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchGameDetails = createAsyncThunk('games/fetchDetails', async (gameId, thunkAPI) => {
  try {
    const response = await gameService.getGameDetails(gameId);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.detail) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    resetGameState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
      state.selectedGame = null; // Also reset selected game on general reset
    },
    clearSelectedGame: (state) => { // Specific action to clear only selected game
        state.selectedGame = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.isLoading = true;
        // Optionally clear previous error messages when a new fetch starts
        // state.isError = false;
        // state.message = '';
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.isLoading = false;
        state.games = action.payload;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchGameDetails.pending, (state) => {
        state.isLoading = true;
        state.selectedGame = null; // Clear previous selection
        // state.isError = false;
        // state.message = '';
      })
      .addCase(fetchGameDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedGame = action.payload;
      })
      .addCase(fetchGameDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});
export const { resetGameState, clearSelectedGame } = gameSlice.actions;
export default gameSlice.reducer;
