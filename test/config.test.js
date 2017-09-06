const _ = require('lodash');
const chai = require('chai');
const requireMock = require('mock-require');
const sinon = require('sinon');

describe('config', () => {
  describe('config.get', () => {
    it('gets a configuration value from the configuration first', () => {
      // mock openwhisk action calls to return successful results
      requireMock('openwhisk', () => ({
        actions: {}
      }));

      // sample configuration used for the test
      const config = {
        key: 'value',
        openwhisk: {
          package: 'testpackage'
        }
      }

      return requireMock
        .reRequire('../index')({ __ow_method: 'get', __ow_path: '/', config })
        .config.get('key', 'defaultValue')
        .then(result => {
          chai.expect(result).to.equal('value');
        });
    });

    it('gets a configuration value from the database if no configuration is included in the environment', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200,
          result: [{
            _id: '1234',
            type: 'configuration',
            tag: 'config/key',
            value: 'value'
          }]
        }));

      // mock openwhisk action calls to return successful results
      requireMock('openwhisk', () => ({
        actions: {
          invoke: invokeStub
        }
      }));

      // sample configuration used for the test
      const config = {
        openwhisk: {
          package: 'testpackage'
        }
      }

      return requireMock
        .reRequire('../index')({ __ow_method: 'get', __ow_path: '/', config })
        .config.get('key', 'defaultValue')
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.type).to.equal('configuration');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.tag).to.equal('config/key');

          chai.expect(result).to.equal('value');
        });
    });

    it('returns the default value if now configuration is found', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200,
          result: []
        }));

      // mock openwhisk action calls to return successful results
      requireMock('openwhisk', () => ({
        actions: {
          invoke: invokeStub
        }
      }));

      // sample configuration used for the test
      const config = {
        openwhisk: {
          package: 'testpackage'
        }
      }

      return requireMock
        .reRequire('../index')({ __ow_method: 'get', __ow_path: '/', config })
        .config.get('key', 'defaultValue')
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.type).to.equal('configuration');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.tag).to.equal('config/key');

          chai.expect(result).to.equal('defaultValue');
        });
    });

    it('rejects the config value request if no default is defined', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200,
          result: []
        }));

      // mock openwhisk action calls to return successful results
      requireMock('openwhisk', () => ({
        actions: {
          invoke: invokeStub
        }
      }));

      // sample configuration used for the test
      const config = {
        openwhisk: {
          package: 'testpackage'
        }
      }

      return requireMock
        .reRequire('../index')({ __ow_method: 'get', __ow_path: '/', config })
        .config.get('key', 'defaultValue')
        .then(result => {
          chai.expect(true).to.be.false;
        })
        .catch(error => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.type).to.equal('configuration');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.tag).to.equal('config/key');

          chai.expect(error.message).to.exist;
        });
    });
  });

  describe('config.set', () => {
    it('saves a configuration value to the database, updates when it exists', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .onCall(0).returns(Promise.resolve({
          statusCode: 200,
          result: [
            {
              _id: '1234',
              type: 'configuration',
              tag: 'config/key',
              value: 'value'
            }
          ]
        }))
        .onCall(1).returns(Promise.resolve({
          statusCode: 200,
          result: {
            _id: '1234',
            type: 'configuration',
            tag: 'config/key',
            value: 'value_new'
          }
        }));

      // mock openwhisk action calls to return successful results
      requireMock('openwhisk', () => ({
        actions: {
          invoke: invokeStub
        }
      }));

      // sample configuration used for the test
      const config = {
        openwhisk: {
          package: 'testpackage'
        }
      }

      return requireMock
        .reRequire('../index')({ __ow_method: 'get', __ow_path: '/', config })
        .config.set('key', 'value_new')
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('read');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.type).to.equal('configuration');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.tag).to.equal('config/key');

          chai.expect(invokeStub.getCall(1).args[0].params.operation).to.equal('update');
          chai.expect(invokeStub.getCall(1).args[0].params.doc._id).to.equal('1234');
          chai.expect(invokeStub.getCall(1).args[0].params.doc.type).to.equal('configuration');
          chai.expect(invokeStub.getCall(1).args[0].params.doc.tag).to.equal('config/key');
          chai.expect(invokeStub.getCall(1).args[0].params.doc.value).to.equal('value_new');

          chai.expect(result.value).to.equal('value_new');
        });
    });

    it('saves a configuration value to the database, creates a new if value does not exist', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .onCall(0).returns(Promise.resolve({
          statusCode: 200,
          result: []
        }))
        .onCall(1).returns(Promise.resolve({
          statusCode: 200,
          result: {
            _id: '1234',
            type: 'configuration',
            tag: 'config/key',
            value: 'value_new'
          }
        }));

      // mock openwhisk action calls to return successful results
      requireMock('openwhisk', () => ({
        actions: {
          invoke: invokeStub
        }
      }));

      // sample configuration used for the test
      const config = {
        openwhisk: {
          package: 'testpackage'
        }
      }

      return requireMock
        .reRequire('../index')({ __ow_method: 'get', __ow_path: '/', config })
        .config.set('key', 'value_new')
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('read');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.type).to.equal('configuration');
          chai.expect(invokeStub.getCall(0).args[0].params.selector.tag).to.equal('config/key');

          chai.expect(invokeStub.getCall(1).args[0].params.operation).to.equal('create');
          chai.expect(invokeStub.getCall(1).args[0].params.doc.type).to.equal('configuration');
          chai.expect(invokeStub.getCall(1).args[0].params.doc.tag).to.equal('config/key');
          chai.expect(invokeStub.getCall(1).args[0].params.doc.value).to.equal('value_new');

          chai.expect(result.value).to.equal('value_new');
        });
    });
  });
});