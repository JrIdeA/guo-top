const GameUserStatistic = require('./statistics');

function createGameUser(game) {
  const questions = game.getRandomQuestionsQueue();
  const stat = new GameUserStatistic();

  return class GameUser {
    constructor(userId) {
      this.id = userId;
      this.gameEnded = false;
      this.rank = 0;
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
        accuracy: stat.total ?
          ((stat.correct / stat.total) * 100).toFixed(2) : 0,
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
      if (this.gameEnded) return -1;
      const playtimeSeconds = game.getPlaytimeSeconds();
      const usedSeconds = stat.getUsedSeconds();
      return playtimeSeconds - usedSeconds;
    }
    endGame(clientTime) {
      this.gameEnded = true;
      this.giveupCurrentQuizIfNotAnswer();
      stat.markEndTime(clientTime);
      game.userEndGame();
    }
    isEnd() {
      return this.gameEnded;
    }
    setRank(rank) {
      this.rank = rank;
    }
    getResult() {
      if (!game.status.result) {
        return this.getCount();
      }
      return Object.assign({
        rank: this.rank,
      }, this.getCount());
    }
  };
}

module.exports = createGameUser;
