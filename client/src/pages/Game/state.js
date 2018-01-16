import { identity } from 'lodash';
import { push } from 'react-router-redux';
import { takeLatest, select, takeEvery, put } from 'redux-saga/effects';
import moment from 'moment';
import { replaceChildNode } from '../../core';
import {
  ws,
  ERROR_GAME_IN_IDLE,
  ERROR_BAD_REQUEST,
  WS_SERVER_WELCOME,
  WS_SERVER_SEND_QUESTION,
  WS_SERVER_SEND_ANSWER_RESULT,
} from './communicate';

export const root = 'game';
export const initState = {
  userId: '',
  game: {
    status: '',
    count: '',
    startTime: 0,
    playtimeSeconds: 0,
  },
  question: {
    id: 0,
    question: '',
    options: [],
    correct: null,
  },
  control: {

  },
  modals: {
    gameInIdle: false,
  },
  ws,
};
export const computed = {
  startTimeFormatted(state) {
    return moment(state.game.startTime).format('YYYY-MM-DD HH:mm:ss');
  }
};
export const actions = {
  // pushToIndex: 'game/pushToIndex',
};
export const reducers = {
  [ERROR_GAME_IN_IDLE](state, payload) {
    return replaceChildNode(
      state, 
      'modals.gameInIdle',
      true
    );
  },
  [WS_SERVER_WELCOME](state, { userId, gameStatus, count }) {
    return {
      ...state,
      userId,
      game: {
        status: gameStatus,
        count: count,
      },
    };
  },
  [WS_SERVER_SEND_QUESTION](state, { id, question, options }) {
    return {
      ...state,
      question: {
        id,
        question,
        options,
        answerCode: null,
        correct: null,
      },
    };
  },
  [WS_SERVER_SEND_ANSWER_RESULT](state, {
    questionId,
    correct,
    count,
  }) {
    if (questionId != state.question.id) {
      return state;
    }
    return {
      ...state,
      question: {
        ...state.question,
        correct,
      },
      count,
    };
  },
};
export const saga = [
  takeLatest(WS_SERVER_WELCOME, function* ({ userId, gameStatus, count }) {
  }),
  takeLatest(ERROR_GAME_IN_IDLE, function* () {
  }),
  takeLatest(ERROR_BAD_REQUEST, function* () {
    console.error('client send a bad request.')
  }),
  takeLatest(WS_SERVER_SEND_ANSWER_RESULT, function* () {
    const state = yield select();
    // ws.getNextQuiz();
  }),
];
const flow = {

};