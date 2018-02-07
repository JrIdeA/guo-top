const path = require('path');

module.exports = {
  game: {
    startTime: '2018-02-08 18:30:00',
    prepareSeconds: 3,
    readySeconds: 120,
    playtimeSeconds: 600,
    allowOvertimeSeconds: 300,
  },
  resultLogPath: path.join(__dirname, '../data/results/results.json'),
  port: 8000,
};
