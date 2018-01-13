class GameUserStatistic {
  constructor() {
    this.total = 0;
    this.correct = 0;
    this.wrong = 0;
    this.answerLog = {};
  }
  markWrong() {
    this.total += 1;
    this.wrong += 1;
  }
  markCorrect() {
    this.total += 1;
    this.correct += 1;
  }
  addGetQuestionLog({ questionId, getAnswerClientTime }) {
    this.answerLog[questionId] = {
      getQuestionClientTime,
      getQuestionServerTime: Date.now(),
    };
  }
  addAnswerLog({ questionId, answerCode, answerClientTime, giveup }) {
    const log = this.answerLog[questionId];
    if (!log) return;
    log.answerCode = answerCode;
    log.answerClientTime = answerClientTime;
    log.answerServerTime = Date.now();
  }
}

module.exports = GameUserStatistic;