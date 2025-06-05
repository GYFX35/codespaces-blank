import React from 'react';
import { Link } from 'react-router-dom';

function GameCard({ game }) {
  const defaultThumbnail = 'https://via.placeholder.com/300x200.png?text=No+Image'; // A common placeholder service

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '1rem',
      margin: '0.5rem',
      width: '280px', // Fixed width for consistent card size
      textAlign: 'left',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between' // Ensures button aligns at bottom if text varies
    }}>
      <div>
        <img
          src={game.thumbnail_url || defaultThumbnail}
          alt={`${game.name} thumbnail`}
          style={{
            width: '100%',
            height: '140px', // Fixed height for image consistency
            objectFit: 'cover',
            marginBottom: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #eee' // Slight border for images
          }}
        />
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 'bold', // Make title bolder
            marginBottom: '0.5rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={game.name} // Show full name on hover
        >
          {game.name}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
          Category: {game.category}
        </p>
        {/* Optional: Short description snippet */}
        {/* <p style={{ fontSize: '0.8rem', color: '#777', marginBottom: '1rem', height: '3.2em', overflow: 'hidden' }}>
          {game.description.substring(0, 80) + (game.description.length > 80 ? '...' : '')}
        </p> */}
      </div>
      <Link
        to={`/games/play/${game.id}`}
        style={{
          textDecoration: 'none',
          color: '#ffffff',
          backgroundColor: '#2F3BA2',
          padding: '0.6rem 1rem', // Slightly adjusted padding
          borderRadius: '4px',
          display: 'block', // Make link take full width of its container (button-like)
          textAlign: 'center',
          fontSize: '0.9rem',
          marginTop: 'auto' // Pushes button to bottom if card content is short
        }}
      >
        Play / View Details
      </Link>
    </div>
  );
}
export default GameCard;
