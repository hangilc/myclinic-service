var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var db = require("myclinic-db");
var moment = require("moment");
var mConsts = require("myclinic-consts");
var service = require("../index.js");

describe("Testing finish charge", function(){
	it("case 1", function(done){
		var conn = test.getConnection();
		var visit = {
			patient_id: 1000,
			v_datetime: "2016-11-20 21:53:00",
			shahokokuho_id: 0,
			roujin_id: 0,
			koukikourei_id: 0,
			kouhi_1_id: 0,
			kouhi_2_id: 0,
			kouhi_3_id: 0
		};
		var wqueue = { wait_state: mConsts.WqueueStateWaitCashier };
		conti.exec([
			function(done){
				db.insertVisit(conn, visit, done); 
			},
			function(done){
				wqueue.visit_id = visit.visit_id;
				db.insertWqueue(conn, wqueue, done);
			},
			function(done){
				service.finishCashier(conn, visit.visit_id, 1000, "2016-11-20 22:02:03", done);
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			console.log(visit);
			console.log(wqueue);
			done();
		});
	});
});

