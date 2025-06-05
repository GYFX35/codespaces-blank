import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, updateProfile, reset } from '../features/auth/authSlice';

function Profile() {
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);
  // Initialize bio from user.profile.bio if user and user.profile exist, otherwise empty string
  const [bio, setBio] = useState('');

  useEffect(() => {
    // If user data is not available in state, dispatch getProfile.
    // This could happen if the user navigates directly to this page after login or on refresh.
    // App.jsx also tries to fetch profile, but this is a local safeguard.
    if (!user) {
      dispatch(getProfile());
    } else if (user && user.profile) {
      // When user data is available (either from initial load or after getProfile), set bio.
      setBio(user.profile.bio || '');
    }
  }, [user, dispatch]); // Rerun when user object changes or on initial component load

  useEffect(() => {
    if (isError) {
      alert("Error: " + (message || "An error occurred."));
      dispatch(reset());
    }
    // Check isSuccess and if a relevant message exists (e.g. "Profile updated successfully!")
    if (isSuccess && message && message.toLowerCase().includes('profile updated')) {
        alert(message);
        dispatch(reset()); // Reset flags after showing success message for update
    }
    // For other success cases (like initial profile load), we might not need an alert.
    // Resetting isSuccess flag can be done more selectively if needed.
    // If isSuccess is true but there's no specific message for an alert,
    // we might want to reset it silently or based on the action type.
    else if (isSuccess && !message.toLowerCase().includes('profile updated')) {
        dispatch(reset()); // Reset for other success cases like initial load if appropriate
    }

  }, [isError, isSuccess, message, dispatch]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // Dispatch updateProfile with the structure expected by UserSerializer in Django backend
    // which includes a nested 'profile' object.
    dispatch(updateProfile({ profile: { bio } }));
  };

  // Show loading state if isLoading is true AND user data hasn't been loaded yet.
  // This prevents showing "Loading profile..." when just a profile update is in progress.
  if (isLoading && !user) return <p>Loading profile...</p>;

  // If after attempting to load, user is still null (e.g., auth failed, or error in getProfile)
  if (!user) return <p>Could not load profile. Please ensure you are logged in.</p>;

  return (
    <div>
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>First Name:</strong> {user.first_name || 'Not set'}</p>
      <p><strong>Last Name:</strong> {user.last_name || 'Not set'}</p>
      <form onSubmit={handleUpdateProfile}>
        <div>
          <label htmlFor="bio">Bio:</label>
          <textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
export default Profile;
