import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import UsersListPage from './pages/UsersListPage';
import ConnectionRequestsPage from './pages/ConnectionRequestsPage';
import MyConnectionsPage from './pages/MyConnectionsPage';
import PostsFeedPage from './pages/PostsFeedPage'; // New import
import { logout, getProfile } from './features/auth/authSlice'; // Removed 'reset' as it's not used here
import authService from './services/authService';

function Navbar() {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        {isAuthenticated ? (
          <>
            <li><Link to="/profile/me">Profile ({user?.username || 'User'})</Link></li>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/connections/pending">Pending Requests</Link></li>
            <li><Link to="/my-connections">My Connections</Link></li>
            <li><Link to="/feed">Feed</Link></li>
            <li><button onClick={handleLogout} disabled={isLoading}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  if (isLoading) {
    return <p>Authenticating...</p>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const dispatch = useDispatch();
  // user object from auth state is used to check if profile needs fetching.
  // token presence is checked by authSlice initial state load from localStorage.
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If there's a token (meaning user was logged in) but no user details in state, fetch profile.
    // authService.setAuthToken(token) is called by authService itself when it loads,
    // or after login by the login thunk.
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [token, user, dispatch]);

  return (
    <Router>
      <div>
        <Navbar />
        <div style={{padding: '20px'}}> {/* Added a general padding for content area */}
          <h1>React Frontend for Telecom Network</h1>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile/me"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <UsersListPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/connections/pending"
              element={
                <PrivateRoute>
                  <ConnectionRequestsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-connections"
              element={
                <PrivateRoute>
                  <MyConnectionsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <PrivateRoute>
                  <PostsFeedPage />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<div><h2>Welcome!</h2><p>This is the homepage. Current user: {user ? user.username : 'Guest'}</p></div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;
