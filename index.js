const lodash = require('lodash');
const openwhisk = require('openwhisk');

const config = require('./modules/config');
const context = require('./modules/context');
const db = require('./modules/db');
const logger = require('./modules/logger');
const util = require('./modules/util');

module.exports = (params) => {
  const ow = openwhisk();

  return {
    config: config(params, ow),
    context: context(params, ow),
    db: db(params, ow),
    log: logger(params, ow),
    util: util(params, ow)
  }
}