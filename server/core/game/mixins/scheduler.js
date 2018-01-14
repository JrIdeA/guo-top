const { defaults } = require('lodash');
const lt = require('long-timeout');
const invariant = require('invariant');

/**
 * parse game config startTime string to timestamp
 *
 * @param {string} startTimeStr - 'YYYY-MM-DD HH:mm:ss'
 */
function parseStartTime(startTimeStr) {
  const m = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(startTimeStr);
  if (!m) {
    return Number.NaN;
  }
  return (new Date(m[1], m[2], m[3], m[4], m[5], m[6])).valueOf();
}

const GameSchedulerProto = {
  initScheduler() {
    const {
      startTime: startTimeStr,
      prepareSeconds,
      playtimeSeconds,
      deadtimeSeconds,
    } = defaults(this.config, {
      startTime: '',
      prepareSeconds: 3,
      playtimeSeconds: 60,
      deadtimeSeconds: 90,
    });

    const startTime = parseStartTime(startTimeStr);
    const prepareTime = startTime - (prepareSeconds * 1000);
    const endTime = startTime + (playtimeSeconds * 1000);
    const deadTime = startTime + (deadtimeSeconds * 1000); 
    invariant(startTime, `game startTime invalid, parsed: ${startTime}`);
    invariant(prepareTime > 0, `game prepareTime invalid, parsed: ${prepareTime}`);
    invariant(deadTime > startTime, `game deadTime should after then startTime, deadTime: ${deadTime}, startTime: ${startTime}`);

    this.startTime = startTime;
    this.prepareTime = prepareTime;
    this.endTime = endTime;
    this.deadTime = deadTime;
    this.validStartime = startTime > 0;
  },
  _timeTick(currentTime) {
    if (this.status.idle && currentTime > this.prepareTime) {
      this.status.prepare = true;
    }
    if (this.status.prepare && currentTime > this.startTime) {
      this.status.start = true;
    }
    if (this.status.start && currentTime > this.deadTime) {
      this.status.ending = true;
    }
  },
  startScheduler() {
    this._scheduleTimer = lt.setInterval(() => {
      this._timeTick(Date.now());
    }, 500);
  },
};

module.exports = GameSchedulerProto;
