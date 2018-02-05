import { mapValues } from 'lodash';
import { delay } from 'redux-saga';
import { takeLatest, select, put, take, fork, call, cancel } from 'redux-saga/effects';
import moment from 'moment';
import { toast } from 'react-toastify';
import { replaceChildNode, createActionCreator } from '../../core';
import {
  ws,
  ERROR_CONNECT_CLOSED,
  ERROR_GAME_IN_IDLE,
  ERROR_BAD_REQUEST,
  ERROR_USER_NOT_REGISTER,
  ERROR_USRE_ALREADY_ANSWERED,
  ERROR_GAME_NOT_START,
  WS_SERVER_SEND_GAME_ENDING,
  WS_CLIENT_SEND_ANSWER,
  WS_SERVER_GAME_INFO,
  WS_SERVER_WELCOME,
  WS_SERVER_SEND_QUESTION,
  WS_SERVER_SEND_ANSWER_RESULT,
  WS_SERVER_SEND_ANSWERED_ALL,
  WS_SERVER_SEND_GAME_RESULT,
} from './communicate';

export const initState = {
  userId: '',
  game: {
    status: '',
    startTime: 0,
    playtimeSeconds: 0,
  },
  score: {
    total: 0,
    wrong: 0,
    correct: 0,
    point: 0,
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
    endTime: 0,
    pauseTime: 0,
    answeredAll: false,
    questionGetting: true,
  },
  modals: {
    gameInIdle: false,
    userNotRegister: false,
    connectClosed: false,
  },
  ws,
};
export const computed = {
  startTimeFormatted(state) {
    return moment(state.game.startTime).format('YYYY-MM-DD HH:mm:ss');
  },
  leftStartSeconds(state) {
    if (!state.control.startTime) return 0;
    return Math.floor((state.control.startTime - state.control.now) / 1000);
  },
  gameTimeout(state) {
    const { endTime } = state.control;
    return endTime && Date.now() > endTime;
  },
};
export const actionTypes = {
  completeContraCheats: 'completeContraCheats',
  startPrepareCountdown: 'startPrepareCountdown',
  stopPrepareCountdown: 'stopPrepareCountdown',
  tickPrepareCountdown: 'tickPrepareCountdown',
  startGameCountdown: 'startGameCountdown',
  stopGameCountdown: 'stopGameCountdown',
  startGame: 'startGame',
  endGame: 'endGame',
  getQuestion: 'getQuestion',
  answerQuestion: 'answerQuestion',
  answerQuestionByIndex: 'answerQuestionByIndex',
}
export const actions = mapValues(actionTypes, createActionCreator);
export const reducers = {
  [actionTypes.tickPrepareCountdown](state) {
    return replaceChildNode(
      state, 
      'control.now',
      Date.now(),
    );
  },
  [ERROR_CONNECT_CLOSED](state, payload) {
    return replaceChildNode(
      state,
      'modals.connectClosed',
      true
    );
  },
  [ERROR_GAME_IN_IDLE](state, payload) {
    return replaceChildNode(
      state,
      'modals.gameInIdle',
      true
    );
  },
  [ERROR_GAME_NOT_START](state, { 
    startTime, 
    leftStartTime,
    status,
    playtimeSeconds,
  }) {
    return {
      ...state,
      game: {
        ...state.game,
        status,
        startTime,
        playtimeSeconds,
      },
      control: {
        ...state.control,
        startTime: leftStartTime + Date.now(),
      },
    };
  },
  [WS_SERVER_WELCOME](state, payload) {
    const { 
      userId, 
      status, 
      score, 
      leftStartTime, 
      startTime, 
      playtimeSeconds,
      leftPlaytime,
    } = payload;

    return {
      ...state,
      userId,
      game: {
        status,
        startTime,
        playtimeSeconds,
      },
      control: {
        ...state.control,
        leftPlaytime,
        startTime: leftStartTime + Date.now(),
      },
      score,
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
    const nextEndTime = state.control.endTime + (Date.now() - state.control.pauseTime);

    return {
      ...state,
      question: {
        id,
        question,
        options,
        answerCode: null,
        correct: null,
      },
      control: {
        ...state.control,
        endTime: nextEndTime,
        questionGetting: false,
      }
    };
  },
  [WS_SERVER_SEND_ANSWER_RESULT](state, {
    questionId,
    correct,
    score,
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
      score,
    };
  },
  [WS_SERVER_SEND_ANSWERED_ALL](state, { score }) {
    const nextState = replaceChildNode(
      state, 
      'control.answeredAll',
      true
    );
    return {
      ...nextState,
      score,
    }
  },
  [WS_SERVER_SEND_GAME_RESULT](state, score) {
    return {
      ...state,
      score,
      game: {
        ...state,
        status: 'result',
      },
    };
  },
  [WS_SERVER_SEND_GAME_ENDING](state, { score }) {
    if (state.game.status === 'result') return state;
    return {
      ...state,
      score,
      game: {
        ...state,
        status: 'ending',
      },
    };
  },
  [actionTypes.startGame](state) {
    let leftPlaytime;
    if (state.game.status === 'start') {
      leftPlaytime = state.control.leftPlaytime;
    } else {
      leftPlaytime = state.game.playtimeSeconds * 1000;
    }
    const now = Date.now();
    const endTime = now + leftPlaytime;

    return {
      ...state,
      game: {
        ...state.game,
        status: 'start',
      },
      control: {
        ...state.control,
        pauseTime: now,
        endTime,
      },
    }
  },
  [actionTypes.answerQuestion](state, answerCode) {
    return {
      ...state,
      question: {
        ...state.question,
        answerCode,
      },
      control: {
        ...state.control,
        questionGetting: true,
        pauseTime: Date.now(),
      }
    };
  },
};
export const sagas = [
  takeLatest(WS_SERVER_GAME_INFO, function* () {
    const ws = yield select(state => state.ws);
    ws.sendTicket();
  }),
  takeLatest(WS_SERVER_WELCOME, function* ({
    payload: { 
      status,
    },
  }) {
    if (status === 'ready') {
      yield put(actions.startPrepareCountdown());
    } else if (status === 'start') {
      yield put(actions.startGame());
    }
  }),
  takeLatest(WS_SERVER_SEND_QUESTION, function* ({ payload: { id, options, question } }) {
    yield put(actions.startGameCountdown());
  }),
  takeLatest(ERROR_BAD_REQUEST, function* () {
    toast('与服务器通信出现异常，如有问题请刷新');
  }),
  takeLatest(ERROR_USRE_ALREADY_ANSWERED, function* () {
    toast('该题已经答过啦~', {
      type: 'error',
      autoClose: 1000,
    });
    yield delay(1000);
    yield put(actions.getQuestion());
  }),
  takeLatest(ERROR_GAME_NOT_START, function* () {
    yield put(actions.startPrepareCountdown());
  }),
  takeLatest(WS_SERVER_SEND_ANSWER_RESULT, function* () {
    yield call(delay, 300);
    yield put(actions.getQuestion());
  }),
  takeLatest(WS_SERVER_SEND_ANSWERED_ALL, function* () {
    yield put(actions.stopGameCountdown());
  }),
  function* watchPrepareCountdown() {
    while (yield take(actionTypes.startPrepareCountdown)) {
      const timeTickTask = yield fork(function* timeTick() {
        try {
          while (true) {
            const startTime = yield select(state => state.control.startTime);
            yield put(actions.tickPrepareCountdown());
            if (Date.now() > startTime) {
              yield put(actions.startGame());
              yield put(actions.stopPrepareCountdown());
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
            const endTime = yield select(state => state.control.endTime);
            if (endTime && Date.now() > endTime) {
              yield put(actions.endGame());
              yield put(actions.stopGameCountdown());
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
    yield put(actions.getQuestion());
    yield put(actions.startGameCountdown());
  }),
  takeLatest(actionTypes.getQuestion, function* getQuestion() {
    ws.getQuestion();
  }),
  takeLatest(actionTypes.answerQuestion, function* answerQuestion() {
    const {
      id: questionId,
      answerCode,
    } = yield select(state => state.question);
    yield put(actions.stopGameCountdown());
    ws.sendAnswer(questionId, answerCode);
  }),
  takeLatest(actionTypes.answerQuestionByIndex, function* answerQuestionByIndex({ payload: index }) {
    const answerOption = yield select(state => state.question.options[index]);
    if (!answerOption) return;
    yield put(actions.answerQuestion(answerOption.code));
  }),
  takeLatest(actionTypes.endGame, function* endGame() {
    const {
      id: questionId,
    } = yield select(state => state.question);
    ws.endGame(questionId);
  }),
  takeLatest(WS_SERVER_SEND_GAME_RESULT, function* () {
    yield put(actions.stopGameCountdown());
  }),
];
