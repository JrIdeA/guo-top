const { shuffle, map } = require('lodash');

class UserQuestions {
  constructor(questionsData) {
    this.questionsData = questionsData;
    this.current = this._createQuestion(null);
    this.index = -1;
    this.historys = {};
  }
  _createQuestion(quesionData) {
    const questions = this;
    const question = {
      id: quesionData && quesionData.id,
      _data: quesionData,
      _correct: null,
      giveup() {
        if (!question.id) return;
        question._correct = false;
      },
      answer(answerCode) {
        if (!question.id) return;
        question._correct = question._data.answer == answerCode;
      },
      isAnswered() {
        if (!question.id) return false;
        return question._correct == null;
      },
      isCurrent() {
        if (!question.id) return false;
        return questions.current.id === question.id;
      },
      getQuiz() {
        if (!question.id) return null;
        const options = shuffle(map(quesionData.options, (answer, code) => ({
          code,
          answer,
        })));
        return {
          id: quesionData.id,
          question: quesionData.question,
          options,
        };
      },
    };

    return question;
  }
  next() {
    this.index += 1;
    const questionData = this.questionsData[this.index];
    if (!questionData) return null;

    const question = this._createQuestion(questionData);
    this.historys[question.id] = question;
    return question;
  }
  getResultCount() {
    const historyQuestionIds = Object.keys(this.historys);
    const total = historyQuestionIds.length;
    const correct = historyQuestionIds.reduce((p, id) => {
      if (!this.historys[id].correct) {
        return p;
      }
      return p + 1;
    }, 0);
    const wrong = total - correct;

    return {
      total,
      correct,
      wrong,
    };
  }
}

module.exports = UserQuestions;
