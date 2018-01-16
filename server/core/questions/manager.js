const { isArray, isPlainObject, isString, isNil, shuffle } = require('lodash');
const QuestionQueue = require('./queue');
const {
  ERROR_QUESTION_OPTIONS_INVALID,
} = require('../../../shared/error');

function normalizeQuestionsData(questionsData) {
  const isValidQuestion = (questionData) => {
    if (!isPlainObject(questionData)) return false;
    const { question, options, correct } = questionData;
    if (!isString(question) || !question.length) return false;
    if (!isPlainObject(options)) return false;
    const optionsLen = Object.keys(options).length;
    if (optionsLen < 2) return false;
    if (isNil(correct) || !options[correct]) return false;
    return true;
  };
  return questionsData.filter(isValidQuestion);
}

class QuestionsManager {
  constructor(questionsData) {
    if (!isArray(questionsData)) {
      const e = new Error('questions data is invalid, please check.');
      e.questionsData = questionsData;
      throw questionsData;
    }
    this.normalizedQuestionsData = normalizeQuestionsData(questionsData);
  }
  getRandomQueue() {
    const normalizedQuestionsData = shuffle(this.normalizedQuestionsData);
    return new QuestionQueue(normalizedQuestionsData);
  }
}

module.exports = QuestionsManager;
