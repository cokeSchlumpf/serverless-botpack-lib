const _ = require('lodash');
const Validator = require('better-validator');
const logger = require('./logger');

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

const validate = (validator, f) => {
  const errors = validator.run();

  if (_.size(errors) > 0) {
    return Promise.reject({
      statusCode: 400,
      error: {
        message: 'Action parameters are invalid',
        cause: errors
      }
    });
  } else if (_.isFunction(f)) {
    return Promise.resolve(f());
  } else {
    return Promise.resolve();
  }
}

const validatePayload = (payload, state) => {
  switch (state) {
    case 'INPUT':
      const validator = new Validator();

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
          const validator = new Validator();
          validator(payload).required().isObject(obj => {
            obj('conversationcontext').required().isObject(obj => {
              obj('user').required().isObject(obj => {
                obj('id').required().isString();
                obj(`${payload.input.channel}_id`).required().isString();
              });
            });
            obj('messagecontext').isObject();
          });

          return validate(validator).then(() => payload);
        });
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
    defaultAsyncResultHandler: defaultAsyncResultHandler(log),
    defaultErrorHandler,
    validate,
    validatePayload
  }
};