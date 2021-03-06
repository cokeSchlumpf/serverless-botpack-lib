const _ = require('lodash');

module.exports = (params, ow) => {
  return {
    persist: (payload, force = false) => {
      const invokeParams = {
        name: `${_.get(params.config, 'openwhisk.package')}/core-contextpersist`,
        blocking: true,
        result: true,
        params: { payload, force }
      }

      return ow.actions.invoke(invokeParams)
        .then(result => {
          if (result.statusCode !== 200) {
            return Promise.reject({
              statusCode: 503,
              error: {
                message: 'The core-persistcontext action did not respond with a valid result.',
                parameters: {
                  result
                }
              }
            })
          } else {
            return result.result;
          }
        });
    },

    load: (payload, user) => {
      const invokeParams = {
        name: `${_.get(params.config, 'openwhisk.package')}/core-contextload`,
        blocking: true,
        result: true,
        params: { payload, user }
      }

      return ow.actions.invoke(invokeParams)
        .then(result => {
          if (result.statusCode !== 200) {
            return Promise.reject({
              statusCode: 503,
              error: {
                message: 'The core-loadcontext action did not respond with a valid result.',
                parameters: {
                  result
                }
              }
            })
          } else {
            return result.result;
          }
        });
    }
  }
}