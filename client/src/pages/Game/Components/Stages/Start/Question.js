/* eslint no-cond-assign: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual, throttle } from 'lodash';

function findBreakPoint(text, width, context) {
  let min = 0;
  let max = text.length - 1;
  context.measureText(text);
  while (min <= max) {
    const middle = Math.floor((min + max) / 2);
    const middleWidth = context.measureText(text.substr(0, middle)).width;
    const oneCharWiderThanMiddleWidth = context.measureText(text.substr(0, middle + 1)).width;
    if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
      return middle;
    }
    if (middleWidth < width) {
      min = middle + 1;
    } else {
      max = middle - 1;
    }
  }
   
  return -1;
}

export default class Question extends Component {
  static propTypes = {
    question: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.fontSize = 32;
    this.lineHeight = this.fontSize * 1.2 * devicePixelRatio;
    this.resizeHandle = throttle(this.resizeHandle.bind(this), 200);
    window.addEventListener('resize', this.resizeHandle);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandle);
  }
  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.question, nextProps.question)) {
      this.drawQuestion(nextProps)
    }
  }
  getHandleAnswerQuestion = (code) => () => {
    if (this.props.control.questionGetting) return;
    this.props.answerQuestion(code);
  };
  initCanvas(canvas) {
    if (canvas && !this.canvas) {
      const canvasCtx = canvas.getContext('2d');
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');

      const devicePixelRatio = this.devicePixelRatio;
      const backingStoreRatio = canvasCtx.webkitBackingStorePixelRatio ||
        canvasCtx.mozBackingStorePixelRatio ||
        canvasCtx.msBackingStorePixelRatio ||
        canvasCtx.oBackingStorePixelRatio ||
        canvasCtx.backingStorePixelRatio || 1;
      this.ratio = devicePixelRatio / backingStoreRatio;
      this.setCanvasWidth(Math.min(768, window.document.documentElement.clientWidth));
      this.setCanvasHeight(300);

      window.canvasCtx = this.canvasCtx;
    }
  };
  setCanvasWidth(width) {
    width = width - 20; // padding size
    const canvas = this.canvas;
    canvas.width = width * this.ratio;
    canvas.style.width = `${width}px`;
    canvas.parentNode.style.width = canvas.style.width;
  }
  setCanvasHeight(height) {
    const canvas = this.canvas;
    canvas.height = height * this.ratio;
    canvas.style.height = `${height}px`;
  }

  drawQuestion(props) {
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const context = this.canvasCtx
    context.fillStyle = '#333';
    context.font = `${this.fontSize * this.ratio}px serif`;

    let text = props.question;
    let breakPoint = 0;
    const result = [];
    while ((breakPoint = findBreakPoint(text, this.canvas.width, context)) !== -1) {
      result.push(text.substr(0, breakPoint));
      text = text.substr(breakPoint);
    }
    if (text) {
      result.push(text);
    }
    const height = (result.length + 1) * this.lineHeight / this.devicePixelRatio;
    this.setCanvasHeight(height);
    context.fillStyle = '#333';
    context.font = `${this.fontSize * this.ratio}px serif`;

    result.forEach((line, index) => {
      context.fillText(line, 0, this.lineHeight * (index + 1));
    });
  }
  resizeHandle() {
    const nextWidth = Math.min(768, window.document.documentElement.clientWidth);
    this.setCanvasWidth(nextWidth);
    this.drawQuestion(this.props);
  }
  shouldComponentUpdate(nextProps) {
    if (!this.props.question || !this.canvas) {
      return true;
    }
    return false;
  }
  render() {
    return (
      <div className="question-wrap">
        <canvas
          ref={canvas => this.initCanvas(canvas)} 
        />
      </div>
    );
  }
}