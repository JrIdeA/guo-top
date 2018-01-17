import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import reducer from './reducer';
import saga from './saga';
import { initWs as initGameWs } from '../pages/Game';

const sagaMiddleware = createSagaMiddleware();
const middleware = [
  sagaMiddleware,
];
const composeEnhancer = [];
if (process.env.NODE_ENV !== 'production') {
  composeEnhancer.push(
    window.devToolsExtension ? window.devToolsExtension() : f => f
  );
}
const enhancer = compose(applyMiddleware(...middleware), ...composeEnhancer);
const store = createStore(reducer, enhancer);

sagaMiddleware.run(saga);
initGameWs(store.dispatch);

export default store;