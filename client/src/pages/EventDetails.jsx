import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsAPI, ticketsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import './EventDetails.css';

const CATEGORY_ICONS = {
  hackathon: '⚡', coding: '💻', paper_presentation: '📄',
  workshop: '🔧', quiz: '🧠', other: '🎯'
};

const CATEGORY_LABELS = {
  hackathon: 'Hackathon', coding: 'Coding', paper_presentation: 'Paper Presentation',
  workshop: 'Workshop', quiz: 'Technical Quiz', other: 'Other'
};

// ── Payment Simulation Modal ───────────────────────────
function PaymentModal({ event, onSuccess, onCancel }) {
  const [step, setStep] = useState('confirm'); // confirm | processing | done
  const [cardNum, setCardNum] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/26');
  const [cvv, setCvv] = useState('123');
  const [simulateFail, setSimulateFail] = useState(false);

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      if (simulateFail) {
        setStep('failed');
      } else {
        setStep('done');
        setTimeout(() => onSuccess(), 1200);
      }
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal payment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {step === 'confirm' && '💳 Secure Checkout'}
            {step === 'processing' && '⏳ Processing...'}
            {step === 'done' && '✅ Payment Successful'}
            {step === 'failed' && '❌ Payment Failed'}
          </h2>
          {step === 'confirm' && (
            <button className="modal-close" onClick={onCancel}>×</button>
          )}
        </div>

        <div className="modal-body">
          {step === 'confirm' && (
            <>
              <div className="payment-summary">
                <div className="payment-event">{event.title}</div>
                <div className="payment-amount">₹{event.price}</div>
              </div>

              <div className="divider" />

              <div className="payment-form">
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    className="form-input"
                    value={cardNum}
                    onChange={e => setCardNum(e.target.value)}
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry</label>
                    <input className="form-input" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="form-input" value={cvv} onChange={e => setCvv(e.target.value)} maxLength={3} placeholder="123" />
                  </div>
                </div>

                <div className="payment-sim-toggle">
                  <label className="sim-label">
                    <input
                      type="checkbox"
                      checked={simulateFail}
                      onChange={e => setSimulateFail(e.target.checked)}
                    />
                    <span>Simulate payment failure (testing)</span>
                  </label>
                </div>
              </div>

              <div className="payment-actions">
                <button className="btn btn-ghost btn-full" onClick={onCancel}>Cancel</button>
                <button className="btn btn-primary btn-full btn-lg" onClick={handlePay}>
                  Pay ₹{event.price} →
                </button>
              </div>

              <p className="payment-note">🔒 This is a simulated payment — no real transaction occurs.</p>
            </>
          )}

          {step === 'processing' && (
            <div className="payment-status">
              <div className="status-spinner">
                <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
              </div>
              <p>Verifying payment details...</p>
              <p className="text-muted" style={{ fontSize: '0.82rem' }}>Please do not close this window</p>
            </div>
          )}

          {step === 'done' && (
            <div className="payment-status success">
              <div className="status-icon success-icon">✓</div>
              <h3>Payment Confirmed!</h3>
              <p>Generating your ticket and QR code...</p>
            </div>
          )}

          {step === 'failed' && (
            <div className="payment-status error">
              <div className="status-icon error-icon">✕</div>
              <h3>Payment Failed</h3>
              <p>Your card was declined. Please try again.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-ghost btn-full" onClick={onCancel}>Cancel</button>
                <button className="btn btn-primary btn-full" onClick={() => setStep('confirm')}>Retry</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventsAPI.getOne(id);
        setEvent(res.data.event);
      } catch {
        addToast('Event not found.', 'error');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBookClick = () => {
    if (!user) {
      addToast('Please login to book a ticket.', 'warning');
      navigate('/login');
      return;
    }
    if (event.price === 0) {
      handleFreeBook();
    } else {
      setShowPayment(true);
    }
  };

  const handleFreeBook = async () => {
    setBooking(true);
    try {
      await ticketsAPI.book({ eventId: event._id });
      setBooked(true);
      setEvent(prev => ({ ...prev, availableSeats: prev.availableSeats - 1 }));
      addToast('🎉 Ticket booked! Check your email for the QR code.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed.';
      addToast(msg, 'error');
    } finally {
      setBooking(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setBooking(true);
    try {
      await ticketsAPI.book({ eventId: event._id, paymentSimulation: true });
      setBooked(true);
      setEvent(prev => ({ ...prev, availableSeats: prev.availableSeats - 1 }));
      addToast('🎉 Ticket booked! Check your email for the QR code.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed after payment.';
      addToast(msg, 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="page-wrapper"><Loader text="Loading event..." /></div>;
  if (!event) return null;

  const eventDate = new Date(event.date);
  const isFullyBooked = event.availableSeats === 0;
  const isPast = eventDate < new Date();
  const fillPercent = ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;

  return (
    <div className="event-details-page page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/events">← Back to Events</Link>
        </div>

        <div className="event-details-layout">
          {/* Main content */}
          <div className="event-details-main">
            {/* Header */}
            <div className="event-details-header">
              <div className="event-details-top">
                <span className="event-details-icon">{CATEGORY_ICONS[event.category] || '🎯'}</span>
                <div className="event-details-badges">
                  <span className="badge badge-amber">{CATEGORY_LABELS[event.category] || event.category}</span>
                  {isFullyBooked && <span className="badge badge-red">SOLD OUT</span>}
                  {isPast && <span className="badge badge-gray">PAST EVENT</span>}
                  {event.price === 0 && <span className="badge badge-green">FREE</span>}
                </div>
              </div>
              <h1 className="event-details-title">{event.title}</h1>
              <p className="event-details-desc">{event.description}</p>
            </div>

            {/* Info Grid */}
            <div className="event-info-grid">
              {[
                { icon: '📅', label: 'Date', value: eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { icon: '🕐', label: 'Time', value: event.time },
                { icon: '📍', label: 'Venue', value: event.venue },
                { icon: '👥', label: 'Team Size', value: event.maxTeamSize > 1 ? `Up to ${event.maxTeamSize} members` : 'Individual' },
              ].map(item => (
                <div key={item.label} className="event-info-item">
                  <span className="event-info-icon">{item.icon}</span>
                  <div>
                    <div className="event-info-label">{item.label}</div>
                    <div className="event-info-value">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rules */}
            {event.rules && (
              <div className="event-section">
                <h2 className="event-section-title">📋 Rules & Guidelines</h2>
                <div className="event-section-content">{event.rules}</div>
              </div>
            )}

            {/* Prizes */}
            {event.prizes && (
              <div className="event-section">
                <h2 className="event-section-title">🏆 Prizes</h2>
                <div className="event-section-content prize-content">{event.prizes}</div>
              </div>
            )}

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="event-tags">
                {event.tags.map(tag => (
                  <span key={tag} className="event-tag"># {tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar / Booking Card */}
          <div className="event-sidebar">
            <div className="booking-card">
              <div className="booking-price">
                {event.price === 0 ? (
                  <span className="price-free-lg">FREE ENTRY</span>
                ) : (
                  <>
                    <span className="price-label">Entry Fee</span>
                    <span className="price-value">₹{event.price}</span>
                  </>
                )}
              </div>

              <div className="divider" />

              <div className="seats-section">
                <div className="seats-row">
                  <span className="seats-text">
                    <strong>{event.availableSeats}</strong> of {event.totalSeats} seats left
                  </span>
                  <span className={`seats-status ${isFullyBooked ? 'full' : event.availableSeats < 10 ? 'low' : 'ok'}`}>
                    {isFullyBooked ? 'FULL' : event.availableSeats < 10 ? 'ALMOST FULL' : 'AVAILABLE'}
                  </span>
                </div>
                <div className="seats-bar-lg">
                  <div
                    className="seats-fill-lg"
                    style={{
                      width: `${fillPercent}%`,
                      background: fillPercent > 90 ? 'var(--error)' : fillPercent > 70 ? 'var(--warning)' : 'var(--accent)'
                    }}
                  />
                </div>
              </div>

              {booked ? (
                <div className="booked-success">
                  <span className="booked-icon">✓</span>
                  <div>
                    <div className="booked-title">You're registered!</div>
                    <div className="booked-sub">Check My Tickets for your QR code</div>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleBookClick}
                  disabled={isFullyBooked || isPast || booking}
                >
                  {booking ? (
                    <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Booking...</>
                  ) : isFullyBooked ? 'Sold Out'
                    : isPast ? 'Event Ended'
                    : event.price === 0 ? 'Register Free →'
                    : `Book for ₹${event.price} →`}
                </button>
              )}

              {booked && (
                <Link to="/my-tickets" className="btn btn-outline btn-full" style={{ marginTop: 10 }}>
                  View My Tickets →
                </Link>
              )}

              {!user && (
                <p className="booking-login-note">
                  <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to book tickets
                </p>
              )}

              <div className="booking-meta">
                <div className="booking-meta-item">
                  <span>🎫</span> Instant QR ticket on booking
                </div>
                <div className="booking-meta-item">
                  <span>📧</span> Confirmation email sent
                </div>
                <div className="booking-meta-item">
                  <span>🔒</span> Secure & paperless entry
                </div>
              </div>
            </div>

            {event.createdBy && (
              <div className="organizer-card">
                <div className="organizer-label">Organized by</div>
                <div className="organizer-name">{event.createdBy.name}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          event={event}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
