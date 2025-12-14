/**
 * Advertisement Service
 */

const { Advertisement } = require('../models');

async function createAd(adminTelegramId, type, content) {
  return Advertisement.create({
    adminTelegramId,
    type,
    content
  });
}

async function listAds(adminTelegramId) {
  return Advertisement.findAll({
    where: { adminTelegramId },
    order: [['createdAt', 'DESC']]
  });
}

async function deleteAd(adId, adminTelegramId) {
  return Advertisement.destroy({
    where: {
      id: adId,
      adminTelegramId
    }
  });
}

module.exports = {
  createAd,
  listAds,
  deleteAd
};
