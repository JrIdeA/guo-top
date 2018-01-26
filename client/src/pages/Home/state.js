import moment from 'moment';
import { delay } from 'redux-saga';
import { takeLatest, select, put, take, fork, call, cancel } from 'redux-saga/effects';
import { replaceChildNode, createActionCreator } from '../../core';

function formatTime(time) {
  return moment(time).format('YYYY-MM-DD HH:mm:ss');
}

export const root = 'home';
export const initState = {
  status: '',
  readyTime: 0,
  startTime: 0,
  error: null,
};
export const computed = {
  readyTimeFormatted: state => formatTime(state.readyTime),
  startTimeFormatted: state => formatTime(state.startTime),
};
export const actionTypes = {
  load: 'load',
  loadSuccess: 'loadSuccess',
  setError: 'setError',
}
export const actions = {
  load: createActionCreator(actionTypes.load),
  setError: createActionCreator(actionTypes.setError),
  loadSuccess: createActionCreator(actionTypes.loadSuccess),
};
export const reducers = {
  [actionTypes.setError](state, payload) {
    return replaceChildNode(state, 'error', payload);
  },
  [actionTypes.loadSuccess](state, { status, readyTime, startTime, stadiumLink }) {
    return {
      ...state,
      status,
      readyTime,
      startTime,
      stadiumLink,
    };
  },
};
export const sagas = [
  takeLatest(actionTypes.load, function* load() {
    let gameData;
    try {
      gameData = yield window.fetch('/api/game')
      .then(response => response.json())
    } catch (err) {
      console.error(err);
      yield put(actions.setError(err));
      return;
    }
    yield put(actions.loadSuccess(gameData));
  }),
  function* pollingGameStatus() {
    let timeTickTask;
    timeTickTask = yield fork(function* timeTick() {
      try {
        while (true) {
          const status = yield select(state => state.status);
          if (status === 'ready' || status === 'start' || status === 'ending' || status === 'result') {
            timeTickTask && (yield cancel(timeTickTask));
          } else {
            yield put(actions.load());
          }
          yield call(delay, 1000);
        }
      } catch (error) {console.error(error)} // eslint-disable-line
    });
  }(),
];