import { connect } from 'react-redux';
import { mapValues, cloneDeep, get } from 'lodash';

export default ({
  root,
  initState,
  computed,
  actions,
}) => {
  const mapStateToProps = (state, ownProps) => {
    let connectedProps = get(state, root);
    if (computed) {
      connectedProps = cloneDeep(connectedProps);
      Object.defineProperties(connectedProps, mapValues(computed, (compute) => {
        return { get: () => compute(state) }
      }));
    }
    return {
      ...ownProps,
      ...connectedProps,
    };
  };
  const mapDispatchToProps = {
    ...actions,
  };

  return connect(mapStateToProps, mapDispatchToProps);
};