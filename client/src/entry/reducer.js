import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducers as reducersGame, initState as initStateGame } from '../pages/Game';

function createReducerByFrames(reducerFrames, initState) {
  return (state = initState, action) => {
    const { type, payload } = action;
    const targetReducer = reducerFrames[type];
    if (targetReducer) {
      return targetReducer(state, payload, action);
    }
    return state;
  };
}

export default combineReducers({
  game: createReducerByFrames(reducersGame, initStateGame),
  router: routerReducer,
});