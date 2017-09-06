const _ = require('lodash');
const chai = require('chai');
const requireMock = require('mock-require');
const sinon = require('sinon');

describe('util', () => {
  describe('util.validate', () => {
    it('executes validate on better-validator Validator instances', () => {
      const runStub = sinon.stub().returns([]);

      const validatorMock = {
        run: runStub
      }

      // sample configuration used for the test
      const config = {}

      return requireMock
        .reRequire('../index')({ __ow_method: 'get', __ow_path: '/', config })
        .util.validate(validatorMock, () => 3)
        .then(result => {
          chai.expect(result).to.equal(3);
        });
    });

    it('executes validate on better-validator Validator instances and rejects promise in case of an error', () => {
      const runStub = sinon.stub().returns([{ error: 'foo', path: 'foo' }]);

      const validatorMock = {
        run: runStub
      }

      // sample configuration used for the test
      const config = {}

      return requireMock
        .reRequire('../index')({ config })
        .util.validate(validatorMock, () => 3)
        .then(result => {
          chai.expect(true).to.be.false;
        })
        .catch(error => {
          chai.expect(error.error).to.have.property('message');
          chai.expect(error.error).to.have.property('cause');
          chai.expect(error.error.cause[0].error).to.equal('foo');
        });
    });
  });

  describe('util.validatePayload', () => {
    it('validates the payload in the state "INPUT"', () => {
      // sample configuration used for the test
      const config = {}

      return requireMock
        .reRequire('../index')({ config })
        .util.validatePayload({
          id: 'abcd',
          input: {
            channel: 'facebook',
            user: 'user',
            message: 'foo'
          }
        }, 'INPUT')
        .then(result => {
          chai.expect(true).to.be.true;
        })
        .catch(error => {
          chai.expect(true).to.be.false;
        });
    });

    it('validates the payload in the state "INPUT" and rejects the promise if it contains errors', () => {
      // sample configuration used for the test
      const config = {}

      return requireMock
        .reRequire('../index')({ config })
        .util.validatePayload({
          id: 'abcd',
          input: {
            channel: 'facebook',
            user: 'user',
            message: 'foo'
          }
        }, 'INPUT')
        .then(result => {
          chai.expect(true).to.be.false;
        })
        .catch(error => {
          chai.expect(true).to.be.true;
        });
    });

    it('validates the payload in the state "MIDDLEWARE"', () => {
      // sample configuration used for the test
      const config = {}

      return requireMock
        .reRequire('../index')({ config })
        .util.validatePayload({
          id: 'abcd',
          input: {
            channel: 'facebook',
            user: 'user',
            message: 'foo'
          },
          'conversationcontext': {
            user: {
              id: '12345',
              facebook_id: '12345678'
            }
          }
        }, 'MIDDLEWARE')
        .then(result => {
          chai.expect(true).to.be.true;
        })
        .catch(error => {
          chai.expect(true).to.be.false;
        });
    });

    it('validates the payload in the state "MIDDLEWARE" and rejects the promise if it contains errors', () => {
      // sample configuration used for the test
      const config = {}

      return requireMock
        .reRequire('../index')({ config })
        .util.validatePayload({
          id: 'abcd',
          input: {
            channel: 'facebook',
            user: 'user',
            message: 'foo'
          }
        }, 'MIDDLEWARE')
        .then(result => {
          chai.expect(true).to.be.false;
        })
        .catch(error => {
          chai.expect(true).to.be.true;
        });
    });

    it('rejects if the state is not valud', () => {
      // sample configuration used for the test
      const config = {}

      return requireMock
        .reRequire('../index')({ config })
        .util.validatePayload({
          id: 'abcd',
          input: {
            channel: 'facebook',
            user: 'user',
            message: 'foo'
          }
        }, 'FOO')
        .then(result => {
          chai.expect(true).to.be.false;
        })
        .catch(error => {
          chai.expect(true).to.be.true;
        });
    });
  });

  describe('util.defaultAsyncResultHandler', () => {
    it('it logs the result of an asynchronuous action as an error if there is no statusCode', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve());

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

      requireMock.reRequire('openwhisk');

      return requireMock
        .reRequire('../index')({ config })
        .util.defaultAsyncResultHandler(["1", "2", "3"])
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/logger');
          chai.expect(invokeStub.getCall(0).args[0].params.message).to.equal(JSON.stringify({
            statusCode: 500,
            error: "Action result is not valid",
            parameters: {
              result: ["1", "2", "3"]
            }
          }, null, 2));
          chai.expect(invokeStub.getCall(0).args[0].params.level).to.equal('ERROR');
        });
    });

    it('logs the result of an asynchronuous action as debug message', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve());
  
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
  
      requireMock.reRequire('openwhisk');
  
      return requireMock
        .reRequire('../index')({ config })
        .util.defaultAsyncResultHandler({
          statusCode: 200,
          result: ["1", "2", "3"]
        })
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/logger');
          chai.expect(invokeStub.getCall(0).args[0].params.message).to.equal(JSON.stringify({
            statusCode: 200,
            result: ["1", "2", "3"]
          }, null, 2));
          chai.expect(invokeStub.getCall(0).args[0].params.level).to.equal('DEBUG');
        });
    });

    it('logs an error if an error is the result', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve());
  
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
  
      requireMock.reRequire('openwhisk');
  
      return requireMock
        .reRequire('../index')({ config })
        .util.defaultAsyncResultHandler({
          statusCode: 400,
          error: {
            message: 'There was an error;'
          }
        })
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/logger');
          chai.expect(invokeStub.getCall(0).args[0].params.message).to.equal(JSON.stringify({
            statusCode: 400,
            error: {
              message: 'There was an error;'
            }
          }, null, 2));
          chai.expect(invokeStub.getCall(0).args[0].params.level).to.equal('ERROR');
        });
    });
  });

  describe('util.defaultErrorHandler', () => {
    it('forwards an existing valid error', () => {
      const config = {}

      return requireMock
        .reRequire('../index')({ config })
        .util.defaultErrorHandler({
          statusCode: 300,
          error: {
            message: 'foo, bar',
            parameters: {
              'foo': 'bar'
            },
            cause: {}
          }
        })
        .then(result => {
          chai.expect(result.statusCode).to.equal(300);
          chai.expect(result.error.message).to.equal('foo, bar');
          chai.expect(result.error.parameters.foo).to.equal('bar');
        });
    });

    it('forwards creates a new error message if it is not a valid error object', () => {
      const config = {}

      return requireMock
        .reRequire('../index')({ config })
        .util.defaultErrorHandler({
          message: 'bla bla bla'
        })
        .then(result => {
          chai.expect(result.statusCode).to.equal(500);
          chai.expect(result.error.message).to.equal('Internal Server Error');
          chai.expect(result.error.cause).to.exist;
        });
    })
  });
})