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
            cause: { }
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