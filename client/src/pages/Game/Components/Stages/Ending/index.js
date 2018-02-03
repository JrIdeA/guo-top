import React, { Component } from 'react';
import './index.css';

export default class GameStageEnding extends Component {
  render() {
    const { score } = this.props;
    return (
      <div className="stage-ending">
        <h2>你已完成比赛</h2>
        <p>得分：{score.point} 分</p>
        <p>共答 {score.total} 题，正确 {score.correct} 题，错误 {score.wrong} 题 </p>
        <p>请耐心等待其他同学答题结束</p>
      </div>
    );
  }
}