//TODO : Validation des schemas

const controller = require('./controller.js');

const routes = [
  {
    method: 'GET',
    url: '/kanjis',
    handler: controller.getAllKanjis
  },
  {
    method: 'GET',
    url: '/kanjis/:id',
    handler: controller.getKanji
  },
  {
    method: 'GET',
    url: '/words',
    handler: controller.getAllWords
  },
  {
    method: 'GET',
    url: '/words/:id',
    handler: controller.getWord
  },
  {
    method: 'POST',
    url: '/getShopCombination',
    handler: controller.getCountCombinationShop
  },
  {
    method: 'GET',
    url: '/getNumberCombination',
    handler: controller.getTotalUse
  },
  {
    method: 'POST',
    url: '/getMerge',
    handler: controller.getMerge
  }
]

module.exports = routes;
