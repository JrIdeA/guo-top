const { shuffle } = require('lodash');

class UserQuestions {
  constructor(questionsData) {
    this.questionsData = questionsData;
    this.current = null;
    this.index = -1;
    this.historys = {};
  }
  _createQuestion(quesionData) {
    const questions = this;
    const question = {
      id: quesionData.id,
      _data: quesionData,
      _correct: null,
      giveup() {
        question._correct = false;
      },
      answer(answerCode) {
        question._correct = question._data.answer == answerCode;
      },
      isAnswered() {
        return question._correct == null;
      },
      isCurrent() {
        return questions.current.id === question.id;
      },
      getQuiz() {
        return {
          id: quesionData.id,
          question: quesionData.question,
          options: shuffle(quesionData.options),
        };
      }
    };

    return question;
  }
  next() {
    this.index += 1;
    const questionData = this.questionsData[this.index];
    if (!questionData) return null;

    const question = this._createQuestion();
    this.historys[question.id] = question;
    return question;
  }
  getResultCount() {
    const historyQuestionIds = Object.keys(this.historys);
    const total = historyQuestionIds.length;
    const correct = historyQuestionIds.reduce(((p, id) => {
      if (!this.historys[id].correct) {
        return p;
      }
      return p + 1;
    }, id), 0);
    const wrong = total - correct;

    return {
      total,
      correct,
      wrong,
    };
  }
}

module.exports = UserQuestions;