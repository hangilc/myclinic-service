var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var service = require("../index");
var moment = require("moment");

describe("Testing update-roujin", function(){
	it("simple", function(done){
		var roujin = {
			patient_id: 123,
			shichouson: 12345678,
			jukyuusha: 1234567,
			futan_wari: 1,
			valid_from: "2015-02-01",
			valid_upto: "0000-00-00"
		};
		var updated;
		conti.exec([
			function(done){
				test.request("enter_roujin", roujin, "POST", function(err, result){
					if( err ){
						done(err);
						return;
					}
					roujin.roujin_id = result;
					done();
				});
			},
			function(done){
				roujin.valid_upto = "2016-01-31";
				test.request("update_roujin", roujin, "POST", done);
			}, 
			function(done){
				var data = {roujin_id: roujin.roujin_id};
				test.request("get_roujin", data, "GET", function(err, result){
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
				expect(updated).deep.equal(roujin);
				done();
			} catch(ex){
				done(ex);
			}
		});
	});
});

describe("Testing delete_roujin", function(){
	it("simple", function(done){
		var roujin = {
			patient_id: 123,
			shichouson: 12345678,
			jukyuusha: 1234567,
			futan_wari: 1,
			valid_from: "2015-02-01",
			valid_upto: "0000-00-00"
		};
		var found;
		conti.exec([
			function(done){
				test.request("enter_roujin", roujin, "POST", function(err, result){
					if( err ){
						done(err);
						return;
					}
					roujin.roujin_id = result;
					done();
				});
			},
			function(done){
				var data = { roujin_id: roujin.roujin_id };
				test.request("delete_roujin", data, "POST", done);
			},
			function(done){
				var data = { roujin_id: roujin.roujin_id };
				test.request("find_roujin", data, "GET", function(err, result){
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
				expect(found).null;
				done();
			} catch(ex){
				done(ex);
			}
		});
	});
});

