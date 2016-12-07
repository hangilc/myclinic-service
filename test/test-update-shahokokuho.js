var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var service = require("../index");
var db = require("myclinic-db");
var moment = require("moment");

describe("Testing update-shahokokuho", function(){
	it("simple", function(done){
		var shahokokuho = {
			patient_id: 123,
			hokensha_bangou: 123456,
			hihokensha_kigou: "hihokensha_kigou(1)",
			hihokensha_bangou: "hihokensha_bangou(1)",
			honnin: 1,
			kourei: 0,
			valid_from: "2015-02-01",
			valid_upto: "0000-00-00"
		};
		var updated;
		conti.exec([
			function(done){
				test.request("enter_shahokokuho", shahokokuho, "POST", function(err, result){
					if( err ){
						done(err);
						return;
					}
					shahokokuho.shahokokuho_id = result;
					done();
				});
			},
			function(done){
				shahokokuho.valid_upto = "2016-01-31";
				test.request("update_shahokokuho", shahokokuho, "POST", done);
			}, 
			function(done){
				var data = {shahokokuho_id: shahokokuho.shahokokuho_id};
				test.request("get_shahokokuho", data, "GET", function(err, result){
					if( err ){
						done(err);
						return;
					}
					updated = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(updated).deep.equal(shahokokuho);
				done();
			} catch(ex){
				done(ex);
			}
		});
	});
});
