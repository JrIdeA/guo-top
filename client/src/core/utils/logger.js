let logger = {
  log: () => void 0,
  error: () => void 0,
};

if (process.env.NODE_ENV !== 'production') {
  logger = {
    log: console.log,
    error: console.error,
  };
}

export default logger;