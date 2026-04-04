import React from 'react';

export default function Loader({ fullPage = false, text = 'Loading...' }) {
  if (fullPage) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem'
      }}>
        <div className="spinner" />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div className="loader-center">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}
