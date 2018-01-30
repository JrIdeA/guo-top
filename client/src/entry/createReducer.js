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

export default function(reducerFrames, initState) {
  return createReducerByFrames(reducerFrames, initState)
}