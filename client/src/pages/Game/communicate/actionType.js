import {
  ERROR_BAD_REQUEST as STATUS_ERROR_BAD_REQUEST,
  ERROR_QUESTION_OPTIONS_INVALID as STATUS_ERROR_QUESTION_OPTIONS_INVALID,
  ERROR_USER_NOT_REGISTER as STATUS_ERROR_USER_NOT_REGISTER,
  ERROR_USER_NOT_LOGIN as STATUS_ERROR_USER_NOT_LOGIN,
  ERROR_USER_NOT_ONLINE as STATUS_ERROR_USER_NOT_ONLINE,
  ERROR_GAME_IN_IDLE as STATUS_ERROR_GAME_IN_IDLE,
  ERROR_GAME_NOT_START as STATUS_ERROR_GAME_NOT_START,
  ERROR_GAME_ENDING as STATUS_ERROR_GAME_ENDING,
  ERROR_GAME_END_RESULTED as STATUS_ERROR_GAME_END_RESULTED,
  ERROR_USER_GAME_TIMEOUT as STATUS_ERROR_USER_GAME_TIMEOUT,
  ERROR_USRE_ALREADY_ANSWERED as STATUS_ERROR_USRE_ALREADY_ANSWERED,
} from '../../../shared/error';
import {
  WS_CLIENT_TICKET as STATUS_WS_CLIENT_TICKET,
  WS_CLIENT_GET_QUESTION as STATUS_WS_CLIENT_GET_QUESTION,
  WS_CLIENT_SEND_ANSWER as STATUS_WS_CLIENT_SEND_ANSWER,
  WS_CLIENT_END as STATUS_WS_CLIENT_END,
  WS_SERVER_ERROR as STATUS_WS_SERVER_ERROR,
  WS_SERVER_GAME_INFO as STATUS_WS_SERVER_GAME_INFO,
  WS_SERVER_WELCOME as STATUS_WS_SERVER_WELCOME,
  WS_SERVER_SEND_QUESTION as STATUS_WS_SERVER_SEND_QUESTION,
  WS_SERVER_SEND_ANSWER_RESULT as STATUS_WS_SERVER_SEND_ANSWER_RESULT,
} from '../../../shared/wstype';

export function wsStatusToActionType(wsStatus, isError) {
  return isError ? `GAME/WS_ERROR_${wsStatus}` : `GAME/WS_MESSAGE_${wsStatus}`;
}

export const ERROR_BAD_REQUEST = wsStatusToActionType(STATUS_ERROR_BAD_REQUEST, true);
export const ERROR_QUESTION_OPTIONS_INVALID = wsStatusToActionType(STATUS_ERROR_QUESTION_OPTIONS_INVALID, true);
export const ERROR_USER_NOT_REGISTER = wsStatusToActionType(STATUS_ERROR_USER_NOT_REGISTER, true);
export const ERROR_USER_NOT_LOGIN = wsStatusToActionType(STATUS_ERROR_USER_NOT_LOGIN, true);
export const ERROR_USER_NOT_ONLINE = wsStatusToActionType(STATUS_ERROR_USER_NOT_ONLINE, true);
export const ERROR_GAME_IN_IDLE = wsStatusToActionType(STATUS_ERROR_GAME_IN_IDLE, true);
export const ERROR_GAME_NOT_START = wsStatusToActionType(STATUS_ERROR_GAME_NOT_START, true);
export const ERROR_GAME_ENDING = wsStatusToActionType(STATUS_ERROR_GAME_ENDING, true);
export const ERROR_GAME_END_RESULTED = wsStatusToActionType(STATUS_ERROR_GAME_END_RESULTED, true);
export const ERROR_USER_GAME_TIMEOUT = wsStatusToActionType(STATUS_ERROR_USER_GAME_TIMEOUT, true);
export const ERROR_USRE_ALREADY_ANSWERED = wsStatusToActionType(STATUS_ERROR_USRE_ALREADY_ANSWERED, true);
export const WS_CLIENT_TICKET = wsStatusToActionType(STATUS_WS_CLIENT_TICKET);
export const WS_CLIENT_GET_QUESTION = wsStatusToActionType(STATUS_WS_CLIENT_GET_QUESTION);
export const WS_CLIENT_SEND_ANSWER = wsStatusToActionType(STATUS_WS_CLIENT_SEND_ANSWER);
export const WS_CLIENT_END = wsStatusToActionType(STATUS_WS_CLIENT_END);
export const WS_SERVER_ERROR = wsStatusToActionType(STATUS_WS_SERVER_ERROR);
export const WS_SERVER_GAME_INFO = wsStatusToActionType(STATUS_WS_SERVER_GAME_INFO);
export const WS_SERVER_WELCOME = wsStatusToActionType(STATUS_WS_SERVER_WELCOME);
export const WS_SERVER_SEND_QUESTION = wsStatusToActionType(STATUS_WS_SERVER_SEND_QUESTION);
export const WS_SERVER_SEND_ANSWER_RESULT = wsStatusToActionType(STATUS_WS_SERVER_SEND_ANSWER_RESULT);