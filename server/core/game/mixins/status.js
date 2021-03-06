const { isArray, each, isFunction } = require('lodash');
const { logger } = require('../../utils');

const statusOrder = ['idle', 'ready', 'start', 'ending', 'result'];

const GameStatusProto = {
  initStatus() {
    this._status = 'idle';

    const self = this;
    const createStatusProps = (targetStatus) => {
      return {
        get() {
          return self._status === targetStatus;
        },
        set(value) {
          if (value) {
            self._status = targetStatus;
            self.emit('game:statusChange', targetStatus);
            self.emit(`status:${targetStatus}`);
          }
        },
      };
    };

    const status = {};
    Object.defineProperties(status, {
      idle: createStatusProps('idle'),
      ready: createStatusProps('ready'),
      start: createStatusProps('start'),
      ending: createStatusProps('ending'),
      result: createStatusProps('result'),
    });
    this.status = status;

    const createStatusChangeHandle = targetStatus => (handle) => {
      self.on(`status:${targetStatus}`, handle);
    };
    const onStatusChange = {
      idle: createStatusChangeHandle('idle'),
      ready: createStatusChangeHandle('ready'),
      start: createStatusChangeHandle('start'),
      ending: createStatusChangeHandle('ending'),
      result: createStatusChangeHandle('result'),
    };
    this.onStatusChange = onStatusChange;
    this.on('game:statusChange', (targetStatus) => {
      logger.log(`[Game] status change to ${targetStatus}, at ${Date.now()}`);
    });
  },
  getStatus() {
    return this._status;
  },
  setStatus(nextStatus) {
    this.status[nextStatus] = true;
  },
  setStatusWithoutEmitEvent(nextStatus) {
    this._status = nextStatus;
  },
  condStatus(conds) {
    each(conds, ([
      targetStatus,
      action,
    ]) => {
      if (!isArray(targetStatus)) {
        targetStatus = [targetStatus];
      }
      if (targetStatus.includes(this._status)) {
        if (isFunction(action)) {
          action();
          return false;
        }
      }
    });
  },
  isStatusAfter(compared) {
    if (!compared) return false;
    const comparedIndex = statusOrder.indexOf(compared);
    const currentIndex = statusOrder.indexOf(this._status);
    return comparedIndex >= 0 && (currentIndex >= comparedIndex);
  },
};

module.exports = GameStatusProto;
