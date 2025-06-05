import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllUsers,
    sendRequest,
    resetConnectionState,
    fetchIncomingPending,
    fetchOutgoingPending,
    fetchAcceptedConnections // New import
} from '../features/connection/connectionSlice';
import { Link } from 'react-router-dom'; // For linking to pending requests

function UsersListPage() {
  const dispatch = useDispatch();
  const { users, isLoading, isError, message, outgoingPending, incomingPending, acceptedConnections } = useSelector((state) => state.connections);
  const { user: currentUser } = useSelector((state) => state.auth); // Current logged-in user

  useEffect(() => {
    // Fetch all necessary data for displaying user statuses correctly
    dispatch(fetchAllUsers());
    dispatch(fetchIncomingPending());
    dispatch(fetchOutgoingPending());
    dispatch(fetchAcceptedConnections());
  }, [dispatch]); // Runs once on component mount

  useEffect(() => {
    // Handle feedback messages (errors or successes from sendRequest)
    if (isError && message) {
      alert("Error: " + message); // Replace with a more sophisticated notification system
      dispatch(resetConnectionState());
    } else if (message && (message.includes('Connection request sent!') || message.toLowerCase().includes('successfully'))) {
      // Catch success from sendRequest or other successful actions if any were to set a message
      alert(message); // Replace with a more sophisticated notification system
      dispatch(resetConnectionState());
    }
  }, [isError, message, dispatch]);

  const handleSendRequest = (toUserId) => {
    if (isLoading) return; // Prevent multiple clicks
    dispatch(sendRequest(toUserId));
  };

  if (isLoading && users.length === 0 && acceptedConnections.length === 0) return <p>Loading user data...</p>;

  return (
    <div>
      <h2>Discover Users</h2>
      {/* General error display (if not handled by alert) */}
      {isError && message && !(message.includes('Connection request sent!') || message.toLowerCase().includes('successfully')) &&
        <p style={{color: 'red'}}>Error: {message}</p>}

      {users.length === 0 && !isLoading && <p>No other users found.</p>}
      <ul>
        {users.map((user) => {
          const isSelf = user.id === currentUser?.id;
          const hasOutgoingPending = outgoingPending.some(req => req.to_user.id === user.id);
          const hasIncomingPending = incomingPending.some(req => req.from_user.id === user.id);
          const isConnected = acceptedConnections.some(conn => conn.connected_user.id === user.id);

          let actionButton = null;

          if (isSelf) {
            // No button for self, or could show "(You)"
          } else if (isConnected) {
            actionButton = <button disabled={true} style={{marginLeft: '10px'}}>Connected</button>;
          } else if (hasOutgoingPending) {
            actionButton = <button disabled={true} style={{marginLeft: '10px'}}>Request Sent</button>;
          } else if (hasIncomingPending) {
            actionButton = (
              <Link to="/connections/pending" style={{marginLeft: '10px'}}>
                <button>Request Received (View)</button>
              </Link>
            );
          } else {
            actionButton = (
              <button onClick={() => handleSendRequest(user.id)} disabled={isLoading} style={{marginLeft: '10px'}}>
                {isLoading ? 'Sending...' : 'Send Request'}
              </button>
            );
          }

          return (
            <li key={user.id} style={{ margin: '10px 0', padding: '5px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{user.username} ({user.first_name || ''} {user.last_name || ''})</span>
              {actionButton}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default UsersListPage;
