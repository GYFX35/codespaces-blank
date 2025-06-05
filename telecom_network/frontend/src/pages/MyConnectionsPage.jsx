import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAcceptedConnections, resetConnectionState, connectionAction } from '../features/connection/connectionSlice'; // Added connectionAction for remove

function MyConnectionsPage() {
  const dispatch = useDispatch();
  const { acceptedConnections, isLoading, isError, message } = useSelector((state) => state.connections);

  useEffect(() => {
    dispatch(fetchAcceptedConnections());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) { // Only show error messages here
      alert("Error: " + message); // Replace with a more sophisticated notification system
      dispatch(resetConnectionState());
    } else if (message && message.toLowerCase().includes('successfully')) { // Success messages from actions
      alert(message);
      dispatch(resetConnectionState());
    }
  }, [isError, message, dispatch]);

  const handleRemoveConnection = (connectionId) => {
    // For removing a connection, the backend might expect a 'remove' or 'unfriend' action.
    // Or it might be a DELETE request to a specific endpoint.
    // For now, let's assume 'cancel' can be re-used if the backend logic allows
    // cancelling an 'accepted' connection by one of its participants, effectively removing it.
    // This is a placeholder and likely needs a dedicated backend action and endpoint.
    // A more robust way would be a new 'remove' action.
    // For this example, we'll use 'cancel' as a stand-in if allowed, or this button should be different.
    // Let's assume 'cancel' is not the right action for an *accepted* connection.
    // This button would dispatch a new thunk like `removeConnection(connectionId)`.
    // For now, the button will be a placeholder.
    alert(`Remove functionality for connection ${connectionId} to be implemented with a proper 'remove' action.`);
    // Example of how it might look if 'cancel' was a generic 'end connection' action:
    // dispatch(connectionAction({ connectionId, action: 'remove' })); // Assuming 'remove' is a valid action
  };

  if (isLoading && acceptedConnections.length === 0) return <p>Loading connections...</p>;

  return (
    <div>
      <h2>My Connections ({acceptedConnections.length})</h2>
      {/* Error messages are handled by useEffect alert */}
      {!isLoading && acceptedConnections.length === 0 && !isError && <p>You have no connections yet.</p>}
      <ul>
        {acceptedConnections.map(conn => (
          <li key={conn.connection_id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {conn.connected_user.username}
              (Connected since: {new Date(conn.established_at).toLocaleDateString()})
            </span>
            {/* Placeholder for remove button */}
            <button onClick={() => handleRemoveConnection(conn.connection_id)} disabled={isLoading} style={{marginLeft: '10px'}}>
              Remove Connection
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default MyConnectionsPage;
