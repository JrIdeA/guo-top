import Cookies from 'js-cookie';
import { logger } from '../../../core';
import {
  WS_CLIENT_TICKET,
} from '../../../shared/wstype';
import { wsStatusToActionType } from './actionType';

function geActionByMessage({ type, data }) {
  const actionType = wsStatusToActionType(type);
  return {
    type: actionType,
    payload: data,
  };
}
function geActionByError({ error }) {
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
    return JSON.parse(message);
  } catch (err) {
    return {};
  }
};

const gameWs = {
  dispatch: null,
  ws: null,
  connect() {
    const ws = new window.WebSocket(`ws://localhost:8000/socket`);
    ws.addEventListener('message', (e) => {
      logger.log('ws: get message', e.data);
      const data = decodeMessage(e.data);
      if (data.error) {
        gameWs.dispatch(geActionByError(data));
      } else if (data.type) {
        gameWs.dispatch(geActionByMessage(data));
      }
    });
    ws.addEventListener('error', (e) => {
      logger.error('ws: on error', e);
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
    // const token = Cookies.get('token');
    const token = 'abcdefg';
    this.send({ 
      type: WS_CLIENT_TICKET, 
      payload: { token } 
    });
  },
};

export function initWs(dispatch) {
  gameWs.dispatch = dispatch;
}
export default gameWs;