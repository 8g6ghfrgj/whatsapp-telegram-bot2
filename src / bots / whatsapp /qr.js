const QRCode = require('qrcode');

async function generateQR(qrText) {
  return QRCode.toBuffer(qrText);
}

module.exports = {
  generateQR
};
