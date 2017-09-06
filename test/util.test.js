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
        .reRequire('../index')({ __ow_method: 'get', __ow_path: '/', config })
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
})