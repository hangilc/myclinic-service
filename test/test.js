var server = require("../test-server.js");
var Req = require("../request.js");
var req = new Req("http://localhost:12000");
var mysql = require("mysql");
var conti = require("conti");
global.expect = require("chai").expect;

var dbConfig = server.dbConfig;
var conn;

before(function(){
	conn = mysql.createConnection(server.dbConfig);
});

exports.request = function(path, data, method, cb){
	req.request(path, data, method, cb);
};

before(function(done){
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
		if( err ){
			done(err);
			return;
		}
		done();
	})
});

before(function(done){
	server.run(done);
});

after(function(){
	conn.end();
});


