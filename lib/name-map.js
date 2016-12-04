"use strict";

var fs = require("fs");

var iyakuhinNames = {};
var shinryouNames = {};
var kizaiNames = {};
var diseaseNames = {};
var adjNames = {};

exports.import = function(path){
	console.log("master-name (import)", path);
	var content = fs.readFileSync(path, {encoding: "UTF-8"});
	var lines = content.split(/\r\n|\r|\n/);
	var m, count = 0;
	for(var i=0;i<lines.length;i++){
		var line = lines[i];
		if( line === "__END__" ){
			break;
		}
		if( m = line.match(/^([yskda]),([^,]+),(\d+)(\D|$)/) ){
			var kind = m[1];
			var name = m[2].trim();
			var code = +m[3];
			var map;
			switch(kind){
				case "y": map = iyakuhinNames; break;
				case "s": map = shinryouNames; break;
				case "k": map = kizaiNames; break;
				case "d": map = diseaseNames; break;
				case "a": map = adjNames; break;
				default: throw new Exception("unknonw name kind: " + kind);
			}
			map[name] = code;
			count++;
		} else if( line[0] === ";" ){
			// nop
		} else if( line.match(/^\s*$/) ){
			// nop
		} else {
			throw new Error("invalid line in master_map:", line);
		}
	}
	console.log("master-name (import)", count);
};

exports.iyakuhinNameToCode = function(name){
	return iyakuhinNames[name];
};

exports.shinryouNameToCode = function(name){
	return shinryouNames[name];
};

exports.kizaiNameToCode = function(name){
	return kizaiNames[name];
};

exports.diseaseNameToCode = function(name){
	return diseaseNames[name];
};

exports.adjNameToCode = function(name){
	return adjNames[name];
};



