const QRCode = require('qrcode');

/**
 * Generate a QR code as a base64 data URL
 * @param {Object} data - The data to encode in the QR code
 * @returns {Promise<string>} - Base64 data URL of the QR code image
 */
const generateQRCode = async (data) => {
  try {
    const qrData = JSON.stringify(data);
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      },
      width: 300
    });
    return { qrCode: qrCodeDataURL, qrData };
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + error.message);
  }
};

module.exports = { generateQRCode };
