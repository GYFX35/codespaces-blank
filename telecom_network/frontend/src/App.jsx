import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import UsersListPage from './pages/UsersListPage';
import ConnectionRequestsPage from './pages/ConnectionRequestsPage';
import MyConnectionsPage from './pages/MyConnectionsPage';
import PostsFeedPage from './pages/PostsFeedPage';
import GamesPage from './pages/GamesPage'; // Added
import PlayGamePage from './pages/PlayGamePage'; // Added
import { logout, getProfile } from './features/auth/authSlice';
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
            <li><Link to="/games">Games</Link></li>
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
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [token, user, dispatch]);

  return (
    <Router>
      <div>
        <Navbar />
        <div style={{padding: '20px'}}>
          <h1>React Frontend for Telecom Network</h1>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile/me"
              element={<PrivateRoute><Profile /></PrivateRoute>}
            />
            <Route
              path="/users"
              element={<PrivateRoute><UsersListPage /></PrivateRoute>}
            />
            <Route
              path="/connections/pending"
              element={<PrivateRoute><ConnectionRequestsPage /></PrivateRoute>}
            />
            <Route
              path="/my-connections"
              element={<PrivateRoute><MyConnectionsPage /></PrivateRoute>}
            />
            <Route
              path="/feed"
              element={<PrivateRoute><PostsFeedPage /></PrivateRoute>}
            />
            <Route
              path="/games"
              element={<PrivateRoute><GamesPage /></PrivateRoute>}
            />
            <Route
              path="/games/play/:gameId"
              element={<PrivateRoute><PlayGamePage /></PrivateRoute>}
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
