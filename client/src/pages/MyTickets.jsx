import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRDisplay from '../components/QRDisplay';
import Loader from '../components/Loader';
import './MyTickets.css';

const STATUS_CONFIG = {
  booked: { label: 'Confirmed', color: 'badge-green', icon: '✓' },
  'checked-in': { label: 'Checked In', color: 'badge-blue', icon: '⚡' },
  cancelled: { label: 'Cancelled', color: 'badge-red', icon: '✕' },
};

const CATEGORY_ICONS = {
  hackathon: '⚡', coding: '💻', paper_presentation: '📄',
  workshop: '🔧', quiz: '🧠', other: '🎯'
};

function TicketCard({ ticket }) {
  const [expanded, setExpanded] = useState(false);
  const event = ticket.eventId;
  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.booked;
  const eventDate = event ? new Date(event.date) : null;
  const isUpcoming = eventDate && eventDate >= new Date();

  return (
    <div className={`ticket-card ${ticket.status === 'checked-in' ? 'ticket-used' : ''}`}>
      {/* Ticket tear line */}
      <div className="ticket-tear" />

      <div className="ticket-main">
        <div className="ticket-header">
          <div className="ticket-event-icon">
            {CATEGORY_ICONS[event?.category] || '🎯'}
          </div>
          <div className="ticket-header-info">
            <h3 className="ticket-event-name">{event?.title || 'Event'}</h3>
            <div className="ticket-header-meta">
              {eventDate && (
                <span>{eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              )}
              {event?.time && <span>• {event.time}</span>}
              {event?.venue && <span>• {event.venue}</span>}
            </div>
          </div>
          <span className={`badge ${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>

        <div className="ticket-divider">
          <div className="divider-dot left" />
          <div className="divider-line" />
          <div className="divider-dot right" />
        </div>

        <div className="ticket-body">
          <div className="ticket-details">
            <div className="ticket-detail-item">
              <span className="detail-label">Ticket ID</span>
              <span className="detail-value text-mono">{ticket.ticketId}</span>
            </div>
            <div className="ticket-detail-item">
              <span className="detail-label">Amount Paid</span>
              <span className="detail-value">
                {ticket.amountPaid === 0 ? (
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                ) : `₹${ticket.amountPaid}`}
              </span>
            </div>
            <div className="ticket-detail-item">
              <span className="detail-label">Booked On</span>
              <span className="detail-value">
                {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {ticket.status === 'checked-in' && ticket.checkedInAt && (
              <div className="ticket-detail-item">
                <span className="detail-label">Checked In</span>
                <span className="detail-value" style={{ color: 'var(--info)' }}>
                  {new Date(ticket.checkedInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          <div className="ticket-qr-section">
            {expanded ? (
              <>
                <QRDisplay
                  qrCode={ticket.qrCode}
                  ticketId={ticket.ticketId}
                  eventTitle={event?.title}
                />
                <button
                  className="btn btn-ghost btn-sm qr-toggle"
                  onClick={() => setExpanded(false)}
                >
                  ↑ Hide QR
                </button>
              </>
            ) : (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setExpanded(true)}
                disabled={ticket.status === 'cancelled'}
              >
                🔲 Show QR Code
              </button>
            )}
          </div>
        </div>

        {isUpcoming && ticket.status === 'booked' && (
          <div className="ticket-reminder">
            <span>📅</span>
            <span>Upcoming event — present QR code at the venue for entry</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await ticketsAPI.getMy();
        setTickets(res.data.tickets);
      } catch (err) {
        console.error('Failed to load tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter(t => t.status === filter);

  const stats = {
    total: tickets.length,
    upcoming: tickets.filter(t => t.status === 'booked' && new Date(t.eventId?.date) >= new Date()).length,
    checkedIn: tickets.filter(t => t.status === 'checked-in').length,
  };

  return (
    <div className="my-tickets-page page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>My Tickets</h1>
          <p>All your event registrations in one place</p>
        </div>

        {loading ? (
          <Loader text="Loading tickets..." />
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🎫</span>
            <h3>No tickets yet</h3>
            <p>You haven't booked any events. Start exploring!</p>
            <Link to="/events" className="btn btn-primary">Browse Events →</Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="tickets-stats">
              <div className="ticket-stat">
                <span className="ticket-stat-num">{stats.total}</span>
                <span className="ticket-stat-label">Total</span>
              </div>
              <div className="ticket-stat">
                <span className="ticket-stat-num" style={{ color: 'var(--success)' }}>{stats.upcoming}</span>
                <span className="ticket-stat-label">Upcoming</span>
              </div>
              <div className="ticket-stat">
                <span className="ticket-stat-num" style={{ color: 'var(--info)' }}>{stats.checkedIn}</span>
                <span className="ticket-stat-label">Attended</span>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="tickets-filter">
              {[
                { value: 'all', label: 'All' },
                { value: 'booked', label: 'Confirmed' },
                { value: 'checked-in', label: 'Attended' },
              ].map(f => (
                <button
                  key={f.value}
                  className={`filter-tab ${filter === f.value ? 'active' : ''}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 200 }}>
                <p>No tickets in this category.</p>
              </div>
            ) : (
              <div className="tickets-list">
                {filtered.map(ticket => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
