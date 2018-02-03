import React, { Component } from 'react';
import Rodal from 'rodal';

export default class ModalUserNotRegister extends Component {
  handleClose = () => {
    window.location.href = '/';
  };
  render() {
    return (
      <Rodal 
        visible={this.props.modals.userNotRegister} 
        onClose={this.handleClose}
      >
          <div>抱歉，您没有参与游戏的权限</div>
          <button className="btn inverse" onClick={this.handleClose}>确定</button>
      </Rodal>
    );
  }
}