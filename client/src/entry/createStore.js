import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

export default function(reducer, saga) {
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

  return store;
};