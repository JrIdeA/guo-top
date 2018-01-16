const QuestionsManager = require('../../questions/manager');

const GameQuestionsProto = {
  initQuestions(questionsData) {
    this.questionsManager = new QuestionsManager(questionsData);
  },
  getRandomQuestionsQueue() {
    return this.questionsManager.getRandomQueue();
  },
};

module.exports = GameQuestionsProto;
