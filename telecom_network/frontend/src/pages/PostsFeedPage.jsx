import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPosts, resetPostState } from '../features/post/postSlice';
import CreatePostForm from '../components/CreatePostForm'; // Import the form

function PostsFeedPage() {
  const dispatch = useDispatch();
  const { posts, isLoading, isError, message } = useSelector((state) => state.posts);
  // const { user: currentUser } = useSelector((state) => state.auth); // For future use (e.g. edit/delete)

  useEffect(() => {
    // Fetch posts when the component mounts
    dispatch(fetchAllPosts());
  }, [dispatch]);

  useEffect(() => {
    // This useEffect is for handling global messages that are NOT specific to CreatePostForm's direct feedback
    // For example, errors from fetchAllPosts.
    // CreatePostForm now handles its own success/error messages locally.
    if (isError && message && !message.includes('Failed to create post')) { // Avoid re-alerting create post errors
      alert("Feed Error: " + message); // Replace with better UI (e.g., toast notifications)
      dispatch(resetPostState());
    }
    // Success messages from fetchAllPosts are usually not needed for an alert.
    // If createNewPost success message was global, it would also be caught here.
  }, [isError, message, dispatch]);

  // Loading state specifically for the initial fetch of posts
  if (isLoading && posts.length === 0) return <p>Loading posts...</p>;

  // Error state if fetching posts failed and there are no posts to show
  if (isError && posts.length === 0 && message && !message.includes('Failed to create post')) {
      return <p style={{color: 'red'}}>Error fetching posts: {message}</p>;
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Feed</h2>
      <CreatePostForm /> {/* Include the form here */}

      {posts.length === 0 && !isLoading && !isError && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>No posts yet. Be the first to share!</p>
      )}

      <div className="posts-list" style={{ marginTop: '30px' }}>
        {posts.map(post => (
          <div
            key={post.id}
            style={{
              border: '1px solid #e0e0e0',
              padding: '15px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              {/* Placeholder for profile picture */}
              {/* <img src={post.user.profile_pic_url || default_avatar} alt={post.user.username} style={{width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px'}} /> */}
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{post.user.username}</p>
                <p style={{ margin: 0, fontSize: '0.8em', color: '#666' }}>
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>{post.content}</p>
            {/* TODO: Add edit/delete buttons later if post.user.id === currentUser?.id */}
            {/* Example: post.user.id === currentUser?.id && ( <div> ...buttons... </div> ) */}
          </div>
        ))}
      </div>
    </div>
  );
}
export default PostsFeedPage;
