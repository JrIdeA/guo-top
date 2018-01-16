import React, { Component } from 'react';
import ModalGameInIdle from './GameInIdle';
import 'rodal/lib/rodal.css';

export default class GameModals extends Component {
  render() {
    return (
      <div>
        <ModalGameInIdle {...this.props} />
      </div>
    );
  }
}