"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var service = require("./index");
var config = require("./sample-config/service-config");

var app = express();
var subApp = express();
subApp.use(bodyParser.urlencoded({extended: false}));
subApp.use(bodyParser.json());
service.initApp(subApp, config);
app.use("/service", subApp);

var port = 8081;
app.listen(port, function(){
	console.log("server listening to " + 8081);
})
