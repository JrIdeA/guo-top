import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

export default class Question extends Component {
  static propTypes = {
    question: PropTypes.string,
  };
  componentDidMount() {

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
      const devicePixelRatio = window.devicePixelRatio || 1;
      const backingStoreRatio = canvasCtx.webkitBackingStorePixelRatio ||
        canvasCtx.mozBackingStorePixelRatio ||
        canvasCtx.msBackingStorePixelRatio ||
        canvasCtx.oBackingStorePixelRatio ||
        canvasCtx.backingStorePixelRatio || 1;
      const ratio = devicePixelRatio / backingStoreRatio;
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
      canvas.parentNode.style.width = canvas.style.width;
      canvas.width = canvas.width * ratio;
      canvas.height = canvas.height * ratio;
      canvasCtx.fillStyle = 'white';
      canvasCtx.font = '48px serif';

      
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      window.canvasCtx = this.canvasCtx;
    }
  };
  drawQuestion(props) {
    console.log('drawQuestion', props.question)
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvasCtx.fillText(props.question, 10, 50);
  }
  shouldComponentUpdate(nextProps) {
    if (!this.props.question || !this.canvas) {
      return true;
    }
    return false;
  }
  render() {
    return (
      <div style={{ margin: '0 auto' }}>
        <canvas 
          width="300"
          height="300"
          ref={canvas => this.initCanvas(canvas)} 
        />
      </div>
    );
  }
}