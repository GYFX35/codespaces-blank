import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; // Added for "View All Games" link
import { fetchAllPosts, resetPostState } from '../features/post/postSlice';
import { fetchGames } from '../features/game/gameSlice'; // Added to fetch games
import CreatePostForm from '../components/CreatePostForm';
import GameCard from '../components/GameCard'; // Added to display game cards

function PostsFeedPage() {
  const dispatch = useDispatch();

  // Posts state
  const { posts, isLoading: postsIsLoading, isError: postsIsError, message: postsMessage } = useSelector((state) => state.posts);

  // Games state (for featured games)
  // Renaming isLoading to gamesIsLoading to avoid conflict with postsIsLoading
  const { games, isLoading: gamesIsLoading, isError: gamesIsError, message: gamesMessage } = useSelector((state) => state.games);

  useEffect(() => {
    // Fetch posts
    dispatch(fetchAllPosts());
    // Fetch featured games (e.g., top 3 or based on a filter)
    dispatch(fetchGames({ is_featured: true }));
  }, [dispatch]);

  useEffect(() => {
    // Handle messages from post fetching/creation
    if (postsIsError && postsMessage && !postsMessage.includes('Failed to create post')) {
      alert("Feed Error: " + postsMessage);
      dispatch(resetPostState());
    }
    // Note: CreatePostForm handles its own direct feedback.
    // Global success messages for posts (like "Post created successfully!") are handled by CreatePostForm if needed.
  }, [postsIsError, postsMessage, dispatch]);

  useEffect(() => {
    // Handle messages from game fetching
    if (gamesIsError && gamesMessage) {
      console.error("Featured Games Error: " + gamesMessage); // Less intrusive for game section
      // dispatch(resetGameState()); // gameSlice should have its own reset if needed
    }
  }, [gamesIsError, gamesMessage, dispatch]);

  // Filter for featured games to display, e.g., first 3
  // This assumes the backend returns all featured games if {is_featured: true} is passed,
  // or the slice/selector should handle this filtering/limiting if backend sends all games.
  // For now, let's assume `games` in state.games IS the list of featured games when that filter is active.
  // If `fetchGames({ is_featured: true })` returns only featured games, then `games` is already that list.
  // The backend GameListView filters by is_featured=true if passed.
  const actualFeaturedGames = games.slice(0, 3); // Take top 3 from whatever `games` list is (could be already filtered)

  if (postsIsLoading && posts.length === 0) return <p>Loading posts...</p>;

  // Main return for the page
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Feed</h2>
      <CreatePostForm />

      {postsIsError && posts.length === 0 && postsMessage && !postsMessage.includes('Failed to create post') && (
        <p style={{color: 'red'}}>Error fetching posts: {postsMessage}</p>
      )}

      {posts.length === 0 && !postsIsLoading && !postsIsError && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>No posts yet. Be the first to share!</p>
      )}

      <div className="posts-list" style={{ marginTop: '30px' }}>
        {posts.map(post => (
          <div
            key={post.id}
            style={{
              border: '1px solid #e0e0e0',
              padding: '15px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{post.user.username}</p>
                <p style={{ margin: 0, fontSize: '0.8em', color: '#666' }}>
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <p style={{ margin: '10px 0', lineHeight: '1.6' }}>{post.content}</p>
          </div>
        ))}
      </div>

      {/* Featured Games Section */}
      <div className="featured-games-section" style={{marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee'}}>
        <h3 style={{textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem'}}>Featured Games</h3>
        {gamesIsLoading && actualFeaturedGames.length === 0 && <p style={{textAlign: 'center'}}>Loading featured games...</p>}
        {!gamesIsLoading && !gamesIsError && actualFeaturedGames.length === 0 && <p style={{textAlign: 'center'}}>No featured games available at the moment.</p>}
        {gamesIsError && <p style={{textAlign: 'center', color: 'red'}}>Could not load featured games.</p>}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          {actualFeaturedGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {(actualFeaturedGames.length > 0 || games.length > 3) &&  // Show "View All" if there are any featured, or if total games fetched (assuming `games` holds only featured here) might be more than 3
          <div style={{textAlign: 'center', marginTop: '20px'}}>
            <Link to="/games" style={{textDecoration: 'none', color: '#fff', backgroundColor: '#555', padding: '10px 20px', borderRadius: '5px', fontSize: '1rem'}}>
              View All Games
            </Link>
          </div>
        }
      </div>
    </div>
  );
}
export default PostsFeedPage;
