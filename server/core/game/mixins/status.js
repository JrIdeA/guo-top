const GameStatusMixin =  {
  initStatus(options) {
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
            self.emit(`status:${targetStatus}`);
          }
        }
      }
    };

    const status = {};
    Object.defineProperties(status, {
      idle: createStatusProps('idle'),
      ready: createStatusProps('idle'),
      prepare: createStatusProps('prepare'),
      start: createStatusProps('start'),
      ending: createStatusProps('ending'),
      result: createStatusProps('result'),
    });
    this.status = status;

    const createStatusChangeHandle = (targetStatus) => {
      self.on(`status:${targetStatus}`);
    };
    const onStatusChange = {
      idle: createStatusChangeHandle('idle'),
      ready: createStatusChangeHandle('idle'),
      prepare: createStatusChangeHandle('prepare'),
      start: createStatusChangeHandle('start'),
      ending: createStatusChangeHandle('ending'),
      result: createStatusChangeHandle('result'),
    };
    this.onStatusChange = onStatusChange;
  },
}

module.exports = GameStatusMixin;