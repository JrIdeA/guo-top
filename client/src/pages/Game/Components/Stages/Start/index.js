import React, { Component } from 'react';
import QA from './QA';

export default class StagesStart extends Component {
  state = {
    now: 0,
  };
  handleBeforeUnload = (e) => {
    const dialogText = '离开将放弃该题，并且游戏会继续计时';
    e && (e.returnValue = dialogText);
    return dialogText;
  };
  startCountdown() {
    this.setState({
      now: Date.now(),
    });
    this.timer = setInterval(() => {
      if (!this.props.control.questionGetting) {
        this.setState({
          now: Date.now(),
        });
      }
    }, 300);
  }
  componentWillMount() {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    this.startCountdown();
  }
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    clearInterval(this.timer);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.modals.connectClosed) {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    if (nextProps.control.questionGetting && !this.props.control.questionGetting) {
      clearInterval(this.timer);
    } else if (!nextProps.control.questionGetting && this.props.control.questionGetting) {
      this.startCountdown();
    }
  }
  renderGameCountdown() {
    const { control: { endTime } } = this.props;
    return (
      <div>
        还剩 {Math.floor((endTime - this.state.now) / 1000)} 秒
      </div>
    );
  }
  renderStatistics() {
    return (
      <div>
        当前得分：{this.props.count.point}
      </div>
    );
  }
  render() {
    return (
      <div>
        {this.renderGameCountdown()}
        {this.renderStatistics()}
        <QA 
          {...this.props.question}
          answerQuestion={this.props.answerQuestion}
        />
      </div>
    );
  }
}