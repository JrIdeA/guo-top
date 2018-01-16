const { each } = require('lodash');
const scheduler = require('./scheduler');
const status = require('./status');
const users = require('./users');

module.exports = function mixinGame(Game) {
  function assignProto(proto) {
    each(proto, (fn, name) => {
      Game.prototype[name] = fn;
    });
  }
  assignProto(scheduler);
  assignProto(status);
  assignProto(users);
  return Game;
};
