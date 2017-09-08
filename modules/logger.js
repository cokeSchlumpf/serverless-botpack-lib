const _ = require('lodash');
const winston = require('winston');

const LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

module.exports = (params, ow) => {
  const configLogLevel = _.get(params, 'config.logger.level', 'INFO');

  const log = (level) => (message) => {
    if (_.indexOf(LEVELS, level) >= _.indexOf(LEVELS, configLogLevel)) {
      const fetchMessage = (message) => {
        if (_.isFunction(message)) {
          return fetchMessage(message());
        } else if (_.isString(message)) {
          return message;
        } else {
          return JSON.stringify(message);
        }
      };

      const logmessage = fetchMessage(message);

      winston[level.toLowerCase()](logmessage);

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