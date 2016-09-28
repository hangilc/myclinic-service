"use strict";

var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var api = require("./api");
var db = require("myclinic-db");
var moment = require("moment");

describe("Testing list_todays_visits_for_pharma", function(){
	it("empty", function(done){
		api.listTodaysVisitsForPharma(function(err, result){
			if( err ){
				done(err);
				return;
			}
			expect(result).eql([]);
			done();
		})
	});

	it("simple", function(done){
		var conn = test.getConnection();
		var patient = {
			last_name: "LAST_NAME",
			first_name: "FIRST_NAME",
			last_name_yomi: "LAST_NAME_YOMI",
			first_name_yomi: "FIRST_NAME_YOMI",
			birth_day: "1957-01-01",
			sex: "M",
			phone: "",
			address: ""
		};
		var master = {
			iyakuhincode: 1,
			name: "IYAKUHIN_1",
			yomi: "iyakuhin_1",
			unit: "錠",
			yakka: "12.3",
			madoku: 0,
			kouhatsu: 1,
			zaikei: 1,
			valid_from: "2016-04-01",
			valid_upto: "0000-00-00"
		};
		var visitId, resultList;
		conti.exec([
			function(done){
				conn.query("truncate table pharma_queue", done);
			},
			function(done){
				db.insertPatient(conn, patient, done);
			},
			function(done){
				var at = moment().format("YYYY-MM-DD HH:mm:ss");
				db.startVisit(conn, patient.patient_id, at, function(err, result){
					if( err ){
						done(err);
						return;
					}
					visitId = result;
					done();
				})
			},
			function(done){
				db.insertIyakuhinMaster(conn, master, done);
			},
			function(done){
				db.insertDrug(conn, {
					visit_id: visitId,
					d_iyakuhincode: master.iyakuhincode,
					d_amount: "3",
					d_usage: "毎食後",
					d_days: 7,
					d_category: 0,
					d_prescribed: 0
				}, done);
			},
			function(done){
				db.endExam(conn, visitId, 0, done);
			},
			function(done){
				api.listFullPharmaQueue(function(err, result){
					if( err ){
						done(err);
						return;
					}
					resultList = result;
					done();
				})
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			var ans = [{
				visit_id: visitId,
				patient_id: patient.patient_id,
				last_name: patient.last_name,
				first_name: patient.first_name,
				last_name_yomi: patient.last_name_yomi,
				first_name_yomi: patient.first_name_yomi,
				pharma_state: 0,
				wait_state: 2
			}]
			expect(resultList).eql(ans);
			done();
		})
	});
});