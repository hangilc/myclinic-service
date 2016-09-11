"use strict";

var MasterMap = require("./master-map");
var MasterName = require("./master-name");
var mUtil = require("./myclinic-util");

function reg(q, f){
	if( q in exports ){
		throw q + " is already registered.";
	}
	exports[q] = f;
}

reg("batch_resolve_shinryou_names_at", function(req, res, cb){
	var names = req.body.names;
	var at = req.body.at.slice(0, 10);
	var resultMap = {};
	var i, name, code;
	for(i=0;i<names.length;i++){
		name = names[i];
		code = MasterName.shinryouNameToCode(name);
		if( code === 0 ){
			resultMap[name] = code;
		} else if( code ){
			code = MasterMap.mapShinryouMaster(code, at);
			resultMap[name] = code;
		} else {
			cb("診療コードを見つけられませんでした。: " + name);
			return;
		}
	}
	cb(undefined, resultMap);
});

reg("resolve_kizai_name_at", function(req, res, cb){
	var name = req.query.name;
	var at = req.query.at.slice(0, 10);
	var code = MasterName.kizaiNameToCode(name);
	if( code === 0 ){
		cb(undefined, code);
	} else if( code ){
		code = MasterMap.mapKizaiMaster(code, at);
		cb(undefined, code);
	} else {
		cb("器材コードを見つけられませんでした。: " + name);
	}
});