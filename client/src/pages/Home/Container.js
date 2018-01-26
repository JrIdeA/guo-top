import { connect } from '../../core';
import { actions, computed, root } from './state';
import Game from './Components';

export default connect({
  root,
  actions,
  computed,
})(Game);