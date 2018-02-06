import { delay } from 'redux-saga';
import { takeLatest, put } from 'redux-saga/effects';
import { replaceChildNode, createActionCreator } from '../../core';

export const initState = {
  status: '',
  rankList: [],
  error: null,
  leftDeadTime: -1,
};
export const computed = {};
export const actionTypes = {
  startTimer: 'startTimer',
  load: 'load',
  loadSuccess: 'loadSuccess',
  setError: 'setError',
}
export const actions = {
  startTimer: createActionCreator(actionTypes.startTimer),
  load: createActionCreator(actionTypes.load),
  setError: createActionCreator(actionTypes.setError),
  loadSuccess: createActionCreator(actionTypes.loadSuccess),
};
export const reducers = {
  [actionTypes.setError](state, payload) {
    return replaceChildNode(state, 'error', payload);
  },
  [actionTypes.loadSuccess](state, { status, rankList, leftDeadTime }) {
    return {
      ...state,
      status,
      rankList: rankList || [],
      leftDeadTime,
    };
  },
};
export const sagas = [
  takeLatest(actionTypes.load, function* load() {
    let resultData;
    try {
      resultData = yield window.fetch('/api/monitor')
      .then(response => response.json())
    } catch (err) {
      console.error(err);
      yield put(actions.setError(err));
      return;
    }
    yield put(actions.loadSuccess(resultData));
  }),
  takeLatest(actionTypes.startTimer, function* () {
    while(true) {
      yield put(actions.load());
      yield delay(3000);
    }
  }),
];