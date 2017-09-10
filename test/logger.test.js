const _ = require('lodash');
const chai = require('chai');
const requireMock = require('mock-require');
const sinon = require('sinon');

describe('logger', () => {
  it('sends a log message to the logger action if the log level is equal or lower of the messages log level', () => {
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
      logger: {
        level: 'DEBUG'
      },
      openwhisk: {
        package: 'testpackage'
      }
    };

    return requireMock
      .reRequire('../index')({ config })
      .log.debug('Hello World!')
      .then(result => {
        chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/core-logger');
        chai.expect(invokeStub.getCall(0).args[0].params.message).to.equal('Hello World!');
        chai.expect(invokeStub.getCall(0).args[0].params.level).to.equal('DEBUG');
      });
  });

  it('does not send the message if the log level is configured to be below the messages level', () => {
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
      logger: {
        level: 'WARN'
      },
      openwhisk: {
        package: 'testpackage'
      }
    };

    return requireMock
      .reRequire('../index')({ config })
      .log.debug('Hello World!')
      .then(result => {
        chai.expect(invokeStub.callCount).to.equal(0);
      });
  });

  it('does call a function if it is passed as a message argument, for complex computations', () => {
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
      logger: {
        level: 'WARN'
      },
      openwhisk: {
        package: 'testpackage'
      }
    };

    const messageStub = sinon.stub().returns('foo');

    return requireMock
      .reRequire('../index')({ config })
      .log.error(messageStub)
      .then(result => {
        chai.expect(invokeStub.callCount).to.equal(1);
        chai.expect(messageStub.callCount).to.equal(1);
        chai.expect(invokeStub.getCall(0).args[0].params.message).to.equal('foo');
      });
  });

  it('does not execute the message function if the log level is configured to be below the messages level', () => {
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
      logger: {
        level: 'WARN'
      },
      openwhisk: {
        package: 'testpackage'
      }
    };

    const messageStub = sinon.stub().returns('foo');

    return requireMock
      .reRequire('../index')({ config })
      .log.debug(messageStub)
      .then(result => {
        chai.expect(invokeStub.callCount).to.equal(0);
        chai.expect(messageStub.callCount).to.equal(0);
      });
  });
});