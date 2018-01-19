import React, { Component } from 'react';

export default class GameStageAnsweredAll extends Component {
  render() {
    const { count } = this.props;
    return (
      <div>
        <div>没有题目了</div>
        <p>你居然答完了我们绞尽脑汁想出的所有题，真是厉害！</p>
        <p>以下是你的答题成绩：正确 {count.correct} 题，错误 {count.wrong} 题 </p>
        <p>请耐心等待其他同学答题结束</p>
      </div>
    );
  }
}