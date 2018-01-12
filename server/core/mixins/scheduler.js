const { defaults } = require('lodash');
const lt = require('long-timeout');

/**
 * parse game options startTime string to timestamp
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

const GameSchedulerMixin =  {
  initScheduler(options) {
    const {
      startTime: startTimeStr,
      prepareSeconds,
      playtimeSeconds,
      deadtimeSeconds,
    } = defaults(options, {
      startTime: '',
      prepareSeconds: 3,
      playtimeSeconds: 60,
      deadtimeSeconds: 90,
    });

    const startTime = parseStartTime(startTimeStr);
    const prepareTime = startTime - prepareSeconds * 1000;
    const deadTime = startTime + deadtimeSeconds * 1000; 

    this.options = options;
    this.startTime = startTime;
    this.prepareTime = prepareTime;
    this.deadTime = deadTime;
    this.validStartime = startTime > 0;
  },
  _timeTick(currentTime) {
    if (this.status.idle && currentTime > prepareTime) {
      this.status.prepare = true;
    }
    if (this.status.prepare && currentTime > startTime) {
      this.status.start = true;
    }
    if (this.status.start && currentTime > deadTime) {
      this.status.ending = true;
    }
  },
  startScheduler() {
    lt.setInterval(() => {
      this._timeTick(Date.now());
    }, 500);
  },
}

module.exports = GameSchedulerMixin;