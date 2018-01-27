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
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {
    if (isEqual(this.props.questions, nextProps)) {
      this.drawQuestion(nextProps)
    }
  }
  getHandleAnswerQuestion = (code) => () => {
    if (this.props.control.questionGetting) return;
    this.props.answerQuestion(code);
  };
  initCanvas(canvas) {
    console.log('canvas', canvas);
    if (canvas) {
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      window.canvasCtx = this.canvasCtx;
    }
  };
  drawQuestion(props) {
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvasCtx.font = '48px serif';
    this.canvasCtx.fillText(props.question, 0, 0);
  }
  renderCorrectIcon() {
    return <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><defs><style/></defs><path d="M913.017 237.02c-25.311-25.312-66.349-25.312-91.66 0L408.882 649.494 202.645 443.257c-25.312-25.312-66.35-25.312-91.661 0s-25.312 66.35 0 91.66l252.067 252.067c.729.73 1.439 1.402 2.134 2.029 25.434 23.257 64.913 22.585 89.527-2.029l458.303-458.303c25.313-25.312 25.313-66.35.001-91.661z"/></svg>;
  }
  renderOptions() {
    const options = this.props.options
    if (!isArray(options)) return null;
    return (
      <ul className="answer-options">
        {options.map(({ answer, code }) => {
          return (
            <li key={code}>
              <button
                className={classnames({
                  selected: this.props.answerCode === code
                })}
                style={{
                  color: (
                    this.props.correct == null || this.props.answerCode !== code
                  ) ? undefined : (this.props.correct) ? 'green' : 'red',
                }}
                onClick={this.getHandleAnswerQuestion(code)}
              >
                {this.renderCorrectIcon()}
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
        <div>{this.props.question}</div>
        <Question question={this.props.question} />
        {this.renderOptions()}
      </div>
    );
  }
}