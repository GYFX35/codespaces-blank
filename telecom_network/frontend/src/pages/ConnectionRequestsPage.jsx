import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchIncomingPending,
    fetchOutgoingPending,
    connectionAction, // New import
    resetConnectionState
} from '../features/connection/connectionSlice';

function ConnectionRequestsPage() {
  const dispatch = useDispatch();
  const { incomingPending, outgoingPending, isLoading, isError, message } = useSelector((state) => state.connections);
  const [view, setView] = useState('incoming'); // 'incoming' or 'outgoing'

  useEffect(() => {
    if (view === 'incoming') {
      dispatch(fetchIncomingPending());
    } else {
      dispatch(fetchOutgoingPending());
    }
  }, [dispatch, view]);

  useEffect(() => {
    // Display messages from API calls (e.g., success or error)
    // The message state in Redux is updated by thunks
    if (isError && message) {
      alert("Error: " + message); // Replace with a more sophisticated notification system
      dispatch(resetConnectionState());
    } else if (message && message.toLowerCase().includes('successfully')) {
      // Check for any success message (could be from accept, decline, cancel)
      alert(message); // Replace with a more sophisticated notification system
      dispatch(resetConnectionState());
    }
  }, [isError, message, dispatch]);

  const handleAction = (connectionId, action) => {
    if (isLoading) return; // Prevent multiple clicks while processing
    dispatch(connectionAction({ connectionId, action }));
  };

  // More specific loading state based on current view and data length
  const currentList = view === 'incoming' ? incomingPending : outgoingPending;
  if (isLoading && currentList.length === 0 ) {
      return <p>Loading requests...</p>;
  }

  return (
    <div>
      <h2>Pending Connection Requests</h2>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('incoming')} disabled={view === 'incoming' || isLoading} style={{ marginRight: '10px' }}>
          Incoming ({incomingPending.length})
        </button>
        <button onClick={() => setView('outgoing')} disabled={view === 'outgoing' || isLoading}>
          Outgoing ({outgoingPending.length})
        </button>
      </div>

      {/* General error/message display is handled by useEffect alerts for now */}

      {view === 'incoming' && (
        <div>
          <h3>Incoming Requests</h3>
          {isLoading && incomingPending.length === 0 && <p>Loading...</p>}
          {!isLoading && incomingPending.length === 0 && <p>No incoming connection requests.</p>}
          <ul>
            {incomingPending.map(req => (
              <li key={req.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>From: {req.from_user.username} (Sent: {new Date(req.created_at).toLocaleDateString()})</span>
                <div>
                  <button onClick={() => handleAction(req.id, 'accept')} disabled={isLoading} style={{marginLeft: '10px'}}>Accept</button>
                  <button onClick={() => handleAction(req.id, 'decline')} disabled={isLoading} style={{marginLeft: '5px'}}>Decline</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {view === 'outgoing' && (
        <div>
          <h3>Outgoing Requests</h3>
          {isLoading && outgoingPending.length === 0 && <p>Loading...</p>}
          {!isLoading && outgoingPending.length === 0 && <p>No outgoing connection requests sent.</p>}
          <ul>
            {outgoingPending.map(req => (
              <li key={req.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>To: {req.to_user.username} (Sent: {new Date(req.created_at).toLocaleDateString()})</span>
                <div>
                  <button onClick={() => handleAction(req.id, 'cancel')} disabled={isLoading} style={{marginLeft: '10px'}}>Cancel Request</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
export default ConnectionRequestsPage;
