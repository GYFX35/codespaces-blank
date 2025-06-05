import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset, getProfile } from '../features/auth/authSlice';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Removed 'user' from here as its presence before getProfile completes can be misleading
  const { token, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      alert(message || 'Login failed. Please check your credentials.'); // Show error message
      dispatch(reset()); // Reset error state
    }

    // If login was successful (isSuccess from login thunk) and token is set
    if (isSuccess && token) {
      dispatch(getProfile()); // Fetch profile right after successful login and token is set
      navigate('/profile/me'); // Navigate to profile page
      // dispatch(reset()); // Reset success state after handling navigation and profile fetch
    }

    // If there's a token from previous session (e.g. page refresh and already logged in)
    // This case might be handled by App.jsx's useEffect, but good to have a check
    // No, this component should only react to login attempts. App.jsx handles initial load.

  }, [token, isError, isSuccess, message, navigate, dispatch]); // Dependencies for the effect

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(reset()); // Reset any previous states before new login attempt
    dispatch(login(formData));
  };

  if (isLoading) return <p>Logging in...</p>;

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="username" value={formData.username} onChange={onChange} placeholder="Username" required />
        <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="Password" required />
        <button type="submit" disabled={isLoading}>Login</button>
      </form>
    </div>
  );
}
export default Login;
