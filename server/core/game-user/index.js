const GameUserStatistic = require('./statistics');

function createGameUser(game) {
  const questions = game.getRandomQuestionsQueue();
  const stat = new GameUserStatistic();

  return class GameUser {
    constructor(userId) {
      this.id = userId;
      this.clientEndedGame = false;
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
      correct ? stat.markCorrect(target.isSpecial()) : stat.markWrong(target.isSpecial());
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
        point: stat.point,
      };
    }
    isTimeout() {
      // return game.status.ending;
      // TODO
      return false;
    }
    giveupCurrentQuizIfNotAnswer() {
      const current = questions.getCurrent();
      if (current && current.id && !current.isAnswered()) {
        current.giveup();
        stat.markWrong();
        stat.addAnswerLog({
          questionId: current.id,
          giveup: true,
        });
      }
    }
    getLeftPlaytimeSeconds() {
      if (this.clientEndedGame) return -1;
      const playtimeSeconds = game.getPlaytimeSeconds();
      const usedSeconds = stat.getUsedSeconds();
      return playtimeSeconds - usedSeconds;
    }
    endGameByClient() {
      this.clientEndedGame = true;
    }
  };
}

module.exports = createGameUser;
