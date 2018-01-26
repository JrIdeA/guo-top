import React, { Component } from 'react';
import './pacman.css';

export default class Home extends Component {
  handleEnterStadium = () => {
    if (this.props.stadiumLink) {
      window.location.href = this.props.stadiumLink;
    }
  };
  renderButton() {
    if (this.props.status === 'idle') {
      return (
        <button className="btn btn-primary disabled">将于 {this.props.readyTimeFormatted} 开启</button>
      );
    } if (this.props.status === 'ready' || !this.props.status === 'start') {
      return (
        <button 
          className="btn btn-primary btn-primary"
          onClick={this.handleEnterStadium}
        >进入赛场</button>
      );
    }
    return (
      <button className="btn btn-primary disabled">游戏已结束</button>
    );
  }
  renderIntro() {
    return (
      <div>
        <h1>百万榛果冲顶大会</h1>
        <div>
          <h2>介绍：</h2>
          <p>这里是介绍</p>
          <p>预赛阶段将在 {this.props.startTimeFormatted} 正式开始，赛场入口将于 {this.props.readyTimeFormatted} 开启，请准时登录。</p>
        </div>
        <div>
          <h2>活动规则：</h2>
          <p>你需要在指定时间内进行答题，题目均为单选题。</p>
          <p>答题正确得一分，答题错误扣一分，每题必答不能跳过。</p>
          <p>答题结束后将统计所有人的得分，得分前 16 名将进入决赛进行两两 PK 角逐榛果知识王者的称号。</p>
          <h3>友情提示：</h3>
          <p>可以快速的使用键盘的 1 2 3 来选择答案，分别对应 a b c 选项。</p>
          <p>虽然不限制使用搜索引擎对答案搜索，但是不建议，因为这样会严重降低答题速度 :)。</p>
        </div>
        <div>
          {this.renderButton()}
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
    return this.renderIntro();
  }
}