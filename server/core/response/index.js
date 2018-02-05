const lz = require('lz-string');
const {
  ERROR_BAD_REQUEST,
  ERROR_USER_NOT_REGISTER,
  ERROR_USER_NOT_ONLINE,
  ERROR_GAME_IN_IDLE,
  ERROR_GAME_NOT_START,
  ERROR_GAME_END_RESULTED,
  ERROR_USER_GAME_TIMEOUT,
  ERROR_USRE_ALREADY_ANSWERED,
} = require('../../../shared/error');
const {
  WS_SERVER_ERROR,
  WS_SERVER_GAME_INFO,
  WS_SERVER_WELCOME,
  WS_SERVER_SEND_QUESTION,
  WS_SERVER_SEND_ANSWER_RESULT,
  WS_SERVER_SEND_ANSWERED_ALL,
  WS_SERVER_SEND_GAME_ENDING,
  WS_SERVER_SEND_GAME_RESULT,
} = require('../../../shared/wstype');

module.exports = function createWsReponse(ws) {
  const send = (messageJson) => {
    let message = JSON.stringify(messageJson);
    message = lz.compressToUTF16(message);
    ws.send(message);
  };
  const sendError = errorType => payload => send({
    type: WS_SERVER_ERROR,
    error: errorType,
    data: payload,
  });
  const sendSuccess = type => payload => send({
    type,
    data: payload,
  });

  return {
    send: {
      welcome: sendSuccess(WS_SERVER_WELCOME),
      question: sendSuccess(WS_SERVER_SEND_QUESTION),
      answer: sendSuccess(WS_SERVER_SEND_ANSWER_RESULT),
      gameInfo: sendSuccess(WS_SERVER_GAME_INFO),
      answeredAll: sendSuccess(WS_SERVER_SEND_ANSWERED_ALL),
      gameEnding: sendSuccess(WS_SERVER_SEND_GAME_ENDING),
      gameResult: sendSuccess(WS_SERVER_SEND_GAME_RESULT),
    },
    error: {
      badRequest: sendError(ERROR_BAD_REQUEST),
      userNotRegister: sendError(ERROR_USER_NOT_REGISTER),
      userNotOnline: sendError(ERROR_USER_NOT_ONLINE),
      gameInIdle: sendError(ERROR_GAME_IN_IDLE),
      gameNotStart: sendError(ERROR_GAME_NOT_START),
      gameEndResulted: sendError(ERROR_GAME_END_RESULTED),
      userGameTimeout: sendError(ERROR_USER_GAME_TIMEOUT),
      userGameAlreadyAnswered: sendError(ERROR_USRE_ALREADY_ANSWERED),
    },
  };
};
