var fs = require('fs'),
    events = require('events'),
    path = require('path');

var lazydb = exports.lazydb = function (filename) {
    if (!(this instanceof lazydb)) return new lazydb(filename);
    var self = this;
    self.filename = filename;
    self.data = {};
    self.queue = [];
    self.eventQueue = new events.EventEmitter();
    self.writeStream = fs.createWriteStream(self.filename, { flags: 'a' });

    function flushQueue() {
        if (self.queue.length === 0) return;
        var allData = self.queue.join('');
        self.queue = [];
        var thisBuf = new Buffer(Buffer.byteLength(allData));
        thisBuf.write(allData);
        return self.writeStream.write(thisBuf);
    }

    self.eventQueue.on('write', function (key, data) {
        var thisObject = {};
        if (data === undefined) data = '';
        thisObject[key] = data;
        var thisLine = JSON.stringify(thisObject) + '\n';
        self.queue.push(thisLine);
        process.nextTick(function () { 
            flushQueue(); 
        });
    });

    function parseFile() {
        fs.readFileSync(self.filename).toString().split('\n').forEach(function (line) {
            if (line.length > 0) {
                var thisLine = JSON.parse(line);
                for (var index in thisLine) {
                    if (thisLine.hasOwnProperty(index)) {
                        if (thisLine[index] !== '') self.data[index] = thisLine[index];
                    }
                }
            }
        });
    }

    path.exists(self.filename, function (exists) {
        if (!exists) {
            fs.open(self.filename, 'a', function (err, fd) {
                parseFile();
            });
        } else {
            parseFile();
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
            Object.keys(self.data[index]).forEach(function (name) {
                Object.keys(query).forEach(function (qname) {
                    if (self.data[index][name] === query[qname]) results[index] = self.data[index];
                });
            });
        }
    }
    callback(null, results);
};

lazydb.prototype.findOne = function (query, callback) {
    var self = this,
        result = {},
        id = '';

    for (var index in self.data) {
        if (self.data.hasOwnProperty(index)) {
            Object.keys(self.data[index]).forEach(function (name) {
                Object.keys(query).forEach(function (qname) {
                    if (self.data[index][name] === query[qname]) {
                        result = self.data[index];
                        id = index;
                    }
                });
            });
        }
    }
    callback(null, id, result);
};

module.exports = lazydb;
