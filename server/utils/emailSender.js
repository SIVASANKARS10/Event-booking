const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send booking confirmation email with QR code
 */
const sendBookingConfirmation = async ({ to, name, event, ticket, qrCode }) => {
  try {
    const transporter = createTransporter();

    const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"TechSymposium" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `✅ Booking Confirmed - ${event.title} | TechSymposium`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
            .header p { margin: 8px 0 0; opacity: 0.8; font-size: 14px; }
            .body { padding: 30px; }
            .greeting { font-size: 18px; color: #0F172A; margin-bottom: 20px; }
            .ticket-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 25px; margin: 20px 0; }
            .ticket-title { font-size: 22px; font-weight: bold; color: #0F172A; margin-bottom: 15px; }
            .detail-row { display: flex; margin: 10px 0; font-size: 15px; }
            .detail-label { color: #64748b; width: 140px; flex-shrink: 0; }
            .detail-value { color: #0F172A; font-weight: 500; }
            .ticket-id { background: #0F172A; color: #f59e0b; padding: 10px 15px; border-radius: 6px; font-family: monospace; font-size: 16px; text-align: center; margin: 15px 0; letter-spacing: 2px; }
            .qr-section { text-align: center; margin: 25px 0; }
            .qr-section h3 { color: #0F172A; margin-bottom: 15px; }
            .qr-section img { border: 3px solid #0F172A; border-radius: 8px; padding: 5px; }
            .instructions { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 14px; color: #92400e; }
            .footer { background: #0F172A; color: rgba(255,255,255,0.6); text-align: center; padding: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ TECH SYMPOSIUM</h1>
              <p>Booking Confirmation</p>
            </div>
            <div class="body">
              <p class="greeting">Hello, <strong>${name}</strong>! 🎉</p>
              <p>Your registration is confirmed. Here are your event details:</p>
              
              <div class="ticket-card">
                <div class="ticket-title">${event.title}</div>
                <div class="detail-row"><span class="detail-label">📅 Date</span><span class="detail-value">${eventDate}</span></div>
                <div class="detail-row"><span class="detail-label">🕐 Time</span><span class="detail-value">${event.time}</span></div>
                <div class="detail-row"><span class="detail-label">📍 Venue</span><span class="detail-value">${event.venue}</span></div>
                <div class="detail-row"><span class="detail-label">💰 Amount Paid</span><span class="detail-value">₹${ticket.amountPaid}</span></div>
                
                <div class="ticket-id">TICKET: ${ticket.ticketId}</div>
              </div>
              
              <div class="qr-section">
                <h3>🔲 Your Entry QR Code</h3>
                <img src="${qrCode}" alt="QR Code" width="200" height="200" />
                <p style="color: #64748b; font-size: 13px; margin-top: 10px;">Present this QR code at the venue for entry</p>
              </div>
              
              <div class="instructions">
                <strong>📌 Important Instructions:</strong><br>
                • Screenshot or print this QR code before coming to the event<br>
                • Keep your Ticket ID handy as a backup<br>
                • Arrive 15 minutes before the event starts<br>
                • Each QR code is unique and can only be used once
              </div>
            </div>
            <div class="footer">
              <p>TechSymposium ${new Date().getFullYear()} • This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('📧 Email error:', error.message);
    // Don't throw - email failure shouldn't break booking
    return { success: false, error: error.message };
  }
};

module.exports = { sendBookingConfirmation };
