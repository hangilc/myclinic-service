"use strict";

var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var api = require("./api");
var db = require("myclinic-db");
var moment = require("moment");

describe("Testing list_iyakuhin_by_patient", function(){
	it("empty", function(done){
		var conn = test.getConnection();
		var resultList;
		conti.exec([
			function(done){
				var tables = ["visit_drug"];
				conti.forEach(tables, function(table, done){
					conn.query("truncate table " + table, done);
				}, done);
			},
			function(done){
				api.listIyakuhinByPatient(1, function(err, result){
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
			expect(resultList).eql([]);
			done();
		})
	});

	it("simple", function(done){
		var conn = test.getConnection();
		var patientId = 100;
		var masters = [
			{
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
			},
			{
				iyakuhincode: 2,
				name: "IYAKUHIN_2",
				yomi: "iyakuhin_2",
				unit: "錠",
				yakka: "12.3",
				madoku: 0,
				kouhatsu: 1,
				zaikei: 1,
				valid_from: "2016-04-01",
				valid_upto: "0000-00-00"
			},
		];
		var visits = [
			{
				patient_id: patientId,
				v_datetime: "2016-08-26 10:21:33",
				shahokokuho_id: 0,
				koukikourei_id: 0,
				roujin_id: 0,
				kouhi_1_id: 0,
				kouhi_2_id: 0,
				kouhi_3_id: 0
			},
			{
				patient_id: patientId,
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
				var tables = ["iyakuhin_master_arch"];
				conti.forEach(tables, function(table, done){
					conn.query("truncate table " + table, done);
				}, done);
			},
			function(done){
				conti.forEach(visits, function(visit, done){
					db.insertVisit(conn, visit, done);
				}, done);
			},
			function(done){
				conti.forEach(masters, function(master, done){
					db.insertIyakuhinMaster(conn, master, done);
				}, done);
			},
			function(done){
				var drugs = [
					{
						visit_id: visits[0].visit_id,
						d_iyakuhincode: masters[0].iyakuhincode,
						d_amount: "3",
						d_usage: "毎食後",
						d_days: 7,
						d_category: 0,
						d_prescribed: 0
					},
					{
						visit_id: visits[1].visit_id,
						d_iyakuhincode: masters[1].iyakuhincode,
						d_amount: "3",
						d_usage: "毎食後",
						d_days: 7,
						d_category: 0,
						d_prescribed: 0
					}
				];
				conti.forEach(drugs, function(drug, done){
					db.insertDrug(conn, drug, done);
				}, done);
			},
			function(done){
				api.listIyakuhinByPatient(1, function(err, result){
					if( err ){
						done(err);
						return;
					}
					resultList = result;
					done();
				})
			},
			function(done){
				db.listIyakuhinByPatient(conn, patientId, function(err, result){
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
			expect(resultList).eql([]);
			done();
		})
	})
});