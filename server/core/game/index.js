const EventEmitter = require('events');
const mixinGame = require('./mixins');

class Game extends EventEmitter {
  constructor(config) {
    super();

    this.config = config;
    this.initStatus();
    this.initScheduler();
    this.initUsers();
  }
}

mixinGame(Game);

module.exports = Game;
