import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGameDetails, clearSelectedGame, resetGameState } from '../features/game/gameSlice';

function PlayGamePage() {
  const { gameId } = useParams();
  const dispatch = useDispatch();
  const { selectedGame, isLoading, isError, message } = useSelector((state) => state.games);

  useEffect(() => {
    if (gameId) {
      dispatch(fetchGameDetails(gameId));
    }
    // Cleanup function when the component unmounts or gameId changes
    return () => {
      dispatch(clearSelectedGame()); // Clear the selected game from Redux state
      // Optionally, reset other parts of game state if errors shouldn't persist across views
      // dispatch(resetGameState()); // This would clear errors/messages too. Use clearSelectedGame for targeted cleanup.
    };
  }, [dispatch, gameId]);

  // Loading state while fetching or if selectedGame is not yet populated
  if (isLoading || (!selectedGame && !isError)) {
    return <p style={{textAlign: 'center', padding: '30px', fontSize: '1.2rem'}}>Loading game details...</p>;
  }

  // Error state if fetching details failed
  if (isError) {
    return (
      <div style={{textAlign: 'center', padding: '30px'}}>
        <p style={{color: 'red', fontSize: '1.2rem'}}>Error loading game: {message || "Unknown error"}</p>
        <Link to="/games" style={{color: '#2F3BA2', fontWeight: 'bold', textDecoration: 'none', marginTop: '15px', display: 'inline-block'}}>
          Back to Games List
        </Link>
      </div>
    );
  }

  // If no game was found (e.g., invalid ID) but no error state was set (should ideally be an error)
  if (!selectedGame) {
    return (
      <div style={{textAlign: 'center', padding: '30px'}}>
        <p style={{fontSize: '1.2rem'}}>Game not found.</p>
        <Link to="/games" style={{color: '#2F3BA2', fontWeight: 'bold', textDecoration: 'none', marginTop: '15px', display: 'inline-block'}}>
          Back to Games List
        </Link>
      </div>
    );
  }

  // Determine if the game can be embedded based on its category
  const canEmbed = selectedGame.category === 'HTML5' || selectedGame.category === 'INSTANT';

  return (
    <div style={{padding: '20px', maxWidth: '1000px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', marginBottom: '10px', color: '#333'}}>{selectedGame.name}</h2>
      <p style={{textAlign: 'center', color: '#555', marginBottom: '25px', fontSize: '0.9rem'}}>Category: {selectedGame.category}</p>

      {canEmbed ? (
        <div style={{border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
          <iframe
            src={selectedGame.game_url}
            title={selectedGame.name}
            style={{
              width: '100%',
              height: 'calc(100vh - 220px)', // Adjusted height based on typical viewport needs
              minHeight: '500px', // Minimum height for usability
              border: 'none',
              display: 'block'
            }}
            allowFullScreen
            // Common sandbox attributes for security, adjust as needed for specific games
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-orientation-lock allow-pointer-lock"
          ></iframe>
        </div>
      ) : (
        <div style={{textAlign: 'center', padding: '30px', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)'}}>
          <p style={{fontSize: '1.1rem', marginBottom: '15px'}}>{selectedGame.description || "No detailed description available."}</p>
          <p style={{marginTop: '20px'}}>
            Visit game/info page: <br/>
            <a href={selectedGame.game_url} target="_blank" rel="noopener noreferrer" style={{color: '#2F3BA2', fontWeight: 'bold', wordBreak: 'break-all'}}>
              {selectedGame.game_url}
            </a>
          </p>
        </div>
      )}
      <Link
        to="/games"
        style={{
          display: 'block',
          textAlign: 'center',
          marginTop: '25px',
          color: '#2F3BA2',
          fontWeight: 'bold',
          fontSize: '1rem',
          textDecoration: 'none'
        }}
      >
        &larr; Back to Games List
      </Link>
    </div>
  );
}
export default PlayGamePage;
