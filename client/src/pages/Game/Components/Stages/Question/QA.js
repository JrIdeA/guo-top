import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isArray } from 'lodash';

export default class QA extends Component {
  static propTypes = {
    id: PropTypes.number,
    question: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      answer: PropTypes.string,
      code: PropTypes.string,
    })),
    
  };
  getHandleAnswerQuestion = (code) => () => {
    this.props.answerQuestion(code);
  };
  renderOptions() {
    const options = this.props.options
    if (!isArray(options)) return null;
    return (
      <ul>
        {options.map(({ answer, code }) => {
          return (
            <li key={code}>
              <a onClick={this.getHandleAnswerQuestion(code)}>{answer}</a>
            </li>
          );
        })}
      </ul>
    );
  }
  render() {
    return (
      <div>
        <div>{this.props.question}</div>
        {this.renderOptions()}
      </div>
    );
  }
}