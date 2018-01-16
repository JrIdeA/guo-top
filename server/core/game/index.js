const EventEmitter = require('events');
const mixinGame = require('./mixins');

class Game extends EventEmitter {
  constructor(config, questionsData) {
    super();

    this.config = config;
    this.initQuestions(questionsData);
    this.initStatus();
    this.initScheduler();
    this.initUsers();

    this.setNowStatus();
    this.startScheduler();
  }
}

mixinGame(Game);

module.exports = Game;
