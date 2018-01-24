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
      playtimeSeconds,
      allowOvertimeSeconds,
    } = defaults(this.config, {
      startTime: '',
      readySeconds: 600,
      playtimeSeconds: 60,
      allowOvertimeSeconds: 30,
    });

    const startTime = parseStartTime(startTimeStr);
    const readyTime = startTime - (readySeconds * 1000);
    const endTime = startTime + (playtimeSeconds * 1000);
    const deadTime = endTime + (allowOvertimeSeconds * 1000);
    invariant(startTime, `game startTime invalid, parsed: ${startTime}`);
    invariant(deadTime > startTime, `game deadTime should after then startTime, deadTime: ${deadTime}, startTime: ${startTime}`);

    this.playtimeSeconds = playtimeSeconds;
    this.readyTime = readyTime;
    this.startTime = startTime;
    this.deadTime = deadTime;
    this.validStartime = startTime > 0;

    logger.debug('readyTime is ', readyTime);
    logger.debug('startTime is ', startTime);
    logger.debug('endTime is ', endTime);
    logger.debug('deadTime is ', deadTime);
  },
  _getNowStatus(time) {
    if (time < this.readyTime) return 'idle';
    if (time < this.startTime) return 'ready';
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
    this.setStatusWithoutEmitEvent(this._getNowStatus(Date.now()));

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
  getPlaytimeSeconds() {
    return this.playtimeSeconds;
  },
  getLeftStartTime() {
    return this.startTime - Date.now();
  },
  getLeftEndTime() {
    return Date.now() - this.endTime;
  },
};

module.exports = GameSchedulerProto;
