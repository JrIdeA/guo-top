import React, { Component } from 'react';
import './index.css';

export default class GameStageAnsweredAll extends Component {
  render() {
    const { score } = this.props;
    return (
      <div className="stage-answered-all">
        <h2>没有题目了</h2>
        <p>你居然答完了我们绞尽脑汁想出的所有题，真是厉害！</p>
        <p>以下是你的答题成绩：正确 {score.correct} 题，错误 {score.wrong} 题 </p>
        <p>请耐心等待其他同学答题结束</p>
      </div>
    );
  }
}