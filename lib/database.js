"use strict";

var mysql = require("mysql");

var pool = 

exports.init = function(config){
	pool = mysql.createPool(config);
};

exports.getConnection = function(cb){
	pool.getConnection(cb);
};

exports.disposeConnection = function(conn){
	conn.release();
};