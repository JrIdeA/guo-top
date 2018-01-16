const { defaults } = require('lodash');
const lt = require('long-timeout');
const invariant = require('invariant');
const { logger } = require('../../utils');

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
  return (new Date(m[1], m[2] - 1, m[3], m[4], m[5], m[6])).valueOf();
}

const GameSchedulerProto = {
  initScheduler() {
    const {
      startTime: startTimeStr,
      readySeconds,
      prepareSeconds,
      playtimeSeconds,
      deadtimeSeconds,
    } = defaults(this.config, {
      startTime: '',
      readySeconds: 60,
      prepareSeconds: 3,
      playtimeSeconds: 60,
      deadtimeSeconds: 90,
    });

    const startTime = parseStartTime(startTimeStr);
    const prepareTime = startTime - (prepareSeconds * 1000);
    const readyTime = prepareTime - (readySeconds * 1000);
    const endTime = startTime + (playtimeSeconds * 1000);
    const deadTime = startTime + (deadtimeSeconds * 1000);
    invariant(startTime, `game startTime invalid, parsed: ${startTime}`);
    invariant(prepareTime > 0, `game prepareTime invalid, parsed: ${prepareTime}`);
    invariant(deadTime > startTime, `game deadTime should after then startTime, deadTime: ${deadTime}, startTime: ${startTime}`);

    this.readyTime = readyTime;
    this.prepareTime = prepareTime;
    this.startTime = startTime;
    this.endTime = endTime;
    this.deadTime = deadTime;
    this.validStartime = startTime > 0;

    logger.debug('readyTime is ', readyTime);
    logger.debug('prepareTime is ', readyTime);
    logger.debug('startTime is ', startTime);
    logger.debug('endTime is ', endTime);
    logger.debug('deadTime is ', deadTime);
  },
  _getNowStatus(time) {
    if (time < this.readyTime) return 'idle';
    if (time < this.prepareTime) return 'ready';
    if (time < this.startTime) return 'prepare';
    if (time < this.deadTime) return 'start';
    return 'ending';
  },
  _timeTick(currentTime) {
    const currentStatus = this._getNowStatus(currentTime);
    if (this.getStatus() !== currentStatus) {
      this.setStatus(currentStatus);
    }
  },
  setNowStatus() {
    this._status = this._getNowStatus(Date.now());
    logger.debug('Now Time is', Date.now(), 'Game status is', this._status);
  },
  startScheduler() {
    this._scheduleTimer = lt.setInterval(() => {
      this._timeTick(Date.now());
    }, 500);
  },
  getStartTime() {
    return this.startTime;
  },
  getPrepareSeconds() {
    return this.prepareSeconds;
  },
};

module.exports = GameSchedulerProto;
