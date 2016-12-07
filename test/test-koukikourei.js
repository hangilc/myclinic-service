var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var service = require("../index");
var moment = require("moment");

describe("Testing update-koukikourei", function(){
	it("simple", function(done){
		var koukikourei = {
			patient_id: 123,
			hokensha_bangou: "123456",
			hihokensha_bangou: "hihokensha_bangou(1)",
			futan_wari: 3,
			valid_from: "2015-02-01",
			valid_upto: "0000-00-00"
		};
		var updated;
		conti.exec([
			function(done){
				test.request("enter_koukikourei", koukikourei, "POST", function(err, result){
					if( err ){
						done(err);
						return;
					}
					koukikourei.koukikourei_id = result;
					done();
				});
			},
			function(done){
				koukikourei.valid_upto = "2016-01-31";
				test.request("update_koukikourei", koukikourei, "POST", done);
			}, 
			function(done){
				var data = {koukikourei_id: koukikourei.koukikourei_id};
				test.request("get_koukikourei", data, "GET", function(err, result){
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
				expect(updated).deep.equal(koukikourei);
				done();
			} catch(ex){
				done(ex);
			}
		});
	});
});

describe("Testing delete_koukikourei", function(){
	it("simple", function(done){
		var koukikourei = {
			patient_id: 123,
			hokensha_bangou: "123456",
			hihokensha_bangou: "hihokensha_bangou(1)",
			futan_wari: 3,
			valid_from: "2015-02-01",
			valid_upto: "0000-00-00"
		};
		var found;
		conti.exec([
			function(done){
				test.request("enter_koukikourei", koukikourei, "POST", function(err, result){
					if( err ){
						done(err);
						return;
					}
					koukikourei.koukikourei_id = result;
					done();
				});
			},
			function(done){
				var data = { koukikourei_id: koukikourei.koukikourei_id };
				test.request("delete_koukikourei", data, "POST", done);
			},
			function(done){
				var data = { koukikourei_id: koukikourei.koukikourei_id };
				test.request("find_koukikourei", data, "GET", function(err, result){
					if( err ){
						done(err);
						return;
					}
					found = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;	
			}
			try {
				done();
			} catch(ex){
				done(ex);
			}
		});
	});
});

