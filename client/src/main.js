import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import Game from './pages/Game';
import store from './entry/store';

ReactDOM.render(
  <Provider store={store}>
    <Game />
  </Provider>
, document.getElementById('root'));

if (process.env.NODE_ENV !== 'production') {
  window._store = store;
}
