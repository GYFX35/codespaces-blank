import axios from 'axios';

const API_URL = 'http://localhost:8000/api/posts/'; // Base URL for posts

// Assumes axios instance is already configured with Authorization header by authService.js
// when a user is logged in, as creating and viewing posts require authentication.

// Create a new post
const createPost = async (postData) => { // postData should be like { content: "..." }
  const response = await axios.post(API_URL, postData);
  return response.data;
};

// Get all posts (feed)
const getAllPosts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Placeholder for future functions like deletePost, updatePost
// const deletePost = async (postId) => { ... };
// const updatePost = async (postId, postData) => { ... };

const postService = {
  createPost,
  getAllPosts,
  // deletePost,
  // updatePost,
};

export default postService;
