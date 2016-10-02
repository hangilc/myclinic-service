"use strict";

var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var api = require("./api");
var db = require("myclinic-db");
var moment = require("moment");
var helper = require("./helper");

describe("Testing list_full_visits_by_iyakuhincode", function(){
	it("simple", function(done){
		api.listFullVisitsByIyakuhincode(1, 1234, 0, 10, function(err, result){
			if( err ){
				done(err);
				return;
			}
			expect(result).eql([1, 1234, 0, 10]);
			done();
		})
	})
});