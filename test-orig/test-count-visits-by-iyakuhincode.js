"use strict";

var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var api = require("./api");
var db = require("myclinic-db");
var moment = require("moment");
var helper = require("./helper");

describe("Testing count_visits_by_iyakuhincode", function(){
	it("empty", function(done){
		var resultValue;
		conti.exec([
			helper.funClearTables(["visit"]),
			function(done){
				api.countVisitsByIyakuhincode(1, 1, function(err, result){
					if( err ){
						done(err);
						return;
					}
					resultValue = result;
					done();
				})
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			expect(resultValue).equal(0);
			done();
		});
	});

	it("simple", function(done){
		var patientId = 10;
		var iyakuhincode = 1234;
		var visits = [
			{
				_kind: "visit",
				patient_id: patientId,
				drugs: [
					{
						d_iyakuhincode: iyakuhincode
					}
				]
			},
			{
				_kind: "visit",
				patient_id: patientId,
				drugs: [
					{
						d_iyakuhincode: iyakuhincode
					}
				]
			}
		];
		var resultValue, ansValue = 2;
		conti.exec([
			helper.funClearTables(["visit", "visit_drug"]),
			helper.funInsert(visits),
			function(done){
				api.countVisitsByIyakuhincode(patientId, iyakuhincode, function(err, result){
					if( err ){
						done(err);
						return;
					}
					resultValue = result;
					done();
				})
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			expect(resultValue).equal(ansValue);
			done();
		})
	})
});