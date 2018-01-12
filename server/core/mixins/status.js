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
      idle: targetStatus('idle'),
      prepare: targetStatus('prepare'),
      start: targetStatus('start'),
      ending: targetStatus('ending'),
      result: targetStatus('result'),
    });
    this.status = status;

    const createStatusChangeHandle = (targetStatus) => {
      self.on(`status:${targetStatus}`);
    };
    const onStatus = {
      idle: createStatusChangeHandle('idle'),
      prepare: createStatusChangeHandle('prepare'),
      start: createStatusChangeHandle('start'),
      ending: createStatusChangeHandle('ending'),
      result: createStatusChangeHandle('result'),
    };
  },
}

module.exports = GameStatusMixin;