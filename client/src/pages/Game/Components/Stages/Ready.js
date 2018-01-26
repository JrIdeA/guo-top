import React, { Component } from 'react';

export default class GameStageReady extends Component {
  render() {
    return (
      <div>
        <h1>百万榛果冲顶大会</h1>
        <p>游戏将于 {this.props.startTimeFormatted} 开始，倒计时 {this.props.leftStartSeconds} 秒</p>
        <div>
          <h3>规则：</h3>
          <p>你需要在 {this.props.game.playtimeSeconds}s 内进行答题，题目均为单选题。</p>
          <p>答题正确得一分，答题错误扣一分，每题必答不能跳过。</p>
          <p>答题结束后将统计所有人的得分，得分前 16 名将进入决赛进行两两 PK 角逐榛果知识王者的称号。</p>
          <p>最终成绩计算以服务器为准。</p>
        </div>
        <div>
          <h3>友情提示：</h3>
          <p>可以快速的使用 1 2 3 来选择答案，分别对应 a b c 选项。</p>
          <p>虽然不限制使用搜索引擎对答案搜索，但是不建议，因为这样会严重降低答题速度 :)。</p>
        </div>
      </div>
    );
  }
}