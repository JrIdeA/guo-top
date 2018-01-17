import React, { Component } from 'react';
import Stage from './Stages';
import Modals from './Modals';

export default class Game extends Component {
  componentWillMount() {
    this.props.ws.connect();
  }
  componentWillUnmount() {

  }
  render() {
    return (
      <div>
        <Stage {...this.props} />
        <Modals {...this.props} />
      </div>
    );
  };
}