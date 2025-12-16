let status = {
  status: 'disconnected', // disconnected | pending | connected
  connectedAt: null
};

function setPending() {
  status.status = 'pending';
  status.connectedAt = null;
}

function setConnected() {
  status.status = 'connected';
  status.connectedAt = new Date();
}

function setDisconnected() {
  status.status = 'disconnected';
  status.connectedAt = null;
}

function isConnected() {
  return status.status === 'connected';
}

function getStatus() {
  return status;
}

module.exports = {
  setPending,
  setConnected,
  setDisconnected,
  isConnected,
  getStatus
};
