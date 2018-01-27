import React, { Component } from 'react';
import './index.css';

export default class GameStageResult extends Component {
  renderTitle = () => {
    if (this.props.count.rank == 1) {
      return <span className="winner-chicken">大吉大利，今晚吃鸡</span>
    }
    return '游戏结束';
  };
  render() {
    const {
      rank,
      point,
    } = this.props.count;
    return (
      <div className="stage-result">
        <h2>{this.renderTitle()}</h2>
        <p>你的排名为：{rank}， 得分为：{point}</p>
        <button className="btn btn-primary">查看所有排名及决赛分组</button>
      </div>
    );
  }
}