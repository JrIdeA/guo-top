import React, { Component } from 'react';
import './index.css';

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
      <div className="undone">比赛还未结束，请耐心等待</div>
    );
  }
  renderResult() {
    return (
      <div>
        <h1>结果排名</h1>
        <div>
          <h2>排名：</h2>
          <ul>
            {this.props.rankList.map((score, index) => (
              <li key={index}>
                #{score.rank} {score.userId} （得分：{score.point}，正确率：{score.accuracy}）
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>决赛分组：</h2>
          <ul>
            {this.props.finalGroup.map(({ group, competitor1, competitor2 }) => (
              <li key={group}>分组{group}：{competitor1} {competitor2 && `VS ${competitor2}`}</li>
            ))}
          </ul>
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
    let content;
    if (!this.props.status) {
      content = this.renderLoading();
    } else if (this.props.status === 'result') {
      content = this.renderResult();
    } else {
      content = this.renderUndone();
    }

    return (
      <main>{content}</main>
    );
  }
}