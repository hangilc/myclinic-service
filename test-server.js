var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var Config = require("myclinic-config");
var Service = require("./index.js");

var confDir = path.join(__dirname, "test-config");
var database = Config.read(confDir, "test-database");

exports.dbConfig = database;

exports.run = function(done){
	var confDir = path.join(__dirname, "test-config");
	var database = Config.read(confDir, "test-database");
	var config = { 
		"database-config": database
	};
	["master-map", "name-map", "houkatsu-list"].forEach(function(key){
		config[key] = Config.read(confDir, key);
	});

	var app = express();
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(bodyParser.json());
	app.get("/config/:name", function(req, res){
		var c = Config.read(confDir, "subs", req.params.name);
		if( !c ){
			res.set("Content-Type", "application/json");
			res.end("{}");
		} else {
			res.json(c);
		}
	});
	Service.initApp(app, config);

	var port = 12000;
	app.listen(port, function(){
		done();
	})
};

