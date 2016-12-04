"use strict";

var test = require("./test");
var conti = require("conti");
var moment = require("moment");
var db = require("myclinic-db");
var mConsts = require("myclinic-consts");

exports.funClearTables = function(tables){
	return function(done){
		var conn = test.getConnection();
		conti.forEach(tables, function(table, done){
			conn.query("truncate table " + table, done);
		}, done);		
	}
};

var gMockIndex = 1;

function fillVisit(model){
	if( !("v_datetime" in model) ){
		model.v_datetime = moment().format("YYYY-MM-DD HH:mm:ss");
	}
	if( !("shahokokuho_id" in model) ){
		model.shahokokuho_id = 0;
	}
	if( !("koukikourei_id" in model) ){
		model.koukikourei_id = 0;
	}
	if( !("roujin_id" in model) ){
		model.roujin_id = 0;
	}
	if( !("kouhi_1_id" in model) ){
		model.kouhi_1_id = 0;
	}
	if( !("kouhi_2_id" in model) ){
		model.kouhi_2_id = 0;
	}
	if( !("kouhi_3_id" in model) ){
		model.kouhi_3_id = 0;
	}
}

function insertVisit(model, done){
	var conn = test.getConnection();
	conti.exec([
		function(done){
			fillVisit(model);
			db.insertVisit(conn, model, done);
		},
		function(done){
			setImmediate(function(){
				model._isSaved = true;
				done();
			})
		},
		function(done){
			if( model.drugs ){
				conti.forEach(model.drugs, function(drug, done){
					if( drug._isSaved ){
						setImmediate(done);
						return;
					}
					drug.visit_id = model.visit_id;
					insertDrug(drug, done);
				}, done);
			} else {
				setImmediate(done);
			}
		}
	], function(err){
		if( err ){
			done(err);
			return;
		}
		done();
	})
}

function fillDrug(model){
	var mockIndex;

	if( !("d_iyakuhincode" in model) ){
		model.d_iyakuhincode = getMockIndex();
	}
	if( !("d_amount" in model) ){
		model.d_amount = "3";
	}
	if( !("d_usage" in model) ){
		model.d_usage = "分３　毎食後";
	}
	if( !("d_category" in model) ){
		model.d_category = mConsts.DrugCategoryNaifuku;
	}
	if( !("d_days" in model) ){
		model.d_days = 7;
	}

	function getMockIndex(){
		if( !mockIndex ){
			mockIndex = gMockIndex++;
		}
		return mockIndex;
	}
}

function insertDrug(model, done){
	var conn = test.getConnection();
	fillDrug(model);
	db.insertDrug(conn, model, done);
}

function insert(model, done){
	switch(model._kind){
		case "visit": insertVisit(model, done); break;
		default: done("unknown model kind: " + model._kind); break;
	}
}

exports.funInsert = function(obj){
	return function(done){
		var list = Array.isArray(obj) ? obj : [obj];
		conti.forEach(list, function(model, done){
			insert(model, done);
		}, done);
	}
};