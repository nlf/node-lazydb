node-lazydb
===========

A simple, lazy, json based data store for small projects. It's not fast, it's not horribly smart, but it just works™.

Creating a database
-------------------
	var lazydb = require('lazydb');
	var users = lazydb('users.db');

Setting a key
-------------
Saves an object to 'key'

	users.set('key', { data: 'contents' }, function (err) {
	  if (!err) console.log('hooray!');
	});

Getting a key
-------------
Gets the data associated with 'key' and returns the data object as data

	users.get('key', function (err, data) {
	  console.log(data.data); // 'contents'
	});

Querying
--------
Currently only supports one query per call.. returns a dictionary of findings

	users.find({ data: 'contents' }, function (err, results) {
      for (var index in results) {
        console.log(index, JSON.stringify(results[index]));
      }
	});

Getting all documents
---------------------
Returns a dictionary of all keys in the database

	users.getAll(function (results) {
      for (var index in results) {
        console.log(index, JSON.stringify(results[index]));
      }
	});
