const QuestionsManager = require('../questions/manager');
const GameUserStatistic = require('./Statistics');

function createGameUser(users, game) {
  const questions = QuestionsManager.getRandomQueue();
  const stat = new GameUserStatistic();

  return class GameUser {
    constructor(userId) {
      this.id = userId;
    }
    online() {
      users.online(this);
    }
    offline() {
      users.offline(this);
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
        return {
          questionId,
          answerCode,
          answered: true,
        };
      }
      const correct = target.answer(answerCode);
      correct ? stat.markCorrect() : stat.markWrong();
      stat.addAnswerLog({ 
        questionId, answerCode, answerClientTime
      });
      return {
        questionId,
        answerCode,
        correct,
      };
    }
    getCount() {
      return {
        total: stat.total,
        correct: stat.correct,
        wrong: stat.wrong,
      };
    }
    isTimeout() {
      return game.status.ending;
    }
  }
}

module.exports = createGameUser;