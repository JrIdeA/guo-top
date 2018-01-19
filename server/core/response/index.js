const {
  ERROR_BAD_REQUEST,
  ERROR_QUESTION_OPTIONS_INVALID,
  ERROR_USER_NOT_REGISTER,
  ERROR_USER_NOT_LOGIN,
  ERROR_USER_NOT_ONLINE,
  ERROR_GAME_IN_IDLE,
  ERROR_GAME_NOT_START,
  ERROR_GAME_ENDING,
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
} = require('../../../shared/wstype');

module.exports = function createWsReponse(ws) {
  const send = (messageJson) => {
    ws.send(JSON.stringify(messageJson));
  };
  const sendError = errorType => () => send({
    type: WS_SERVER_ERROR,
    error: errorType,
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
    },
    error: {
      badRequest: sendError(ERROR_BAD_REQUEST),
      userNotRegister: sendError(ERROR_USER_NOT_REGISTER),
      userNotOnline: sendError(ERROR_USER_NOT_ONLINE),
      gameInIdle: sendError(ERROR_GAME_IN_IDLE),
      gameEnding: sendError(ERROR_GAME_ENDING),
      gameEndResulted: sendError(ERROR_GAME_END_RESULTED),
      userGameTimeout: sendError(ERROR_USER_GAME_TIMEOUT),
      userGameAlreadyAnswered: sendError(ERROR_USRE_ALREADY_ANSWERED),
    },
  };
};
