const _ = require('lodash');
const ms = require('ms');
const logger = require('./logger');
const Validator = require('better-validator');

const defaultAsyncResultHandler = (log) => (result) => {
  const statusCode = _.get(result, 'statusCode');

  if (statusCode === 200) {
    return log.debug(result).then(() => result);
  } else if (!statusCode) {
    return log.error({
      statusCode: 500,
      error: 'Action result is not valid',
      parameters: {
        result
      }
    }).then(() => result);
  } else {
    return log.error(result).then(() => result);
  }
}

const defaultErrorHandler = (error) => {
  console.log(error);
  
  if (_.get(error, 'error.message') && _.get(error, 'statusCode')) {
    return Promise.resolve(error);
  } else {
    return Promise.resolve({
      statusCode: 500,
      error: {
        message: 'Internal Server Error',
        cause: error
      }
    })
  }
}

const dateTime = (params) => {
  return {
    now: (offset) => {
      const timezoneOffset = offset ? offset : _.get(params, 'payload.conversationcontext.user.timezone', 0);
      const d = new Date();
      const utc = d.getTime() - (d.getTimezoneOffset() * 60000);
      const nd = new Date(utc + (3600000 * timezoneOffset));
      return _.round(nd.getTime() / 1000);
    },
    olderThan: (timestamp, duration, offset) => {
      const durationMs = _.round(ms(duration) / 1000);
      const now = dateTime(params).now(offset);
      return now - durationMs > timestamp;
    }
  };
}

const validate = (validator, f) => {
  const errors = validator.run();

  if (_.size(errors) > 0) {
    return Promise.reject({
      statusCode: 400,
      error: {
        message: _.isString(f) && f || 'Validation failed',
        cause: errors,
      }
    });
  } else if (_.isFunction(f)) {
    return Promise.resolve(f());
  } else {
    return Promise.resolve();
  }
}

const validatePayload = (payload, state) => {
  const validator = new Validator();

  switch (state) {
    case 'INPUT':
      validator(payload).required().isObject(obj => {
        obj('id').required().isString();
        obj('input').required().isObject(obj => {
          obj('channel').required().isString();
          obj('user').required().isString();
          obj('message').required();
        });
      });

      return validate(validator).then(() => payload);
    case 'MIDDLEWARE':
      return validatePayload(payload, 'INPUT')
        .then(() => {
          validator(payload).required().isObject(obj => {
            obj('conversationcontext').required().isObject(obj => {
              obj('user').required().isObject(obj => {
                obj('_id').required().isString();
                obj(`${_.get(payload, 'input.channel')}_id`).required().isString();
              });
            });
            obj('messagecontext').isObject();
          });

          return validate(validator).then(() => payload);
        });
    case 'OUTPUT':
      validator(payload).required().isObject(obj => {
        obj('id').required().isString();
        obj('conversationcontext').required().isObject(obj => {
          obj('user').required().isObject(obj => {
            obj('_id').required().isString();
            obj(`${_.get(payload, 'output.channel')}_id`).required().isString();
            obj('locale').isString();
          })
        });
        obj('output').required().isObject(obj => {
          obj('channel').required().isString();
          obj('user').required().isString();
          obj('intent').required().isString();
          obj('locale').isString();
          obj('context').isObject();
          obj('message').isString();
        });
      });

      return validate(validator).then(() => payload);
    case 'STORE':
      validator(payload).required().isObject(obj => {
        obj('id').required().isString();
        obj('conversationcontext').required().isObject(obj => {
          obj('user').required().isObject(obj => {
            obj('_id').required().isString();
          })
        });
      });

      return validate(validator).then(() => payload);
    default:
      return Promise.reject({
        statusCode: 400,
        error: {
          message: `Invalid state '${state}', valid states are 'INPUT', 'MIDDLEWARE'.`
        }
      });
  }
}

module.exports = (params, ow) => {
  const log = logger(params, ow);

  return {
    dateTime: dateTime(params),
    defaultAsyncResultHandler: defaultAsyncResultHandler(log),
    defaultErrorHandler,
    validate,
    validatePayload
  }
};