import React, { Component } from 'react';
import QA from './QA';

export default class StagesQuestion extends Component {
  render() {
    return (
      <div>
        <QA 
          {...this.props.question}
          answerQuestion={this.props.answerQuestion}
        >123</QA>
      </div>
    );
  }
}