import React, { Component } from 'react';
import Rodal from 'rodal';

export default class ModalGameInIdle extends Component {
  handleClose = () => {
    window.location.href = '/';
  };
  render() {
    return (
      <Rodal 
        visible={this.props.modals.gameInIdle} 
        onClose={this.handleClose}
      >
          <div>游戏暂未开始，请勿着急</div>
          <button className="btn inverse" onClick={this.handleClose}>确定</button>
      </Rodal>
    );
  }
}