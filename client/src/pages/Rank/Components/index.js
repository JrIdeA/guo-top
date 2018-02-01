import React, { Component } from 'react';

export default class Home extends Component {
  componentWillMount() {
    this.props.load();
  }
  handleEnterStadium = () => {
    if (this.props.stadiumLink) {
      window.location.href = this.props.stadiumLink;
    }
  };
  renderUndone() {
    return (
      <div>比赛还未结束，请耐心等待</div>
    );
  }
  renderResult() {
    return (
      <div>
        <h1>结果排名</h1>
        <div>
          <h2>排名：</h2>
          <ul>
            {this.props.rankList.map(score => (
              <li>{score.rank} {score.userId} （得分：{score.point}，正确率：{score.accuracy}）</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>决赛分组：</h2>
          <div>
          </div>
        </div>
      </div>
    );
  }
  renderLoading() {
    return (
      <div>
        <div className="la-pacman">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
      </div>
      </div>
    );
  };
  render() {
    if (!this.props.status) {
      return this.renderLoading();
    }
    if (this.props.status === 'result') {
      return this.renderResult();
    }
    return this.renderUndone();
  }
}