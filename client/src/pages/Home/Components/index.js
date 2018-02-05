import React, { Component } from 'react';
import './index.css';

export default class Home extends Component {
  handleEnterStadium = () => {
    if (this.props.stadiumLink) {
      window.location.href = this.props.stadiumLink;
    }
  };
  renderButton() {
    if (this.props.status === 'idle') {
      return (
        <button className="btn disabled">赛场入口将于 {this.props.readyTimeFormatted} 开启</button>
      );
    } if (this.props.status === 'ready' || this.props.status === 'start') {
      return (
        <button 
          className="btn"
          onClick={this.handleEnterStadium}
        >进入赛场</button>
      );
    }
    return (
      <a 
        className="btn"
        href="/result"
      >游戏已结束，查看结果</a>
    );
  }
  renderIntro() {
    return (
      <main>
        <h1>百万榛果冲顶大会</h1>
        <div>
          <h2>介绍：</h2>
          <p>送走金鸡，迎来瑞犬，伴随着普天同庆的喜悦，一年一度的尾牙晚宴又和大家见面了。</p>
          <p>让我们带着爱与和谐，去赢得生活的从容与自信。</p>
          <p>让我们带着爱与祝福，去博得生活的希望与收获。</p>
          <p>让我们带着爱与智慧，去榛得今晚的掌声与奖品。</p>
        </div>
        <div>
          <h2>活动规则：</h2>
          <p>预赛阶段将在 {this.props.startTimeFormatted} 正式开始，赛场入口将于 {this.props.readyTimeFormatted} 开启，请准时登录。</p>
          <p>你需要在指定时间内进行答题，题目均为单选题。</p>
          <p>答题正确得一分，答题错误不扣分，每题必答不能跳过。</p>
          <p>答题结束后将统计所有人的得分，得分前 16 名将进入决赛进行两两 PK 角逐榛果知识王者的称号。</p>
        </div>
        <div className="btn-wrap">
          {this.renderButton()}
        </div>
      </main>
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
    return this.renderIntro();
  }
}