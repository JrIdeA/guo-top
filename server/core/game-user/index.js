const GameUserStatistic = require('./statistics');

function createGameUser(game) {
  const questions = game.getRandomQuestionsQueue();
  const stat = new GameUserStatistic();

  return class GameUser {
    constructor(userId) {
      this.id = userId;
    }
    online() {
      game.onlineUser(this);
    }
    offline() {
      game.offlineUser(this);
    }
    getNextQuiz(getQuestionClientTime) {
      const currentQuestion = questions.current;
      if (currentQuestion && !currentQuestion.isAnswered()) {
        currentQuestion.giveup();
        stat.markWrong();
        stat.addAnswerLog({
          questionId: currentQuestion.id,
          giveup: true,
        });
      }

      const nextQuestion = questions.next();
      if (!nextQuestion) {
        stat.markAnsweredAll();
        return null;
      }
      stat.addGetQuestionLog({
        questionId: nextQuestion.id,
        getQuestionClientTime,
      });
      return nextQuestion.getQuiz();
    }
    answerQuiz(questionId, answerCode, answerClientTime) {
      const target = questions.get(questionId);
      if (!target) {
        return {
          questionId,
          answerCode,
          answered: true,
          correct: false,
        };
      }
      if (!target.isCurrent() || target.isAnswered()) {
        target.giveup();
        return {
          questionId,
          answerCode,
          answered: true,
          correct: false,
        };
      }
      const correct = target.answer(answerCode);
      correct ? stat.markCorrect() : stat.markWrong();
      stat.addAnswerLog({
        questionId, answerCode, answerClientTime,
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
      // return game.status.ending;
      // TODO
      return false;
    }
  };
}

module.exports = createGameUser;
