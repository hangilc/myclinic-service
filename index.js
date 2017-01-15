"use strict";

var service = require("./lib/service");
var noDbService = require("./lib/no-db-service");
var MasterMap = require("./lib/master-map");
var NameMap = require("./lib/master-name");
var rcpt = require("./lib/rcpt");
var database = require("./lib/database");

exports.initApp = function(app, config){
	database.init(config.dbConfig);
	if( config.masterMap ){
		MasterMap.import(config.masterMap);
	}
	if( config.nameMap ){
		NameMap.import(config.nameMap);
	}
	if( config.houkatsuList ){
		rcpt.setHoukatsuList(config.houkatsuList);
	}
	app.use("/", function(req, res){
		app.disable("etag");
		var q = req.query._q;
		if( q in noDbService ){
			noDbService[q](req, res, function(err, result){
				if( err ){
					console.log(err);
					res.status(500).send(err);
				} else {
					res.json(result);
				}
			});
		} else if( q in service ){
			database.getConnection(function(err, conn){
				if( err ){
					console.log(err);
					res.send(500).send("cannot connect to database");
					return;
				}
				conn.beginTransaction(function(err){
					if( err ){
						console.log(err);
						res.status(500).send("cannot start transaction");
						database.disposeConnection(conn);
						return;
					}
					service[q](conn, req, res, function(err, result){
						if( err ){
							console.log(err);
							conn.rollback(function(rollbackErr){
								res.status(500).send(rollbackErr || err);
								database.disposeConnection(conn);
							});
						} else {
							conn.commit(function(err){
								if( err ){
									console.log(err);
									console.log(err.stack);
									res.status(500).send(err);
								} else {
									if( result === undefined ){
										result = "ok";
									}
									res.json(result);
								}
								database.disposeConnection(conn);
							})
						}
					});
				});
			});
		} else {
			res.sendStatus(400);
		}
	});
	return app;	
};

exports.modifyDb = function(fn){
	service.modifyDb(fn);
};
