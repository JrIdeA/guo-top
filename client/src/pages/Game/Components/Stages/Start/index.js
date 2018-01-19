import React, { Component } from 'react';
import QA from './QA';

export default class StagesStart extends Component {
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