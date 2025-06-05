import React, { useState, useEffect } from 'react'; // Added useEffect
import { useDispatch, useSelector } from 'react-redux';
import { createNewPost, resetPostState } from '../features/post/postSlice';

function CreatePostForm() {
  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  // isLoading specifically for post creation could be more granular if needed
  const { isLoading, isError, message } = useSelector((state) => state.posts);
  const [formMessage, setFormMessage] = useState(''); // Local message for form feedback

  useEffect(() => {
    // Handle global messages from Redux state, specifically for post creation feedback
    if (message.includes('Post created successfully!')) {
      setFormMessage(message); // Show success locally
      setContent(''); // Clear form on successful post
      dispatch(resetPostState()); // Reset global message after handling
    } else if (isError && message.includes('Failed to create post')) { // Or more specific error check
      setFormMessage(message); // Show error locally
      dispatch(resetPostState()); // Reset global message
    }
    // Clear local message after a delay or on input change
    if (formMessage) {
        const timer = setTimeout(() => setFormMessage(''), 3000); // Clear after 3s
        return () => clearTimeout(timer);
    }
  }, [message, isError, dispatch, formMessage]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setFormMessage(''); // Clear previous local messages
    if (!content.trim()) {
      setFormMessage("Post content cannot be empty.");
      return;
    }
    dispatch(createNewPost({ content }));
    // setContent(''); // Clearing content is now handled by useEffect on successful post
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
      <h3>Create New Post</h3>
      {formMessage && <p style={{ color: isError ? 'red' : 'green' }}>{formMessage}</p>}
      <div>
        <textarea
          rows="3"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (formMessage) setFormMessage(''); // Clear message on new input
          }}
          required
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ccc' }}
        />
      </div>
      <button type="submit" disabled={isLoading} style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
        {isLoading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
export default CreatePostForm;
