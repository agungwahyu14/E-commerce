export const logger = {
  log: (...args) => {
    if (__DEV__) {
      console.log('📘 [LOG]:', ...args);
    }
  },
  info: (...args) => {
    if (__DEV__) {
      console.info('📗 [INFO]:', ...args);
    }
  },
  warn: (...args) => {
    if (__DEV__) {
      console.warn('📙 [WARN]:', ...args);
    }
  },
  error: (...args) => {
    if (__DEV__) {
      console.error('📕 [ERROR]:', ...args);
    }
  },
};
