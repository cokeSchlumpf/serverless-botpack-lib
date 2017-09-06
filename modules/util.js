const _ = require('lodash');
const Validator = require('better-validator');

const defaultErrorHandler = (error) => {
  if (_.get(error, 'error.message')) {
    return Promise.resolve({
      statusCode: _.get(error, 'statusCode', 500),
      error
    });
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

      return validate(validator);
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

          return validate(validator);
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
  return {
    defaultErrorHandler,
    validate,
    validatePayload
  }
};