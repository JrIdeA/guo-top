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
      this.setState({
        now: Date.now(),
      });
    }, 300);
  }
  componentDidMount() {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    this.startCountdown();
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.modals.connectClosed) {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
      clearInterval(this.timer);
      return;
    }

    if (nextProps.control.questionGetting && !this.props.control.questionGetting) {
      clearInterval(this.timer);
    } else if (!nextProps.control.questionGetting && this.props.control.questionGetting) {
      this.startCountdown();
    }
  }
  renderInfo() {
    const { control: { endTime }, userId } = this.props;
    return (
      <div className="info-wrap">
        <p>{userId}</p>
        <p>还剩 {Math.floor((endTime - this.state.now) / 1000)} 秒</p>
        <p>当前得分：{this.props.score.point}</p>
      </div>
    );
  }
  render() {
    return (
      <div>
        {this.renderInfo()}
        <QA 
          {...this.props.question}
          answerQuestion={this.props.answerQuestion}
          control={this.props.control}
        />
      </div>
    );
  }
}