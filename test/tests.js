var testdb = require('../')('test.db');

exports.createDB = function (test) {
    test.notEqual(testdb, null);
    test.done();
};

exports.testSet = function (test) {
    testdb.set('test', { test: 'data' }, function (err) {
        test.equal(err, null);
        test.done();
    });
};

exports.testGet = function (test) {
    testdb.get('test', function (err, data) {
        test.equal(err, null);
        test.equal(data.test, 'data');
        test.done();
    });
};

exports.testGetAll = function (test) {
    testdb.set('test2', { test: 'data' }, function (err) {
        testdb.getAll( function (results) {
            test.notEqual(results, null);
            var count = Object.keys(results).length;
            test.equal(count, 2);
            test.done();
        });
    });
};

exports.testDel = function (test) {
    testdb.del('test2', function (err) {
        test.equal(err, null);
        testdb.get('test2', function (err, data) {
            test.notEqual(err, null);
            test.done();
        });
    });
};

exports.testFind = function (test) {
    testdb.find({ test: 'data' }, function (err, results) {
        test.equal(err, null);
        test.equal(Object.keys(results).length, 1);
        testdb.set('test2', { test: 'data' }, function (err) {
            testdb.find({ test: 'data' }, function (err, results) {
                test.equal(err, null);
                test.equal(Object.keys(results).length, 2);
                test.done();
            });
        });
    });
};
