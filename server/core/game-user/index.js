const GameUserStatistic = require('./statistics');

function createGameUser(game) {
  return class GameUser {
    constructor(userId) {
      this.id = userId;
      this.gameEnded = false;
      this.rank = 0;
      this.questionQueue = game.getRandomQuestionsQueue();
      this.stat = new GameUserStatistic();
    }
    online() {
      game.onlineUser(this);
    }
    offline() {
      game.offlineUser(this);
    }
    getNextQuiz(getQuestionClientTime) {
      const currentQuestion = this.questionQueue.current;
      if (currentQuestion && !currentQuestion.isAnswered()) {
        currentQuestion.giveup();
        this.stat.markWrong();
        this.stat.addAnswerLog({
          questionId: currentQuestion.id,
          giveup: true,
        });
      }

      const nextQuestion = this.questionQueue.next();
      if (!nextQuestion) {
        this.stat.markAnsweredAll();
        return null;
      }
      this.stat.addGetQuestionLog({
        questionId: nextQuestion.id,
        getQuestionClientTime,
      });
      return nextQuestion.getQuiz();
    }
    answerQuiz(questionId, answerCode, answerClientTime) {
      const target = this.questionQueue.get(questionId);
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
      correct ? this.stat.markCorrect(target.isSpecial()) : this.stat.markWrong(target.isSpecial());
      this.stat.addAnswerLog({
        questionId, answerCode, answerClientTime,
      });
      return {
        questionId,
        answerCode,
        correct,
      };
    }
    getScore() {
      return {
        total: this.stat.total,
        correct: this.stat.correct,
        wrong: this.stat.wrong,
        point: this.stat.point,
        accuracy: this.stat.total ?
          ((this.stat.correct / this.stat.total) * 100).toFixed(2) : 0,
      };
    }
    isTimeout() {
      return !(this.getLeftPlaytime() > 0);
    }
    giveupCurrentQuizIfNotAnswer() {
      const current = this.questionQueue.getCurrent();
      if (current && current.id && !current.isAnswered()) {
        current.giveup();
        this.stat.markWrong();
        this.stat.addAnswerLog({
          questionId: current.id,
          giveup: true,
        });
      }
    }
    getLeftPlaytime() {
      if (this.gameEnded) return -1;
      const playtime = game.getPlaytimeSeconds() * 1000;
      const usedTime = this.stat.getUsedTime();
      const leftDeadTime = game.getLeftDeadTime();

      return Math.min(leftDeadTime, playtime - usedTime);
    }
    endGame(clientTime) {
      if (!this.gameEnded) {
        this.gameEnded = true;
        this.giveupCurrentQuizIfNotAnswer();
        this.stat.markEndTime(clientTime);
        game.userEndGame();
      }
    }
    isEnd() {
      return this.gameEnded;
    }
    setRank(rank) {
      this.rank = rank;
    }
    getResult() {
      if (!game.status.result) {
        return this.getScore();
      }
      return Object.assign({
        rank: this.rank,
      }, this.getScore());
    }
  };
}

module.exports = createGameUser;
