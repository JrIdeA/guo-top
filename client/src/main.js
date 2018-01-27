import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './entry/store';
// import Game from './pages/Game';
// import Home from './pages/Home';
import Rank from './pages/Rank';

ReactDOM.render(
  <Provider store={store}>
    <Rank />
  </Provider>
, document.getElementById('root'));

if (process.env.NODE_ENV !== 'production') {
  window._store = store;
}
