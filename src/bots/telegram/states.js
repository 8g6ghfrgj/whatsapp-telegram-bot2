/**
 * User States (Finite State Machine)
 */

const userStates = new Map();

function initStates() {
  userStates.clear();
}

function setUserState(userId, state, data = {}) {
  userStates.set(userId, {
    state,
    data,
    updatedAt: Date.now()
  });
}

function getUserState(userId) {
  return userStates.get(userId) || null;
}

function clearUserState(userId) {
  userStates.delete(userId);
}

module.exports = {
  initStates,
  setUserState,
  getUserState,
  clearUserState
};
