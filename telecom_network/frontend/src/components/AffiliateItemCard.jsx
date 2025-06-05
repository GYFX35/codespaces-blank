import React from 'react';

function AffiliateItemCard({ item }) {
  const defaultImage = 'https://via.placeholder.com/350x200.png?text=Partner+Offer';

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '10px', // Slightly more rounded
      padding: '1rem',
      margin: '0.75rem', // Consistent margin
      width: 'clamp(280px, calc(33% - 1.5rem), 320px)', // Responsive width for 3-column layout on larger screens
      textAlign: 'left',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Softer shadow
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Hover effect
    }}
    // Simple hover effect via inline style (can be moved to CSS module/styled-component)
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';}}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';}}
    >
      <img
        src={item.image_url || defaultImage}
        alt={item.name}
        style={{
          width: '100%',
          height: '180px', // Increased height
          objectFit: 'contain',
          marginBottom: '1rem',
          borderRadius: '6px', // Match card rounding
          border: '1px solid #f0f0f0' // Lighter border for image
        }}
      />
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 title={item.name} style={{
            fontSize: '1.2rem', // Slightly larger title
            fontWeight: '600', // Bolder title
            marginBottom: '0.5rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#333'
          }}>
            {item.name}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.5rem' }}>
            Category: {item.category.charAt(0) + item.category.slice(1).toLowerCase().replace('_', ' ')}
          </p>
          <p style={{
            fontSize: '0.9rem',
            color: '#444',
            marginBottom: '1rem',
            height: '63px', // Approx 3 lines for 1.4 line-height
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3, // Standard property for line clamping
            WebkitBoxOrient: 'vertical' // Standard property for line clamping
          }} title={item.description}>
            {item.description || "No description available."}
          </p>
        </div>
        <a
          href={item.affiliate_url}
          target="_blank"
          rel="noopener noreferrer sponsored" // Added 'sponsored' for affiliate links
          style={{
            textDecoration: 'none',
            color: '#fff',
            backgroundColor: '#2F3BA2',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            display: 'block',
            textAlign: 'center',
            fontSize: '1rem', // Larger button text
            fontWeight: 'bold',
            marginTop: 'auto', // Ensure button is at the bottom
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#252E82';}} // Darken on hover
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2F3BA2';}}
        >
          View Offer
        </a>
      </div>
    </div>
  );
}
export default AffiliateItemCard;
