import Cookies from 'js-cookie';
import lz from 'lz-string';
import { logger } from '../../../core';
import {
  WS_CLIENT_TICKET,
  WS_CLIENT_GET_QUESTION,
  WS_CLIENT_SEND_ANSWER,
  WS_CLIENT_END,
} from '../../../shared/wstype';
import {
  ERROR_CONNECT_CLOSED,
} from '../../../shared/error';
import { wsStatusToActionType } from './actionType';

function getActionByMessage({ type, data }) {
  const actionType = wsStatusToActionType(type);
  return {
    type: actionType,
    payload: data,
  };
}
function getActionByError({ error }) {
  const actionType = wsStatusToActionType(error, true);
  return {
    type: actionType,
  };
}
function encodeMessage(data) {
  return JSON.stringify(data);
};
function decodeMessage(message) {
  try {
    message = lz.decompressFromUTF16(message);
    return JSON.parse(message);
  } catch (err) {
    return {};
  }
};

const gameWs = {
  dispatch: null,
  ws: null,
  connect() {
    const ws = new window.WebSocket(`ws://${window.location.host}/socket`);
    ws.addEventListener('message', (e) => {
      const data = decodeMessage(e.data);
      logger.log('ws: get message', data);
      if (data.error) {
        gameWs.dispatch(getActionByError(data));
      } else if (data.type) {
        gameWs.dispatch(getActionByMessage(data));
      }
    });
    ws.addEventListener('error', (e) => {
      logger.error('ws: on error', e);
    });
    ws.addEventListener('close', (e) => {
      logger.error('ws: on closed', e)
      gameWs.dispatch(getActionByError({ error: ERROR_CONNECT_CLOSED }));
    });
    gameWs.ws = ws;
  },
  send(data) {
    logger.log('ws: send message', data);
    gameWs.ws.send(encodeMessage(data));
  },
  close() {
    logger.log('ws: closed by client!');
    gameWs.ws.close();
    gameWs.ws = null;
  },
  sendTicket() {
    const token = Cookies.get('gtt');
    this.send({ 
      type: WS_CLIENT_TICKET, 
      payload: { token } 
    });
  },
  getQuestion() {
    this.send({
      type: WS_CLIENT_GET_QUESTION,
      payload: {
        time: Date.now(),
      },
    });
  },
  sendAnswer(questionId, answerCode) {
    this.send({
      type: WS_CLIENT_SEND_ANSWER,
      payload: {
        questionId,
        answerCode,
        time: Date.now(),
      },
    });
  },
  endGame() {
    this.send({
      type: WS_CLIENT_END,
      payload: {
        time: Date.now(),
      },
    });
  }
};

export function initWs(dispatch) {
  gameWs.dispatch = dispatch;
}
export default gameWs;