const _ = require('lodash');

const LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

module.exports = (params, ow) => {
  const configLogLevel = _.get(params, 'config.logger.level', 'INFO');

  const log = (level) => (message) => {
    if (_.indexOf(LEVELS, level) >= _.indexOf(LEVELS, configLogLevel)) {
      const logmessage = _.isString(message) ? message : _.isFunction(message) ? message() : JSON.stringify(message, null, 2);

      return ow.actions.invoke({
        name: `${_.get(params, 'config.openwhisk.package')}/logger`,
        params: {
          level: level,
          message: logmessage,
          payload: _.get(params, 'payload', {})
        }
      });
    } else {
      return Promise.resolve({
        statusCode: 200,
        message: `Message log level '${level}' below configured log level '${configLogLevel}'.`
      });
    }
  }

  return _
    .chain(LEVELS)
    .map(level => [ level.toLowerCase(), log(level) ])
    .fromPairs()
    .value();
};