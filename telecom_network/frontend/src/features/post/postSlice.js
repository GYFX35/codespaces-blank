import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/postService';

const initialState = {
  posts: [],
  isLoading: false,
  isError: false,
  message: '', // For feedback messages (e.g., success or error)
};

// Create new post
export const createNewPost = createAsyncThunk(
  'posts/create',
  async (postData, thunkAPI) => {
    try {
      const response = await postService.createPost(postData);
      // After successful creation, refresh the posts list to show the new post
      thunkAPI.dispatch(fetchAllPosts());
      return response; // Contains the newly created post object
    } catch (error) {
      // Extract a meaningful error message from backend response or default
      const message =
        (error.response?.data?.content) || // Specific error for content field
        (error.response?.data?.detail) ||  // General detail error from DRF
        error.response?.data?.error ||     // Other backend error structures
        error.message ||                   // Axios or network error message
        error.toString();                  // Fallback
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch all posts
export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await postService.getAllPosts();
    } catch (error) {
      const message =
        (error.response?.data?.detail) ||
        error.response?.data?.error ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPostState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Post
      .addCase(createNewPost.pending, (state) => {
        state.isLoading = true;
        state.message = ''; // Clear previous messages
        state.isError = false;
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = 'Post created successfully!';
        // The posts list is updated by the fetchAllPosts thunk dispatched from createNewPost
        // Optionally, could optimistically add action.payload to state.posts here if needed
      })
      .addCase(createNewPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to create post.';
      })
      // Fetch All Posts
      .addCase(fetchAllPosts.pending, (state) => {
        state.isLoading = true;
        // Optionally clear message if it's only for create post feedback
        // state.message = '';
        // state.isError = false;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
        // Clear message if fetch is successful and message was from a previous operation
        // state.message = '';
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to fetch posts.';
      });
  }
});

export const { resetPostState } = postSlice.actions;
export default postSlice.reducer;
