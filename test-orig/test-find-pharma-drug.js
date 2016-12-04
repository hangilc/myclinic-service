"use strict";

var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var api = require("./api");
var db = require("myclinic-db");
var moment = require("moment");

describe("Testing find_pharma_drug", function(){
	it("simple", function(done){
		var iyakuhincode = 1234;
		api.findPharmaDrug(iyakuhincode, function(err, result){
			if( err ){
				done(err);
				return;
			}
			expect(result).eql([iyakuhincode]);
			done();
		})
	});
});