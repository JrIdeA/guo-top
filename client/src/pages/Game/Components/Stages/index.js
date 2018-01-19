import React, { Component } from 'react';
import Joining from './Joining';
import Ready from './Ready';
import Start from './Start';
import AnsweredAll from './AnsweredAll';

export default class GameStage extends Component {
  render() {
    const { game: { status }, control: { answeredAll } } = this.props;
    let stage;

    if (status === 'ready') {
      stage = <Ready {...this.props} />;
    } else if (status === 'start') {
      stage = answeredAll ?
        <AnsweredAll {...this.props} /> :
        <Start {...this.props} />;
    } else {
      stage = <Joining {...this.props} />
    }

    return stage;
  }
}