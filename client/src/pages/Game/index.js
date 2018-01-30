import Container from './Container';
import { initState, reducers, sagas } from './state';
import entry from '../../entry';
import { initWs } from './communicate';

entry(reducers, initState, sagas, Container, (store) => {
  initWs(store.dispatch);
});