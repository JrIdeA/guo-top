import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Game from './pages/Game';
// import Home from './pages/Home';
import store from './entry/store';

ReactDOM.render(
  <Provider store={store}>
    <Game />
  </Provider>
, document.getElementById('root'));

if (process.env.NODE_ENV !== 'production') {
  window._store = store;
}
