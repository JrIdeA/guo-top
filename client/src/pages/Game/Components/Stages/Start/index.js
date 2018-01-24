import React, { Component } from 'react';
import QA from './QA';

export default class StagesStart extends Component {
  handleBeforeUnload = (e) => {
    const dialogText = '离开将放弃该题，并且游戏会继续计时';
    e && (e.returnValue = dialogText);
    return dialogText;
  };
  componentWillMount() {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.modals.connectClosed) {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }
  renderGameCountdown() {
    const { control: { endCountdown } } = this.props;
    return (
      <div>
        还剩 {Math.floor(endCountdown / 1000)} 秒
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