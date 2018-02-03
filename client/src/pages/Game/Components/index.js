import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import keycode from 'keycode';
import Stage from './Stages';
import Modals from './Modals';
import './index.css';

export default class Game extends Component {
  componentWillMount() {
    this.props.ws.connect();
    this.initKeyboardQuickAnswer();
    this.initContraCheats();
  }
  initKeyboardQuickAnswer = () => {
    document.addEventListener('keydown', (e) => {
      if (
        this.props.game.status === 'start' && 
        !this.props.control.answeredAll &&
        !this.props.control.questionGetting
      ) {
        const index = +keycode(e) - 1;
        if (Number.isNaN(index)) {
          return;
        }
        this.props.answerQuestionByIndex(index);
      }
    });
  }
  // Contra cheat for fun
  initContraCheats = () => {
    const KEYMAP = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
    this._timeoutContraCheats = null;
    this._leftKeysContraCheats = KEYMAP.slice();
    this._keyDownHandleContraCheats = (e) => {
      if (this.props.game.status === 'ready') {
        if (this._leftKeysContraCheats[0] === keycode(e)) {
          this._leftKeysContraCheats.shift();
          clearTimeout(this._timeoutContraCheats);
          this._timeoutContraCheats = setTimeout(() => {
            this._leftKeysContraCheats = KEYMAP.slice();
          }, 1000);
        } else {
          this._leftKeysContraCheats = KEYMAP.slice();
        }
        if (!this._leftKeysContraCheats.length) {
          toast('成功输入秘籍，获得额外 buff 加成！', {
            type: 'success',
            autoClose: 3000,
          });
          this.props.completeContraCheats();
          document.removeEventListener('keydown', this._keyDownHandleContraCheats);
        }
      }
    };
    document.addEventListener('keydown', this._keyDownHandleContraCheats);
  }
  render() {
    return (
      <main>
        <Stage {...this.props} />
        <Modals {...this.props} />
        <ToastContainer />
      </main>
    );
  };
}