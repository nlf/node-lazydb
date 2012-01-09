var fs = require('fs'),
    events = require('events');

var lazydb = exports.lazydb = function (filename) {
    if (!(this instanceof lazydb)) return new lazydb(filename);
    var self = this;
    self.filename = filename;
    self.data = {};
    self.queue = [];
    self.eventQueue = new events.EventEmitter();
    self.writeStream = fs.createWriteStream(self.filename, { flags: 'a' });

    self.eventQueue.on('write', function (key, data) {
        var thisObject = {};
        if (data === undefined) data = '';
        thisObject[key] = data;
        var thisLine = JSON.stringify(thisObject) + '\n';
        self.writeStream.write(thisLine);
    });

    fs.readFileSync(self.filename).toString().split('\n').forEach( function(line) {
        if (line.length > 0) {
            var thisLine = JSON.parse(line);
            for (var index in thisLine) {
                if (thisLine.hasOwnProperty(index)) {
                    if (thisLine.index !== '') self.data[index] = thisLine.index;
                }
            }
        }
    });
};

lazydb.prototype.set = function (key, data, callback) {
    if (typeof data !== 'object') {
        callback(new Error('data must be object'));
    } else {
        this.data[key] = data;
        this.eventQueue.emit('write', key, data);
        callback(null);
    }
};

lazydb.prototype.get = function (key, callback) {
    if (this.data[key] === undefined) {
        callback(new Error('key not found'), null);
    } else {
        callback(null, this.data[key]);
    }
};

lazydb.prototype.del = function (key, callback) {
    if (this.data[key] === undefined) {
        callback(new Error('key not found'));
    } else {
        delete this.data[key];
        this.eventQueue.emit('write', key, undefined);
        callback(null);
    }
};

lazydb.prototype.getAll = function (callback) {
    var allData = {};
    for (var index in this.data) {
        if (this.data.hasOwnProperty(index)) {
            if (this.data[index] !== undefined) allData[index] = this.data[index];
        }
    }
    callback(allData);
};

lazydb.prototype.find = function (query, callback) {
    var self = this,
        results = {};
    
    for (var index in self.data) {
        if (self.data.hasOwnProperty(index)) {
            Object.keys(self.data).forEach( function (name) {
                Object.keys(query).forEach( function (qname) {
                    if (self.data[index][name] === query[qname]) results[index] = self.data[index];
                });
            });
        }
    }
    callback(null, results);
};

module.exports = lazydb;
