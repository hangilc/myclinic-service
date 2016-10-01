"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var service = require("../index");
var config = require("../test-config/service-config");
var conti = require("conti");
var http = require("http");
var mysql = require("mysql");

var port = 18081;
var conn;

before(function(done){
	var app = express();
	var subApp = express();
	subApp.use(bodyParser.urlencoded({extended: false}));
	subApp.use(bodyParser.json());
	service.initApp(subApp, config);
	app.use("/service", subApp);
	app.listen(port, function(){
		console.log("server listening to " + port);
		done();
	});
	conn = mysql.createConnection(config.dbConfig);
});

after(function(done){
	this.timeout(10000);
	var tables = ["disease", "disease_adj", "hoken_koukikourei", "hoken_roujin", "hoken_shahokokuho",
		"hotline", "iyakuhin_master_arch", "kouhi", "patient", "pharma_drug", "pharma_queue", "presc_example",
		"shinryoukoui_master_arch", "shoubyoumei_master_arch", "shuushokugo_master", "stock_drug",
		"tokuteikizai_master_arch", "visit", "visit_charge", "visit_conduct", "visit_conduct_drug",
		"visit_conduct_kizai", "visit_conduct_shinryou", "visit_drug", "visit_gazou_label",
		"visit_payment", "visit_shinryou", "visit_text", "wqueue"];
	conti.forEach(tables, function(table, done){
		conn.query("truncate table " + table, done);
	}, function(err){
		conn.end(function(){
			done(err);
		})
	})
});

exports.getConnection = function(){
	return conn;
}

exports.request = function(service, data, method, cb){
	var host = "localhost";
	var path = "/service";
	var headers = {};
	var params = { _q: service };
	var body;
	if( method === "GET" ){
		Object.keys(data).forEach(function(key){
			params[key] = encodeURI(data[key]);
		});
	}
	if( method === "POST" ){
		if( typeof data === "string" ){
			body = data;
		} else {
			body = JSON.stringify(data);
		}
		headers["content-type"] = "application/json";
	}
	var opt = {
		host: host,
		port: port,
		path: path + "?" + Object.keys(params).map(function(key){
				return key + "=" + params[key];
			}).join("&"),
		method: method,
		headers: headers
	};
	var req = http.request(opt, function(res){
			var msg = "";
			res.setEncoding("utf8");
			res.on("data", function(chunk){
				msg += chunk;
			});
			res.on("end", function(){
				cb(undefined, JSON.parse(msg));
			});
	});
	req.on("error", function(err){
		cb(err.message);
	});
	if( method === "POST" ){
		req.write(body);
	};
	req.end();
}


