"use strict";

var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var api = require("./api");
var db = require("myclinic-db");
var moment = require("moment");

describe("Testing get_drug", function(){
	it("simple", function(done){
		var drugId = 12345;
		api.getDrug(drugId, function(err, result){
			if( err ){
				done(err);
				return;
			}
			expect(result).eql([drugId]);
			done();
		});
	});
});