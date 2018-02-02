import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createReducer from './createReducer';
import createSaga from './createSaga';
import createStore from './createStore';
import './styles';

export default function entry(reducerFrames, initState, sagas, Container, storeCreated) {
  const reducer = createReducer(reducerFrames, initState);
  const saga = createSaga(sagas);
  const store = createStore(reducer, saga);
  if (storeCreated) {
    storeCreated(store);
  }

  ReactDOM.render(
    <Provider store={store}>
      <Container />
    </Provider>
  , document.getElementById('root'));

  if (process.env.NODE_ENV !== 'production') {
    window._store = store;
  }
}