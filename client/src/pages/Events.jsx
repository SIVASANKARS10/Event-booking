import React, { useState, useEffect, useCallback } from 'react';
import { eventsAPI } from '../services/api';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== 'all') params.category = category;
      const res = await eventsAPI.getAll(params);
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="events-page page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>All Events</h1>
          <p>Browse and register for events at TechSymposium 2025</p>
        </div>

        <SearchBar
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={handleCategoryChange}
        />

        {loading ? (
          <Loader text="Fetching events..." />
        ) : events.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <h3>No events found</h3>
            <p>Try adjusting your search or filter criteria.</p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="events-results-info">
              <span>{pagination.total} event{pagination.total !== 1 ? 's' : ''} found</span>
            </div>

            <div className="events-grid">
              {events.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <div className="pagination-pages">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`page-btn ${p === page ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.pages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
