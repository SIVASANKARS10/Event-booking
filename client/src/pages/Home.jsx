import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const FEATURES = [
  { icon: '🎫', title: 'Instant Ticketing', desc: 'Book your spot in seconds. Get your ticket instantly with a unique QR code.' },
  { icon: '🔲', title: 'QR Check-In', desc: 'Paperless entry. Our QR-based system eliminates queues and manual registers.' },
  { icon: '📊', title: 'Live Analytics', desc: 'Organizers get real-time insights on registrations, revenue and attendance.' },
  { icon: '📧', title: 'Email Confirmation', desc: 'Automatic confirmation emails with your QR code sent right after booking.' },
];

const EVENT_TYPES = [
  { icon: '⚡', name: 'Hackathon', desc: '24hr build sprint' },
  { icon: '💻', name: 'Coding', desc: 'Competitive programming' },
  { icon: '📄', name: 'Paper Presentation', desc: 'Research showcase' },
  { icon: '🔧', name: 'Workshops', desc: 'Hands-on learning' },
  { icon: '🧠', name: 'Tech Quiz', desc: 'Knowledge battle' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page page-wrapper">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow" />
        </div>
        <div className="container hero-content">
          <div className="hero-tag">
            <span className="tag-dot" />
            <span>National Technical Symposium 2025</span>
          </div>
          <h1 className="hero-title">
            Where Innovation<br />
            <span className="hero-accent">Meets Competition</span>
          </h1>
          <p className="hero-subtitle">
            Book your slot for hackathons, coding contests, paper presentations,
            workshops, and technical quizzes. One platform, all events.
          </p>
          <div className="hero-cta">
            <Link to="/events" className="btn btn-primary btn-lg">
              Explore Events →
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-ghost btn-lg">
                Create Account
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">20+</span>
              <span className="hero-stat-label">Events</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-num">500+</span>
              <span className="hero-stat-label">Participants</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-num">₹50K+</span>
              <span className="hero-stat-label">Prize Pool</span>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="section event-types-section">
        <div className="container">
          <div className="section-header">
            <h2>Event Categories</h2>
            <p>Five categories. One epic symposium.</p>
          </div>
          <div className="event-types-grid">
            {EVENT_TYPES.map(type => (
              <Link to={`/events?category=${type.name.toLowerCase().replace(' ', '_')}`} key={type.name} className="event-type-card">
                <span className="event-type-icon">{type.icon}</span>
                <h3 className="event-type-name">{type.name}</h3>
                <p className="event-type-desc">{type.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why TechSym?</h2>
            <p>Built to replace paper registration entirely.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-inner">
            <div>
              <h2>Ready to participate?</h2>
              <p>Register now and book your spot before seats run out.</p>
            </div>
            <div className="cta-buttons">
              <Link to="/events" className="btn btn-primary btn-lg">Browse Events</Link>
              {!user && <Link to="/register" className="btn btn-outline btn-lg">Sign Up Free</Link>}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="brand-icon">⚡</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '3px' }}>
                TECH<span className="text-accent">SYM</span>
              </span>
            </div>
            <p className="footer-copy">© 2025 TechSymposium. Built for engineering excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
