import React, { Component } from 'react';
import ModalGameInIdle from './GameInIdle';
import ModalUserNotRegister from './UserNotRegister';
import 'rodal/lib/rodal.css';

export default class GameModals extends Component {
  render() {
    return (
      <div>
        <ModalGameInIdle {...this.props} />
        <ModalUserNotRegister {...this.props} />
      </div>
    );
  }
}