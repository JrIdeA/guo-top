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
        onClose={this.handleClose}
      >
        <div>与服务器的连接已断开，请刷新页面</div>
      </Rodal>
    );
  }
}