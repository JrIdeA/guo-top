class QuestionsQueue {
  constructor(sortedQustionsData) {
    this.questionsData = sortedQustionsData;
    this.index = -1;
    this.historyIndexMap = {};
  }
  getCurrent() {
  const current = this.questionsData[this.index];
  if (current) {
    this.historyIndexMap[current.id] = this.index;
  }
  return current;
  }
  getNext() {
  this.index++;
  return this.getCurrent();
  }
  checkCorrect(questionId, answerCode) {
    const index = this.historyIndexMap[questionId];
    if (index == null) return false;
    const target = this.questionsData[index];
    if (!target) return false;
    return target.correct == answerCode;
  }
  isHistory(questionId) {
    return this.historyIndexMap[questionId] == null;
  }
}

module.exports = QuestionsQueue;