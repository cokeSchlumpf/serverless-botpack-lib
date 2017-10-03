const _ = require('lodash');

module.exports = (params, ow) => {
  return {
    callByName: (service_name) => {
      const invokeParams = {
        name: `${params.config.openwhisk.package}/middleware-wcs`,
        blocking: true,
        result: true,
        params: {
          config: params.config,
          payload: params.payload,
          workspace: _.get(params, `config.conversation.workspaces.${service_name}`),
          contextpath: `wcs__${service_name}`,
          messagepath: `context.wcs__${service_name}.message`
        }
      }

      return ow.actions.invoke(invokeParams).then(result => {
        if (result.statusCode === 200) {
          _.set(params, `payload.conversationcontext.wcs__${service_name}`, _.get(result, `payload.conversationcontext.wcs__${service_name}`));
          _.set(params, `payload.context.wcs__${service_name}`, _.get(result, `payload.context.wcs__${service_name}`));
          _.set(params, `payload.context.wcs__${service_name}.message`, _.trim(_.get(result, `payload.context.wcs__${service_name}.message`)));
          
          return Promise.resolve(_.get(params, `payload.context.wcs__${service_name}.message`));
        } else {
          // TODO: Improve error handling
          return Promise.reject(result);
        }
      });
    }
  }
}