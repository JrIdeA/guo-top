import React, { Component } from 'react';
import Rodal from 'rodal';

export default class ModalGameInIdle extends Component {
  handleClose = () => {
    window.location.href = window.location.href;
  };
  render() {
    return (
      <Rodal
        visible={this.props.modals.connectClosed} 
        showCloseButton={false}
        onClose={this.handleClose}
      >
        <div>与服务器的连接已断开</div>
        <button className="btn inverse" onClick={this.handleClose}>刷新页面</button>
      </Rodal>
    );
  }
}