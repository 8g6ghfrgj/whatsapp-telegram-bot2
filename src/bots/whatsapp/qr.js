/**
 * WhatsApp QR Generator
 */

const QRCode = require('qrcode');

async function generateQRImage(qrString) {
  return QRCode.toBuffer(qrString, {
    type: 'png',
    width: 400,
    margin: 2
  });
}

module.exports = {
  generateQRImage
};
