const pendingJoins = new Map();
/*
  key: inviteLink
  value: {
    link,
    requestedAt,
    joined
  }
*/

function addPending(link) {
  pendingJoins.set(link, {
    link,
    requestedAt: Date.now(),
    joined: false
  });
}

function markJoined(link) {
  const item = pendingJoins.get(link);
  if (item) item.joined = true;
}

function getPendingOver24h() {
  const now = Date.now();
  const result = [];

  for (const item of pendingJoins.values()) {
    if (!item.joined && now - item.requestedAt >= 24 * 60 * 60 * 1000) {
      result.push(item);
    }
  }

  return result;
}

function getAll() {
  return Array.from(pendingJoins.values());
}

module.exports = {
  addPending,
  markJoined,
  getPendingOver24h,
  getAll
};
