"use strict";

var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var api = require("./api");
var db = require("myclinic-db");
var moment = require("moment");

describe("Testing presc_done", function(){
	it("simple", function(done){
		var visitId = 12345;
		api.prescDone(visitId, function(err, result){
			if( err ){
				done(err);
				return;
			}
			expect(result).eql([visitId]);
			done();
		});
	});
});