import Container from './Container';
import { initState, reducers, sagas } from './state';
import entry from '../../entry';

entry(reducers, initState, sagas, Container);