import logger from '../utils/logger';

const { isArray, isPlainObject, isString, isNil, shuffle } = require('lodash');
const QuestionQueue = require('./queue');
const {
  ERROR_QUESTION_OPTIONS_INVALID,
} = require('../../../shared/error');

function normalizeQuestionsData(questionsData) {
  const isValidQuestion = (questionData) => {
    if (!isPlainObject(questionData)) return false;
    const { question, options, answer } = questionData;
    if (!isString(question) || !question.length) return false;
    if (!isPlainObject(options)) return false;
    const optionsLen = Object.keys(options).length;
    if (optionsLen < 2) return false;
    if (isNil(answer) || !options[answer]) return false;
    return true;
  };
  return questionsData.filter((questionData) => {
    const valid = isValidQuestion(questionData);
    if (!valid) {
      logger.debug('invalid question', questionData);
    }
    return valid;
  }).map((questionData, index) => (Object.assign({
    id: index + 1,
  }, questionData)));
}

class QuestionsManager {
  constructor(questionsData) {
    if (!isArray(questionsData)) {
      const e = new Error('questions data is invalid, please check.');
      e.questionsData = questionsData;
      throw questionsData;
    }
    this.normalizedQuestionsData = normalizeQuestionsData(questionsData);

    logger.debug('import questions length', questionsData.length);
    logger.debug('valid questions length', this.normalizedQuestionsData.length);
  }
  getRandomQueue() {
    const normalizedQuestionsData = shuffle(this.normalizedQuestionsData);
    return new QuestionQueue(normalizedQuestionsData);
  }
}

module.exports = QuestionsManager;
