import React, { useState, useEffect, useCallback } from 'react';
import { eventsAPI, ticketsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import './AdminDashboard.css';

// ─────────────────────────────────────────────────────
// Event Form Modal (Create / Edit)
// ─────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', description: '', category: 'other', date: '',
  time: '', venue: '', price: 0, totalSeats: 50,
  rules: '', prizes: '', maxTeamSize: 1, tags: ''
};

function EventFormModal({ event, onClose, onSave }) {
  const [form, setForm] = useState(event ? {
    ...event,
    date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
    tags: Array.isArray(event.tags) ? event.tags.join(', ') : ''
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.date || !form.time || !form.venue) {
      setError('Title, date, time and venue are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        totalSeats: Number(form.totalSeats) || 1,
        maxTeamSize: Number(form.maxTeamSize) || 1,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      if (event) {
        await eventsAPI.update(event._id, payload);
      } else {
        await eventsAPI.create(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal event-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? '✏️ Edit Event' : '➕ Create New Event'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="e.g. National Hackathon 2025" />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="Describe the event..." rows={4} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                  <option value="hackathon">⚡ Hackathon</option>
                  <option value="coding">💻 Coding</option>
                  <option value="paper_presentation">📄 Paper Presentation</option>
                  <option value="workshop">🔧 Workshop</option>
                  <option value="quiz">🧠 Quiz</option>
                  <option value="other">🎯 Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Max Team Size</label>
                <input name="maxTeamSize" type="number" className="form-input" value={form.maxTeamSize} onChange={handleChange} min={1} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input name="date" type="date" className="form-input" value={form.date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input name="time" type="text" className="form-input" value={form.time} onChange={handleChange} placeholder="e.g. 9:00 AM - 5:00 PM" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Venue *</label>
              <input name="venue" className="form-input" value={form.venue} onChange={handleChange} placeholder="e.g. Main Auditorium, Block A" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Entry Fee (₹)</label>
                <input name="price" type="number" className="form-input" value={form.price} onChange={handleChange} min={0} placeholder="0 for free" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Seats *</label>
                <input name="totalSeats" type="number" className="form-input" value={form.totalSeats} onChange={handleChange} min={1} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rules & Guidelines</label>
              <textarea name="rules" className="form-textarea" value={form.rules} onChange={handleChange} placeholder="Event rules, eligibility, etc." rows={3} />
            </div>

            <div className="form-group">
              <label className="form-label">Prizes</label>
              <textarea name="prizes" className="form-textarea" value={form.prizes} onChange={handleChange} placeholder="1st: ₹10,000 | 2nd: ₹5,000 ..." rows={2} />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input name="tags" className="form-input" value={form.tags} onChange={handleChange} placeholder="programming, ai, web, open-source" />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
                ) : event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// QR Verify Modal
// ─────────────────────────────────────────────────────
function VerifyModal({ onClose }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  const handleVerify = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await ticketsAPI.verify({ ticketId: input.trim() });
      setResult({ success: true, data: res.data });
      addToast('✅ Check-in successful!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed.';
      const ticketData = err.response?.data?.ticket;
      setResult({ success: false, message: msg, data: ticketData });
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2>🔲 QR / Ticket Verification</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
            Enter a Ticket ID (e.g. TS-ABC123-XYZ) to verify and check-in a participant.
          </p>

          <div className="verify-input-row">
            <input
              className="form-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="TS-XXXXXX-XXXXXX"
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              autoFocus
            />
            <button className="btn btn-primary" onClick={handleVerify} disabled={loading || !input.trim()}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Verify'}
            </button>
          </div>

          {result && (
            <div className={`verify-result ${result.success ? 'success' : 'error'}`}>
              <div className="verify-result-icon">{result.success ? '✓' : '✕'}</div>
              <div className="verify-result-content">
                <div className="verify-result-title">
                  {result.success ? 'Check-In Successful' : 'Verification Failed'}
                </div>
                {result.success && result.data?.ticket && (
                  <div className="verify-details">
                    <div><strong>Name:</strong> {result.data.ticket.holderName}</div>
                    <div><strong>Event:</strong> {result.data.ticket.event}</div>
                    <div><strong>Venue:</strong> {result.data.ticket.venue}</div>
                    {result.data.ticket.college && <div><strong>College:</strong> {result.data.ticket.college}</div>}
                  </div>
                )}
                {!result.success && (
                  <div className="verify-error-msg">{result.message}</div>
                )}
                {!result.success && result.data && (
                  <div className="verify-details">
                    <div><strong>Holder:</strong> {result.data.holderName}</div>
                    <div><strong>Checked in:</strong> {result.data.checkedInAt ? new Date(result.data.checkedInAt).toLocaleString() : 'N/A'}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <button className="btn btn-ghost btn-full" style={{ marginTop: 16 }} onClick={() => { setInput(''); setResult(null); }}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showVerify, setShowVerify] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStats = useCallback(async () => {
    try {
      const res = await eventsAPI.getStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Stats error', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await eventsAPI.getAll({ limit: 100 });
      setEvents(res.data.events);
    } catch (err) {
      console.error('Events error', err);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, [fetchStats, fetchEvents]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await eventsAPI.delete(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      addToast('Event deleted successfully.', 'success');
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingEvent(null);
    fetchEvents();
    fetchStats();
    addToast(editingEvent ? 'Event updated!' : 'Event created!', 'success');
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  return (
    <div className="admin-page page-wrapper">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage events, track registrations, verify tickets</p>
          </div>
          <div className="admin-header-actions">
            <button className="btn btn-ghost" onClick={() => setShowVerify(true)}>
              🔲 Verify Ticket
            </button>
            <button className="btn btn-primary" onClick={() => { setEditingEvent(null); setShowForm(true); }}>
              ➕ New Event
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'events', label: '🎯 Events' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ─────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            {loadingStats ? (
              <Loader text="Fetching analytics..." />
            ) : stats ? (
              <>
                {/* KPI Cards */}
                <div className="stats-grid">
                  {[
                    { label: 'Total Events', value: stats.totalEvents, icon: '🎯', color: 'var(--accent)' },
                    { label: 'Tickets Sold', value: stats.totalTickets, icon: '🎫', color: 'var(--success)' },
                    { label: 'Checked In', value: stats.checkedIn, icon: '✅', color: 'var(--info)' },
                    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'var(--accent)' },
                  ].map(card => (
                    <div key={card.label} className="stat-card">
                      <div className="stat-icon">{card.icon}</div>
                      <div className="stat-label">{card.label}</div>
                      <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                    </div>
                  ))}
                </div>

                {/* Event Seat Status */}
                <div className="dashboard-section">
                  <h2 className="dash-section-title">Event Seat Status</h2>
                  <div className="seat-status-table">
                    <div className="seat-table-header">
                      <span>Event</span>
                      <span>Category</span>
                      <span>Date</span>
                      <span>Booked</span>
                      <span>Available</span>
                      <span>Fill Rate</span>
                    </div>
                    {stats.events.map((ev, i) => {
                      const fill = Math.round((ev.booked / ev.totalSeats) * 100);
                      return (
                        <div key={i} className="seat-table-row">
                          <span className="seat-event-name">{ev.title}</span>
                          <span>
                            <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>
                              {ev.category}
                            </span>
                          </span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{ev.booked}</span>
                          <span style={{ color: 'var(--success)', fontWeight: 700 }}>{ev.availableSeats}</span>
                          <span className="fill-rate-cell">
                            <div className="fill-bar">
                              <div
                                className="fill-bar-inner"
                                style={{
                                  width: `${fill}%`,
                                  background: fill > 90 ? 'var(--error)' : fill > 70 ? 'var(--warning)' : 'var(--accent)'
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.78rem', minWidth: 36 }}>{fill}%</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top events by tickets */}
                {stats.ticketsByEvent?.length > 0 && (
                  <div className="dashboard-section">
                    <h2 className="dash-section-title">Most Popular Events</h2>
                    <div className="popular-events">
                      {stats.ticketsByEvent.map((item, i) => (
                        <div key={i} className="popular-event-row">
                          <span className="popular-rank">#{i + 1}</span>
                          <span className="popular-name">{item.eventName}</span>
                          <div className="popular-bar-wrap">
                            <div
                              className="popular-bar"
                              style={{ width: `${(item.count / stats.ticketsByEvent[0].count) * 100}%` }}
                            />
                          </div>
                          <span className="popular-count">{item.count} tickets</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>Could not load analytics.</p>
              </div>
            )}
          </>
        )}

        {/* ── Events Tab ───────────────────────────────────── */}
        {activeTab === 'events' && (
          <div className="events-admin-section">
            {loadingEvents ? (
              <Loader text="Loading events..." />
            ) : events.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🎯</span>
                <h3>No events yet</h3>
                <p>Create your first event to get started.</p>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  ➕ Create Event
                </button>
              </div>
            ) : (
              <div className="admin-events-list">
                {events.map(event => {
                  const eventDate = new Date(event.date);
                  const fillPct = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);
                  return (
                    <div key={event._id} className="admin-event-row">
                      <div className="admin-event-info">
                        <div className="admin-event-title">{event.title}</div>
                        <div className="admin-event-meta">
                          <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>{event.category}</span>
                          <span>📅 {eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>📍 {event.venue}</span>
                          <span style={{ color: event.price === 0 ? 'var(--success)' : 'var(--accent)' }}>
                            {event.price === 0 ? 'FREE' : `₹${event.price}`}
                          </span>
                        </div>
                      </div>

                      <div className="admin-event-seats">
                        <div className="admin-seats-text">
                          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{event.totalSeats - event.availableSeats}</span>
                          <span style={{ color: 'var(--text-muted)' }}> / {event.totalSeats} booked</span>
                        </div>
                        <div className="admin-seats-bar">
                          <div
                            className="admin-seats-fill"
                            style={{
                              width: `${fillPct}%`,
                              background: fillPct > 90 ? 'var(--error)' : fillPct > 70 ? 'var(--warning)' : 'var(--accent)'
                            }}
                          />
                        </div>
                      </div>

                      <div className="admin-event-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEdit(event)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(event._id)}
                          disabled={deletingId === event._id}
                        >
                          {deletingId === event._id ? '...' : '🗑 Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <EventFormModal
          event={editingEvent}
          onClose={() => { setShowForm(false); setEditingEvent(null); }}
          onSave={handleFormSave}
        />
      )}

      {showVerify && <VerifyModal onClose={() => setShowVerify(false)} />}
    </div>
  );
}
