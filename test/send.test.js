const _ = require('lodash');
const chai = require('chai');
const requireMock = require('mock-require');
const sinon = require('sinon');

describe('send', () => {
  it('calls the core-output action to send a message', () => {
    // create stubs for actual functions
    const invokeStub = sinon.stub()
      .returns(Promise.resolve({
        statusCode: 200,
        result: {
          foo: 'bar - new payload'
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
      logger: {
        level: 'DEBUG'
      },
      openwhisk: {
        package: 'testpackage'
      }
    };

    const payload = {
      input: {
        channel: 'test',
        user: '1234',
        message: 'Hello you!'
      },
      conversationcontext: {
        user: {
          id: '1234',
          test_id: 'abcd'
        }
      }
    }

    return requireMock
      .reRequire('../index')({ config, payload })
      .send('#hello', { foo: 'bar' }, { test: 'bla' })
      .then(result => {

        chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/core-output');
        chai.expect(invokeStub.getCall(0).args[0].params.intent).to.equal('#hello');
        chai.expect(invokeStub.getCall(0).args[0].params.context.foo).to.equal('bar');
        chai.expect(invokeStub.getCall(0).args[0].params.payload.input.user).to.equal('1234');

        chai.expect(result.foo).to.equal('bar - new payload');
      });
  });
});