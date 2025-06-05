import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { useDispatch, useSelector } from 'react-redux';
import { fetchAffiliateItems, resetAffiliateState } from '../features/affiliate/affiliateSlice';
import AffiliateItemCard from '../components/AffiliateItemCard'; // Corrected path assuming components folder is sibling to pages

// Basic debounce function
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

function PartnerOffersPage() {
  const dispatch = useDispatch();
  const { items, isLoading, isError, message, count, nextPage, previousPage } = useSelector((state) => state.affiliateItems);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchInput, setCurrentSearchInput] = useState(''); // For controlled input
  const [ordering, setOrdering] = useState('-display_priority');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['SOFTWARE', 'HARDWARE', 'SERVICES', 'TRAINING', 'BOOKS', 'OTHER'];

  // Debounced version of setSearchTerm
  const debouncedSetSearchTerm = useCallback(debounce(setSearchTerm, 500), []);


  useEffect(() => {
    const params = { ordering, page: currentPage };
    if (categoryFilter) params.category = categoryFilter;
    if (searchTerm) params.search = searchTerm; // Use debounced searchTerm

    dispatch(fetchAffiliateItems(params));

    // Cleanup: It might be too aggressive to reset the entire state on unmount.
    // Users might want to return to their previous filtered/paginated view.
    // Consider if reset is needed or if existing data should persist for better UX.
    // return () => { dispatch(resetAffiliateState()); };
  }, [dispatch, categoryFilter, searchTerm, ordering, currentPage]);

  useEffect(() => {
    if (isError && message) {
      console.error("Error fetching partner offers:", message);
      // Using an inline message or toast is better than alert.
      // For now, this console log + potential inline display will suffice.
    }
  }, [isError, message]);

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleSearchInputChange = (e) => {
    setCurrentSearchInput(e.target.value);
    debouncedSetSearchTerm(e.target.value.trim());
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleOrderingChange = (e) => {
    setOrdering(e.target.value);
    setCurrentPage(1); // Reset to page 1 on ordering change
  };

  // Basic pagination handlers (assuming API returns full URLs for next/prev)
  const handlePageChange = (newPage) => {
      if (newPage < 1) return; // Should not happen if buttons are disabled correctly
      // Potentially extract page number from nextPage/previousPage URLs if API provides full URLs
      // For now, just increment/decrement currentPage state
      setCurrentPage(newPage);
  };


  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#333', marginBottom: '10px' }}>Partner Offers & Recommendations</h1>
        <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.5' }}>
          Explore exclusive deals and recommended resources from our trusted partners.
          <br/><em>As an affiliate, we may earn from qualifying purchases when you use these links. Your support helps us grow!</em>
        </p>
      </header>

      {/* Filters and Search Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around', // Better spacing for multiple items
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px', // Increased gap
        padding: '15px',
        background: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <div>
          <label htmlFor="category-filter" style={{marginRight: '8px', fontWeight: '500', fontSize: '0.9rem'}}>Category: </label>
          <select id="category-filter" value={categoryFilter} onChange={handleCategoryChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="">All</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase().replace('_', ' ')}</option>)}
          </select>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input
            type="search"
            placeholder="Search offers..."
            value={currentSearchInput}
            onChange={handleSearchInputChange}
            style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '250px'}}
          />
          {/* Search button can be added if debouncing is not preferred for auto-search */}
        </div>
        <div>
          <label htmlFor="ordering-filter" style={{marginRight: '8px', fontWeight: '500', fontSize: '0.9rem'}}>Sort by: </label>
          <select id="ordering-filter" value={ordering} onChange={handleOrderingChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="-display_priority">Priority</option>
            <option value="-created_at">Newest</option>
            <option value="name">Name (A-Z)</option>
            <option value="-name">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && <p style={{ textAlign: 'center', fontSize: '1.2rem', padding: '30px 0', color: '#555' }}>Loading offers...</p>}
      {isError && (
        <p style={{ color: 'red', textAlign: 'center', padding: '30px 0', fontSize: '1.1rem' }}>
          Could not load partner offers: {message}. Please try refreshing or check your connection.
        </p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: '1.1rem', padding: '30px 0', color: '#777' }}>
          No partner offers found matching your current filters. Try adjusting your search!
        </p>
      )}

      {/* Items Display */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
        {items.map(item => <AffiliateItemCard key={item.id} item={item} />)}
      </div>

      {/* Pagination Controls (Basic Example) */}
      {!isLoading && count > 0 && (
        <div style={{textAlign: 'center', marginTop: '30px', padding: '15px', borderTop: '1px solid #eee'}}>
          <p style={{marginBottom: '10px', color: '#555'}}>Showing {items.length} of {count} offers.</p>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={!previousPage || isLoading} style={{marginRight: '10px', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer'}}>
            Previous
          </button>
          <span style={{margin: '0 10px', color: '#333', fontWeight: 'bold'}}>Page {currentPage}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={!nextPage || isLoading} style={{marginLeft: '10px', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer'}}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
export default PartnerOffersPage;
