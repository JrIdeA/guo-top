const { isArray, each, isFunction } = require('lodash');
const { logger } = require('../../utils');

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
      prepare: createStatusProps('prepare'),
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
      prepare: createStatusChangeHandle('prepare'),
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
};

module.exports = GameStatusProto;
