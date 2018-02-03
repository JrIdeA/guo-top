exports.log = console.log;
exports.error = console.error;
exports.debug = process.env.NODE_ENV === 'production' ?
  (() => undefined) : console.log.bind(console, '[DEBUG]');
