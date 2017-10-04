const _ = require('lodash');

module.exports = (params, ow) => {
  const sendText = (intent, context = {}, outputparams = {}) => {
    const invokeParams = {
      name: `${_.get(params.config, 'openwhisk.package')}/core-output`,
      blocking: true,
      result: true,
      params: _.assign({}, outputparams, { payload: params.payload, intent, context })
    }

    return ow.actions.invoke(invokeParams)
      .then(result => {
        if (result.statusCode !== 200) {
          return Promise.reject({
            statusCode: 503,
            error: {
              message: 'The core-output action did not respond with a valid result.',
              parameters: {
                result
              }
            }
          })
        } else {
          _.set(params, 'payload', result.result);
          return result.result;
        }
      });
  }

  const sendSignals = (signals, context = {}, outputparams = {}) => {
    return sendText(_.join(_.concat(signals, _.get(params, 'payload.context.signals', [])), ' '), context, outputparams);
  }

  return {
    signal: sendSignals,
    text: sendText
  }
}