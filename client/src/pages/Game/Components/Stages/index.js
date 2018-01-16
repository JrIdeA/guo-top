import React, { Component } from 'react';
import Joining from './Joining';
import Ready from './Ready';

export default class GameStage extends Component {
  render() {
    const { status } = this.props;
    let stage;

    if (status === 'ready') {
      stage = <Ready {...this.props} />;
    } else {
      stage = <Joining {...this.props} />
    }

    return stage;
  }
}