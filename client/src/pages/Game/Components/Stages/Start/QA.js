import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isArray, isEqual } from 'lodash';
import classnames from 'classnames';
import Question from './Question';

export default class QA extends Component {
  static propTypes = {
    id: PropTypes.number,
    question: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      answer: PropTypes.string,
      code: PropTypes.string,
    })),
    correct: PropTypes.bool,
  };
  getHandleAnswerQuestion = (code) => () => {
    if (this.props.control.questionGetting) return;
    this.props.answerQuestion(code);
  };
  renderOptions() {
    const options = this.props.options
    if (!isArray(options)) return null;

    return (
      <ul className="answer-options">
        {options.map(({ answer, code }) => {
          const answered = !(
            this.props.correct == null || this.props.answerCode !== code
          );
          return (
            <li key={code}>
              <button
                className={classnames({
                  selected: this.props.answerCode === code,
                  correct: answered && this.props.correct,
                  wrong: answered && !this.props.correct,
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
        <Question question={this.props.question} />
        {this.renderOptions()}
      </div>
    );
  }
}