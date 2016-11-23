var express = require("express");
var bodyParser = require("body-parser");
var Config = require("myclinic-config");
var path = require("path");
var service = require("./index.js");
var mysql = require("mysql");
var conti = require("conti");

var app = express();
app.use(express.static("test-static"));
var configDir = process.env.MYCLINIC_CONFIG;
var config = Config.read(path.join(configDir, "server"));
config.dbConfig = Config.read(path.join(configDir, "test-database"));
if( config.dbConfig.database === "myclinic" ){
	throw new Error("cannot conduct test against myclinic database");
}
(function(){
	var subApp = express();
	subApp.use(bodyParser.urlencoded({ extended: false }));
	subApp.use(bodyParser.json());
	service.initApp(subApp, config);
	app.use("/service", subApp);
})();

app.get("/cleanup", function(req, res){
	var conn = mysql.createConnection(config.dbConfig);
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
			if( err ){
				console.log(err);
			}
			console.log("cleared tables");
		})
	})
});

var port = 10000;
app.listen(port, function(){
	console.log("test server listening to " + port);
	console.log("open http://localhost:10000/index.html in browser");
});

