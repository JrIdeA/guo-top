import { connect } from '../../core';
import { actions, computed } from './state';
import Game from './Components';

export default connect({
  actions,
  computed,
})(Game);