import React, { Component } from 'react';
import Joining from './Joining';
import Ready from './Ready';
import Question from './Question';

export default class GameStage extends Component {
  render() {
    const { status } = this.props.game;
    let stage;

    if (status === 'ready') {
      stage = <Ready {...this.props} />;
    } else if (status === 'start') {
      stage = <Question {...this.props} />;
    } else {
      stage = <Joining {...this.props} />
    }

    return stage;
  }
}