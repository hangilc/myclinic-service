"use strict";

var mysql = require("mysql");

var pool;
var intraClinicPool;

exports.init = function(config){
	pool = mysql.createPool(config);
	intraClinicPool = mysql.createPool(assign({}, config, { database: "intraclinic" }))
};

exports.getConnection = function(cb){
	pool.getConnection(cb);
};

exports.disposeConnection = function(conn){
	conn.release();
};

exports.getIntraClinicConnection = function(cb){
	intraClinicPool.getConnection(cb);
};

exports.disposeIntraClinicConnection = function(conn){
	conn.release();
};

function assign(orig){
	for(var i=1;i<arguments.length;i++){
		var ext = arguments[i];
		for(var key in ext){
			orig[key] = ext[key];
		}
	}
	return orig;
}