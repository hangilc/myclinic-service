"use strict";

var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var api = require("./api");
var db = require("myclinic-db");
var moment = require("moment");

describe("Testing list_visits", function(){
	it("empty", function(done){
		api.listVisits(1, 0, 10, function(err, result){
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
		var visits = [
			{
				patient_id: 100,
				v_datetime: "2016-08-26 10:21:33",
				shahokokuho_id: 0,
				koukikourei_id: 0,
				roujin_id: 0,
				kouhi_1_id: 0,
				kouhi_2_id: 0,
				kouhi_3_id: 0
			},
			{
				patient_id: 100,
				v_datetime: "2016-09-26 10:21:33",
				shahokokuho_id: 0,
				koukikourei_id: 0,
				roujin_id: 0,
				kouhi_1_id: 0,
				kouhi_2_id: 0,
				kouhi_3_id: 0
			},
		];
		var resultList, ans;
		conti.exec([
			function(done){
				conti.forEach(visits, function(visit, done){
					db.insertVisit(conn, visit, done);
				}, done);
			},
			function(done){
				api.listVisits(100, 0, 10, function(err, result){
					if( err ){
						done(err);
						return;
					}
					resultList = result;
					done();
				})
			},
			function(done){
				db.listVisitsForPatient(conn, 100, 0, 10, function(err, result){
					if( err ){
						done(err);
						return;
					}
					ans = result;
					done();
				})
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			done();
		})
	})
});