import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
// import { reducers as reducersGame, initState as initStateGame } from '../pages/Game';
// import { reducers as reducersHome, initState as initStateHome } from '../pages/Home';
import { reducers as reducersRank, initState as initStateRank } from '../pages/Rank';

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

export default createReducerByFrames(reducersRank, initStateRank);