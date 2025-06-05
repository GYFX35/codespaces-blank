import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      alert(message || 'Registration failed.'); // Show error
      dispatch(reset()); // Reset error state
    }
    if (isSuccess) {
      alert(message || 'Registration successful! Please login.'); // Show success message
      navigate('/login'); // Navigate to login page
      dispatch(reset()); // Reset success state
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      alert('Passwords do not match');
    } else {
      dispatch(reset()); // Reset previous states
      dispatch(register({ username: formData.username, email: formData.email, password: formData.password, password2: formData.password2 }));
    }
  };

  if (isLoading) return <p>Registering...</p>;

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="username" value={formData.username} onChange={onChange} placeholder="Username" required />
        <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="Email" required />
        <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="Password" required />
        <input type="password" name="password2" value={formData.password2} onChange={onChange} placeholder="Confirm Password" required />
        <button type="submit" disabled={isLoading}>Register</button>
      </form>
    </div>
  );
}
export default Register;
