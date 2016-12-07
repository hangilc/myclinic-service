var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var service = require("../index");
var moment = require("moment");

describe("Testing update-kouhi", function(){
	it("simple", function(done){
		var kouhi = {
			patient_id: 123,
			futansha: 12345678,
			jukyuusha: 1234567,
			valid_from: "2015-02-01",
			valid_upto: "0000-00-00"
		};
		var updated;
		conti.exec([
			function(done){
				test.request("enter_kouhi", kouhi, "POST", function(err, result){
					if( err ){
						done(err);
						return;
					}
					kouhi.kouhi_id = result;
					done();
				});
			},
			function(done){
				kouhi.valid_upto = "2016-01-31";
				test.request("update_kouhi", kouhi, "POST", done);
			}, 
			function(done){
				var data = {kouhi_id: kouhi.kouhi_id};
				test.request("get_kouhi", data, "GET", function(err, result){
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
				expect(updated).deep.equal(kouhi);
				done();
			} catch(ex){
				done(ex);
			}
		});
	});
});

describe("Testing delete_kouhi", function(){
	it("simple", function(done){
		var kouhi = {
			patient_id: 123,
			futansha: 12345678,
			jukyuusha: 1234567,
			valid_from: "2015-02-01",
			valid_upto: "0000-00-00"
		};
		var found;
		conti.exec([
			function(done){
				test.request("enter_kouhi", kouhi, "POST", function(err, result){
					if( err ){
						done(err);
						return;
					}
					kouhi.kouhi_id = result;
					done();
				});
			},
			function(done){
				var data = { kouhi_id: kouhi.kouhi_id };
				test.request("delete_kouhi", data, "POST", done);
			},
			function(done){
				var data = { kouhi_id: kouhi.kouhi_id };
				test.request("find_kouhi", data, "GET", function(err, result){
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
				expect(found).null;
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

