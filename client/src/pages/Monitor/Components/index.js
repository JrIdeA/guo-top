import React, { Component } from 'react';
import './index.css';

export default class Monitor extends Component {
  componentWillMount() {
    this.props.startTimer();
  }
  renderStatus() {
    const statusText = `当前游戏状态：${this.props.status}`;
    const deadTimeText = `，距离最终结束时间：${this.props.leftDeadTime / 1000}`;
    return (
      <div className="status">
        {statusText}
        {this.props.status === 'start' && deadTimeText}
      </div>
    )
  }
  renderRankList() {
    return (
      <ol>
        {this.props.rankList.map(({ userId, point, total, usedTime, rank }) => (
          <li>
            #{rank} <span>{userId}</span> - 得分：{point}，答题数：{total}，用时：{usedTime / 1000}
          </li>
        ))}
      </ol>
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
    if (!this.props.status) return this.renderLoading();
    return (
      <main>
        <h1>实时结果</h1>
        {this.renderStatus()}
        {this.renderRankList()}
      </main>
    );
  }
}