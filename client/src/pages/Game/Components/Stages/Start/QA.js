import React, { Component } from 'react';
import { isArray } from 'lodash';
import classnames from 'classnames';
import Question from './Question';

export default class QA extends Component {
  getHandleAnswerQuestion = (code) => () => {
    if (this.props.control.questionGetting) return;
    this.props.answerQuestion(code);
  };
  renderOptions() {
    const { 
      options,
      correct,
      answerCode,
    } = this.props.question;
    if (!isArray(options)) return null;

    return (
      <ul className="answer-options">
        {options.map(({ answer, code }) => {
          const answered = !(
            correct == null || answerCode !== code
          );
          return (
            <li key={code}>
              <button
                className={classnames({
                  selected: answerCode === code,
                  correct: answered && correct,
                  wrong: answered && !correct,
                })}
                onClick={this.getHandleAnswerQuestion(code)}
              >
                {answer}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
  render() {
    return (
      <div>
        <Question question={this.props.question.question} />
        {this.renderOptions()}
      </div>
    );
  }
}