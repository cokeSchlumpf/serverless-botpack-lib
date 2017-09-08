const _ = require('lodash');
const chai = require('chai');
const requireMock = require('mock-require');
const sinon = require('sinon');

describe('db', () => {
  describe('db.create', () => {
    it('creates an object in the database and returns this object with its id', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 201,
          result: {
            _id: '1234',
            foo: 'bar'
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
        .db.create({ foo: 'bar' })
        .then(result => {
          chai.expect(result._id).to.equal('1234');
          chai.expect(result.foo).to.equal('bar');

          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.doc.foo).to.equal('bar');
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('create');
        })
    });

    it('rejects the promise if an error is returned', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 500,
          error: {
            message: 'sample error message',
            cause: {
              foo: 'bar'
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
        openwhisk: {
          package: 'testpackage'
        }
      }

      return requireMock
        .reRequire('../index')({ __ow_method: 'get', __ow_path: '/', config })
        .db.create({ foo: 'bar' })
        .then(result => {
          chai.expect(true).to.be.false;
        })
        .catch(error => {
          chai.expect(error.message).to.equal('sample error message');
          chai.expect(error.cause.foo).to.equal('bar');

          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.doc.foo).to.equal('bar');
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('create');
        });
    });
  });

  describe('db.read', () => {
    it('reads an object via the datastore openwhisk action with the given selector', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200,
          result: [{
            _id: '1234',
            foo: 'bar'
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
        .db.read({ foo: 'bar' })
        .then(result => {
          chai.expect(result[0]._id).to.equal('1234');
          chai.expect(result[0].foo).to.equal('bar');
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.id).to.be.undefined;
          chai.expect(invokeStub.getCall(0).args[0].params.selector.foo).to.equal('bar');
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('read');
        })
    });

    it('reads an object via the datastore openwhisk action with an id', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200,
          result: {
            _id: '1234',
            foo: 'bar'
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
        .db.read('1234')
        .then(result => {
          chai.expect(result._id).to.equal('1234');
          chai.expect(result.foo).to.equal('bar');
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.id).to.equal('1234');
          chai.expect(invokeStub.getCall(0).args[0].params.selector).to.be.undefined;
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('read');
        })
    });
  });

  describe('db.update', () => {
    it('updates an object in the database', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200,
          result: {
            _id: '1234',
            foo: 'bar'
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
        .db.update({ _id: '1234', foo: 'bar' })
        .then(result => {
          chai.expect(result._id).to.equal('1234');
          chai.expect(result.foo).to.equal('bar');

          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.doc.foo).to.equal('bar');
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('update');
        })
    });
  });

  describe('db.delete', () => {
    it('deletes an object by its id', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200
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
        .db.delete('1234')
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.id).to.equal('1234');
          chai.expect(invokeStub.getCall(0).args[0].params.rev).to.be.undefined;
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('delete');
        })
    });

    it('deletes an object by its id, also when passing whole object', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200
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
        .db.delete({
          _id: '1234'
        })
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.id).to.equal('1234');
          chai.expect(invokeStub.getCall(0).args[0].params.rev).to.be.undefined;
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('delete');
        })
    });

    it('deletes an object by its id and rev', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200
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
        .db.delete({
          _id: '1234',
          _rev: 'abcd'
        })
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.id).to.equal('1234');
          chai.expect(invokeStub.getCall(0).args[0].params.rev).to.equal('abcd');
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('delete');
        })
    });

    it('deletes an object by its id and rev with arguments', () => {
      // create stubs for actual functions
      const invokeStub = sinon.stub()
        .returns(Promise.resolve({
          statusCode: 200
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
        .db.delete('1234', 'abcd')
        .then(result => {
          chai.expect(invokeStub.getCall(0).args[0].name).to.equal('testpackage/datastore');
          chai.expect(invokeStub.getCall(0).args[0].params.id).to.equal('1234');
          chai.expect(invokeStub.getCall(0).args[0].params.rev).to.equal('abcd');
          chai.expect(invokeStub.getCall(0).args[0].params.operation).to.equal('delete');
        })
    });
  });
});