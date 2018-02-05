const { values, sortBy } = require('lodash');

class GameUserStatistic {
  constructor() {
    this.total = 0;
    this.correct = 0;
    this.wrong = 0;
    this.point = 0;
    this.answerAll = false;
    this.answerLog = {};
    this.endClientTime = null;
    this.endServerTime = null;
  }
  markWrong(specialAnswer) {
    this.total += 1;
    this.wrong += 1;
    if (specialAnswer) {
      this.point -= 1;
    }
  }
  markCorrect() {
    this.total += 1;
    this.correct += 1;
    this.point += 1;
  }
  markAnsweredAll() {
    this.answerAll = true;
  }
  markEndTime(clientTime) {
    this.endClientTime = clientTime;
    this.endServerTime = Date.now();
  }
  addGetQuestionLog({ questionId, getQuestionClientTime }) {
    this.answerLog[questionId] = {
      questionId,
      getQuestionClientTime,
      getQuestionServerTime: Date.now(),
    };
  }
  addAnswerLog({ questionId, answerCode, answerClientTime, giveup }) {
    const log = this.answerLog[questionId];
    if (!log) return;
    log.giveup = giveup;
    log.answerCode = answerCode;
    log.answerClientTime = answerClientTime;
    log.answerServerTime = Date.now();
    log.usedClientTime = log.answerClientTime - log.getQuestionClientTime;
    log.usedServerTime = log.answerServerTime - log.getQuestionServerTime;
  }
  getUsedTime() {
    return values(this.answerLog).reduce((p, { usedServerTime }) => {
      usedServerTime = +usedServerTime;
      if (Number.isNaN(usedServerTime)) {
        return p;
      }
      return p + usedServerTime;
    }, 0);
  }
  getAnswerLog() {
    return sortBy(this.answerLog, 'getQuestionServerTime');
  }
}

module.exports = GameUserStatistic;
