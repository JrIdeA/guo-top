const QuestionsManager = require('../questions/manager');
const GameUserStatistic = require('./Statistics');

function createGameUserGenerator(Game, Users) {
  const questions = QuestionsManager.getRandomQueue();
  const stat = new GameUserStatistic();

  class GameUser {
    constructor(userId) {
      this.userId = userId;
    }
    online() {
      Users.online(this);
    }
    offline() {
      Users.offline(this);
    }
    getNextQuiz(getAnswerClientTime) {
      const currentQuestion = questions.current;
      if (!currentQuestion.isAnswered()) {
        currentQuestion.giveup();
        stat.markWrong();
        stat.addAnswerLog({
          questionId: currentQuestion.id,
          giveup: true,
        })
      }

      const nextQuestion = questions.next();
      stat.addGetQuestionLog({ 
        questionId: nextQuestion.id,
        getAnswerClientTime,
      });
      return nextQuestion.getQuiz();
    }
    answerQuiz(questionId, answerCode, answerClientTime) {
      const target = questions.get(questionId);
      if (!target) return false;
      if (target.isCurrent()) {
        target.giveup();
        return false;
      }
      const correct = target.answer(answerCode);
      correct ? stat.markCorrect() : stat.markWrong();
      stat.addAnswerLog({ 
        questionId, answerCode, answerClientTime
      });
      return correct;
    }
  }
}

module.exports = createGameUserGenerator;