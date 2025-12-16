const QRCode = require('qrcode');

async function generateQRImage(qr) {
  return QRCode.toBuffer(qr);
}

module.exports = {
  generateQRImage
};
