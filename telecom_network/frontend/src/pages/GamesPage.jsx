import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGames, resetGameState } from '../features/game/gameSlice';
import GameCard from '../components/GameCard'; // Adjusted path to be relative

function GamesPage() {
  const dispatch = useDispatch();
  const { games, isLoading, isError, message } = useSelector((state) => state.games);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    // Dispatch fetchGames with current filters.
    // An empty object {} means no filters, backend should return all.
    dispatch(fetchGames(categoryFilter ? { category: categoryFilter } : {}));
  }, [dispatch, categoryFilter]);

  useEffect(() => {
    // This effect handles general error messages from fetching games.
    // Specific UI for errors (e.g., inline messages) is preferred over alerts for better UX.
    if (isError && message) {
      console.error("Error fetching games:", message); // Log error for dev
      // alert(`Error fetching games: ${message}`); // Avoid alert if possible
      // Consider setting a local error state to display inline message
      // dispatch(resetGameState()); // Reset global state if error is handled locally
    }
    // If there's a success message (though fetchGames doesn't set one usually), handle if needed
    // else if (!isError && message) {
    //   console.log("Games Page Message:", message);
    //   dispatch(resetGameState());
    // }
  }, [isError, message, dispatch]);

  return (
    <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', marginBottom: '25px', color: '#333'}}>Games Arcade</h2>
      <div style={{marginBottom: '25px', textAlign: 'center'}}>
        <label htmlFor="category-filter" style={{marginRight: '10px', fontSize: '1rem'}}>Filter by Category: </label>
        <select
          id="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem'}}
        >
          <option value="">All Categories</option>
          <option value="HTML5">HTML5 Games</option>
          <option value="ESPORTS">eSports</option>
          <option value="INSTANT">Instant Games</option>
        </select>
      </div>

      {isLoading && games.length === 0 && <p style={{textAlign: 'center', fontSize: '1.1rem'}}>Loading games...</p>}

      {isError && games.length === 0 && (
        <p style={{color: 'red', textAlign: 'center', fontSize: '1.1rem'}}>
          Could not load games. {message || "Please try again later."}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
        {games.length > 0 ? (
          games.map(game => <GameCard key={game.id} game={game} />)
        ) : (
          !isLoading && !isError && <p style={{textAlign: 'center', fontSize: '1.1rem', marginTop: '20px'}}>No games found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}
export default GamesPage;
