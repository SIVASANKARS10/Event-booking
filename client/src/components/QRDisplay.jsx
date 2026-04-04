import React, { useState } from 'react';
import './QRDisplay.css';

export default function QRDisplay({ qrCode, ticketId, eventTitle }) {
  const [enlarged, setEnlarged] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `ticket-${ticketId}.png`;
    link.click();
  };

  return (
    <>
      <div className="qr-wrapper" onClick={() => setEnlarged(true)} title="Click to enlarge">
        <img src={qrCode} alt={`QR Code for ${eventTitle}`} className="qr-image" />
        <div className="qr-overlay">
          <span>🔍 Enlarge</span>
        </div>
      </div>
      <button className="btn btn-ghost btn-sm qr-download" onClick={handleDownload}>
        ⬇ Download QR
      </button>

      {enlarged && (
        <div className="modal-overlay" onClick={() => setEnlarged(false)}>
          <div className="qr-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Entry QR Code</h2>
              <button className="modal-close" onClick={() => setEnlarged(false)}>×</button>
            </div>
            <div className="qr-modal-body">
              <img src={qrCode} alt="QR Code" className="qr-image-large" />
              <p className="qr-ticket-id text-mono">Ticket: {ticketId}</p>
              <p className="qr-event-name">{eventTitle}</p>
              <button className="btn btn-primary btn-full" onClick={handleDownload}>
                ⬇ Save QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
