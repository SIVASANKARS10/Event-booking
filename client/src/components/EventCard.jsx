import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const CATEGORY_LABELS = {
  hackathon: 'Hackathon',
  coding: 'Coding',
  paper_presentation: 'Paper',
  workshop: 'Workshop',
  quiz: 'Quiz',
  other: 'Other'
};

const CATEGORY_COLORS = {
  hackathon: 'badge-amber',
  coding: 'badge-blue',
  paper_presentation: 'badge-green',
  workshop: 'badge-blue',
  quiz: 'badge-amber',
  other: 'badge-gray'
};

const CATEGORY_ICONS = {
  hackathon: '⚡',
  coding: '💻',
  paper_presentation: '📄',
  workshop: '🔧',
  quiz: '🧠',
  other: '🎯'
};

export default function EventCard({ event }) {
  const date = new Date(event.date);
  const isFullyBooked = event.availableSeats === 0;
  const isPast = date < new Date();
  const fillPercent = ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;

  return (
    <div className={`event-card ${isFullyBooked ? 'event-card-full' : ''}`}>
      <div className="event-card-header">
        <div className="event-card-icon">{CATEGORY_ICONS[event.category] || '🎯'}</div>
        <div className="event-card-badges">
          <span className={`badge ${CATEGORY_COLORS[event.category] || 'badge-gray'}`}>
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
          {isFullyBooked && <span className="badge badge-red">FULL</span>}
          {isPast && !isFullyBooked && <span className="badge badge-gray">PAST</span>}
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-desc">{event.description}</p>

        <div className="event-card-meta">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🕐</span>
            <span>{event.time}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <span>{event.venue}</span>
          </div>
        </div>

        <div className="event-card-seats">
          <div className="seats-info">
            <span className="seats-label">Seats</span>
            <span className="seats-count">
              {event.availableSeats} / {event.totalSeats} left
            </span>
          </div>
          <div className="seats-bar">
            <div className="seats-fill" style={{ width: `${fillPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="event-card-footer">
        <div className="event-price">
          {event.price === 0 ? (
            <span className="price-free">FREE</span>
          ) : (
            <span className="price-amount">₹{event.price}</span>
          )}
        </div>
        <Link to={`/events/${event._id}`} className="btn btn-outline btn-sm">
          View Details →
        </Link>
      </div>
    </div>
  );
}
