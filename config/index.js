const path = require('path');

module.exports = {
  game: {
    startTime: '2018-02-05 20:16:00',
    prepareSeconds: 3,
    readySeconds: 60,
    playtimeSeconds: 60,
    allowOvertimeSeconds: 60,
  },
  resultLogPath: path.join(__dirname, '../data/results/results.json'),
  port: 8000,
};
