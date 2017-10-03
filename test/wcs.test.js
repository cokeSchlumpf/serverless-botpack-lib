const _ = require('lodash');
const chai = require('chai');
const requireMock = require('mock-require');
const sinon = require('sinon');

describe('callByName', () => {
  it('calls the middleware-wcs action for a named specific instance', () => {
    const invokeStub = sinon.stub()
      .returns(Promise.resolve({
        statusCode: 200,
        payload: {
          context: {
            wcs__test_service: {
              lorem: 'ipsum',
              message: 'Hello World'
            }
          },
          conversationcontext: {
            wcs__test_service: {
              foo: 'bar'
            }
          }
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
      conversation: {
        workspaces: {
          test_service: 'test-workspace'
        }
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
      .wcs.callByName('test_service')
      .then(message => {
        chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/middleware-wcs');
        chai.expect(invokeStub.getCall(0).args[0].params.workspace).to.equal('test-workspace');
        chai.expect(invokeStub.getCall(0).args[0].params.contextpath).to.equal('wcs__test_service');
        chai.expect(invokeStub.getCall(0).args[0].params.messagepath).to.equal('context.wcs__test_service.message');

        chai.expect(payload.context.wcs__test_service.message).to.equal('Hello World');
        chai.expect(payload.context.wcs__test_service.lorem).to.equal('ipsum');
        chai.expect(payload.conversationcontext.wcs__test_service.foo).to.equal('bar');

        chai.expect(message).to.equal('Hello World');
      });
  });
});