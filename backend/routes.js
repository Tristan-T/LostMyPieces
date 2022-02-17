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
  }
]

module.exports = routes;
