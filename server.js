var program = require("commander");
var Config = require("myclinic-config");
var express = require("express");
var bodyParser = require("body-parser");
var Service = require("./index.js");

program
	.option("-c, --config <path>", "Configuration directory", process.env.MYCLINIC_CONFIG)
	.option("--database-config <config-name>", "Database configuration", "database")
	.option("-p, --port <port>", "Listening port", 9000)
	.parse(process.argv)

var confDir = program.config;
var database = Config.read(confDir, program.databaseConfig);
if( program.databaseHost ){
	database.host = program.databaseHost
}
var config = {

};

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.get("/config/:name", function(req, res){
	var c = Config.read(confDir, "subs", req.params.name);
	if( !c || c === {} ){
		res.set("Content-Type", "application/json");
		res.end("{}");
	} else {
		res.json(c);
	}
});
Service.initApp(app, config);

var port = program.port;
app.listen(port, function(){
	console.log("server listening to " + port);
})
