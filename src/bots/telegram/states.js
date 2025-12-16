const states = new Map();

/*
  مثال:
  states.set(userId, { state: 'WAIT_AD_TEXT' })
*/

function setState(userId, state, data = {}) {
  states.set(userId, { state, data });
}

function getState(userId) {
  return states.get(userId) || null;
}

function clearState(userId) {
  states.delete(userId);
}

module.exports = {
  setState,
  getState,
  clearState
};
