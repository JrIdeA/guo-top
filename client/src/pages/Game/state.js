import { delay } from 'redux-saga';
import { takeLatest, select, takeEvery, put, take, fork, call, cancel } from 'redux-saga/effects';
import moment from 'moment';
import { toast } from 'react-toastify';
import { replaceChildNode } from '../../core';
import {
  ws,
  ERROR_GAME_IN_IDLE,
  ERROR_BAD_REQUEST,
  ERROR_USER_NOT_REGISTER,
  ERROR_USRE_ALREADY_ANSWERED,
  WS_CLIENT_SEND_ANSWER,
  WS_SERVER_GAME_INFO,
  WS_SERVER_WELCOME,
  WS_SERVER_SEND_QUESTION,
  WS_SERVER_SEND_ANSWER_RESULT,
  WS_SERVER_SEND_ANSWERED_ALL,
} from './communicate';

function createAction(type) {
  return (payload) => ({ type, payload });
}

export const root = 'game';
export const initState = {
  userId: '',
  game: {
    status: '',
    startTime: 0,
    playtimeSeconds: 0,
    prepareCountdown: 0,
  },
  count: {
    total: 0,
    wrong: 0,
    correct: 0,
  },
  question: {
    id: 0,
    question: '',
    options: [],
    answerCode: undefined,
    correct: null,
  },
  control: {
    now: Date.now(),
    startTime: 0,
    endCountdown: 0,
    answeredAll: false,
  },
  modals: {
    gameInIdle: false,
    userNotRegister: false,
  },
  ws,
};
export const computed = {
  startTimeFormatted(state) {
    return moment(state.game.game.startTime).format('YYYY-MM-DD HH:mm:ss');
  },
  leftStartSeconds(state) {
    if (!state.game.control.startTime) return 0;
    return Math.floor((state.game.control.startTime - state.game.control.now) / 1000);
  } 
};
export const actionTypes = {
  startPrepareCountdown: 'startPrepareCountdown',
  stopPrepareCountdown: 'stopPrepareCountdown',
  tickPrepareCountdown: 'tickPrepareCountdown',
  startGameCountdown: 'startGameCountdown',
  stopGameCountdown: 'stopGameCountdown',
  tickGameCountdown: 'tickGameCountdown',
  startGame: 'startGame',
  updateEndCountdown: 'updateEndCountdown',
  getQuestion: 'getQuestion',
  answerQuestion: 'answerQuestion',
}
export const actions = {
  // pushToIndex: 'game/pushToIndex',
  answerQuestion: createAction(actionTypes.answerQuestion),
};
export const reducers = {
  [actionTypes.tickPrepareCountdown](state) {
    return replaceChildNode(
      state, 
      'control.now',
      Date.now(),
    );
  },
  [ERROR_GAME_IN_IDLE](state, payload) {
    return replaceChildNode(
      state, 
      'modals.gameInIdle',
      true
    );
  },
  [WS_SERVER_WELCOME](state, payload) {
    const { userId, gameStatus, count, leftTime, startTime, playtimeSeconds } = payload;
    return {
      ...state,
      userId,
      game: {
        status: gameStatus,
        count: count,
        startTime,
        playtimeSeconds,
      },
      control: {
        ...state.control,
        startTime: leftTime + Date.now(),
      },
      count,
    };
  },
  [ERROR_USER_NOT_REGISTER](state, payload) {
    return replaceChildNode(
      state, 
      'modals.userNotRegister',
      true
    );
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
  [WS_SERVER_SEND_ANSWERED_ALL](state) {
    return replaceChildNode(
      state, 
      'control.answeredAll',
      true
    );
  },
  [actionTypes.updateEndCountdown](state, nextEndCountdown) {
    return replaceChildNode(state, 'control.endCountdown', nextEndCountdown);
  },
  [actionTypes.tickGameCountdown](state, nextEndCountdown) {
    return replaceChildNode(state, 'control.endCountdown', nextEndCountdown);
  },
  [actionTypes.answerQuestion](state, answerCode) {
    return replaceChildNode(state, 'question.answerCode', answerCode);
  }
};
export const sagas = [
  takeLatest(WS_SERVER_GAME_INFO, function* ({ userId, gameStatus }) {
    const ws = yield select(state => state.game.ws);
    ws.sendTicket();
  }),
  takeLatest(WS_SERVER_WELCOME, function* ({ payload: { gameStatus, leftTime } }) {
    if (gameStatus === 'ready' && leftTime) {
      yield put(createAction(actionTypes.startPrepareCountdown)());
    } else if (gameStatus === 'start') {
      yield put(createAction(actionTypes.startGame)());
    }
  }),
  takeLatest(WS_SERVER_SEND_QUESTION, function* ({ payload: { id, options, question } }) {
    yield put(createAction(actionTypes.startGameCountdown)());
  }),
  takeLatest(ERROR_BAD_REQUEST, function* () {
    console.error('client send a bad request.');
  }),
  takeLatest(ERROR_USRE_ALREADY_ANSWERED, function* () {
    toast('该题已经答过啦~', {
      type: 'error',
      autoClose: 3000,
    });
  }),
  takeLatest(WS_SERVER_SEND_ANSWER_RESULT, function* () {
    yield put(createAction(actionTypes.getQuestion)());
  }),
  function* watchPrepareCountdown() {
    while (yield take(actionTypes.startPrepareCountdown)) {
      const timeTickTask = yield fork(function* timeTick() {
        try {
          while (true) {
            const startTime = yield select(state => state.game.control.startTime);
            yield put(createAction(actionTypes.tickPrepareCountdown)())
            if (Date.now() > startTime) {
              yield put(createAction(actionTypes.stopPrepareCountdown)());
            }
            yield call(delay, 1000);
          }
        } catch (error) {console.error(error)} // eslint-disable-line
      });
      yield take(actionTypes.stopPrepareCountdown);
      yield cancel(timeTickTask);
    }
  }(),
  function* watchGameCountdown() {
    while (yield take(actionTypes.startGameCountdown)) {
      const tickerMs = 300;
      const timeTickTask = yield fork(function* timeTick() {
        try {
          while (true) {
            const nextEndCountdown = (yield select(state => state.game.control.endCountdown)) - tickerMs;
            yield put(createAction(actionTypes.tickGameCountdown)(nextEndCountdown))
            if (!(nextEndCountdown > 0)) {
              yield put(createAction(actionTypes.stopGameCountdown)());
            }
            yield call(delay, tickerMs);
          }
        } catch (error) {console.error(error)} // eslint-disable-line
      });
      yield take(actionTypes.stopGameCountdown);
      yield cancel(timeTickTask);
    }
  }(),
  takeLatest(actionTypes.startGame, function* startGame() {
    // TODO start time and left Time checked.
    const updateEndCountdown = (yield select(state => state.game.game.playtimeSeconds)) * 1000;
    yield put(createAction(actionTypes.updateEndCountdown)(updateEndCountdown));
    yield put(createAction(actionTypes.getQuestion)());
    yield put(createAction(actionTypes.startGameCountdown)());
  }),
  takeLatest(actionTypes.getQuestion, function* getQuestion() {
    ws.getQuestion();
  }),
  takeLatest(actionTypes.answerQuestion, function* answerQuestion() {
    const {
      id: questionId,
      answerCode,
    } = yield select(state => state.game.question);
    ws.sendAnswer(questionId, answerCode);
  }),
];
const flow = {

};