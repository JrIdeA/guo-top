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
  [actionTypes.loadSuccess](state, { status, rankList }) {
    return {
      ...state,
      status,
      rankList
    };
  },
};
export const sagas = [
  takeLatest(actionTypes.load, function* load() {
    let resultData;
    try {
      resultData = yield window.fetch('/api/result')
      .then(response => response.json())
    } catch (err) {
      console.error(err);
      yield put(actions.setError(err));
      return;
    }
    yield put(actions.loadSuccess(resultData));
  }),
];