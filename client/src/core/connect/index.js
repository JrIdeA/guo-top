import { connect } from 'react-redux';
import { mapValues } from 'lodash';

export default ({
  initState,
  computed,
  actions,
}) => {
  const mapStateToProps = (state, ownProps) => {
    let connectedProps = state;
    if (computed) {
      connectedProps = {
        ...connectedProps,
        ...mapValues(computed, compute => compute(state)),
      };
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