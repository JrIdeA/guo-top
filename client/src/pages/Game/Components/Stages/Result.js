import React, { Component } from 'react';

export default class GameStageResult extends Component {
  render() {
    const {
      rank,
      point,
    } = this.props.count;
    return (
      <div>
        <p>游戏结束，你的排名为：{rank}， 得分为：{point}</p>
      </div>
    );
  }
}