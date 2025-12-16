let currentAd = null;

function setAd(text) {
  currentAd = text;
}

function getAd() {
  return currentAd;
}

function hasAd() {
  return !!currentAd;
}

function clearAd() {
  currentAd = null;
}

module.exports = {
  setAd,
  getAd,
  hasAd,
  clearAd
};
