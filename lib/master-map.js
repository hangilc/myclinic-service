"use strict";

var fs = require("fs");

var ymap = [];
var ymap_keys = {};
var smap = [];
var smap_keys = {};
var kmap = [];
var kmap_keys = {};

exports.import = function(path, config){
	if( !config ){
		config = {};
	}
	if( !config.silent ){
		console.log("master-map (import)", path);
	}
	var content = fs.readFileSync(path, {encoding: "UTF-8"});
	var lines = content.split(/\r\n|\r|\n/);
	var m;
	for(var i=0;i<lines.length;i++){
		var line = lines[i];
		if( line === "__END__" ){
			break;
		}
		if( m = line.match(/^([YSK]),(\d{9}),(\d{4}-\d{2}-\d{2}),(\d{9})(\D|$)/) ){
			var kind = m[1];
			var entry = {
				from: +m[2],
				at: m[3],
				to: +m[4],
			};	
			if( kind === "Y" ){
				ymap.push(entry);
				ymap_keys[entry.from] = true;
			} else if( kind === "S" ){
				smap.push(entry);
				smap_keys[entry.from] = true;
			} else if( kind === "K" ){
				kmap.push(entry);
				kmap_keys[entry.from] = true;
			} else {
				throw new Error("unknown kind: " + kind);
			}
		} else if( line[0] === ";" ){
			// nop
		} else if( line.match(/^\s*$/) ){
			// nop
		} else {
			throw new Error("invalid line in master_map:", line);
		}
	}
	if( !config.silent ){
		console.log("master-map (import)", ymap.length);
	}
};

exports.mapIyakuhinMaster = function(iyakuhincode, at){
	iyakuhincode = +iyakuhincode;
	at = at.slice(0, 10);
	if( ymap_keys[iyakuhincode] ){
		ymap.forEach(function(entry){
			if( entry.from === iyakuhincode && entry.at <= at ){
				iyakuhincode = entry.to;
			}
		})
	}
	return iyakuhincode;
};

exports.mapShinryouMaster = function(shinryoucode, at){
	shinryoucode = +shinryoucode;
	at = at.slice(0, 10);
	if( smap_keys[shinryoucode] ){
		smap.forEach(function(entry){
			if( entry.from === shinryoucode && entry.at <= at ){
				shinryoucode = entry.to;
			}
		})
	}
	return shinryoucode;
};

exports.mapKizaiMaster = function(kizaicode, at){
	kizaicode = +kizaicode;
	at = at.slice(0, 10);
	if( kmap_keys[kizaicode] ){
		kmap.forEach(function(entry){
			if( entry.from === kizaicode && entry.at <= at ){
				kizaicode = entry.to;
			}
		})
	}
	return kizaicode;
};





