const { each } = require('lodash');
const scheduler = require('./scheduler');
const status = require('./status');

module.exports = function mixinGame(Game) {
  function assignProto(proto) {
    each(proto, (fn, name) => {
      Game.prototype[name] = fn;
    });
  }
  assignProto(scheduler);
  assignProto(status);
  return Game;
};
