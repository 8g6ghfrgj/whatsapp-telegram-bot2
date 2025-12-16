cat > src/bots/whatsapp/qr.js << 'EOF'
const QRCode = require('qrcode');

async function generateQR(qrText) {
  return QRCode.toBuffer(qrText, {
    type: 'png',
    width: 300,
    margin: 2
  });
}

module.exports = {
  generateQR
};
EOF
