var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var service = require("../index");
var moment = require("moment");

describe("Testing delete_patient", function(){
	it("simple", function(done){
		var patient = {
			last_name: "last_name(1)",
			first_name: "first_name(1)",
			last_name_yomi: "last_name_yomi(1)",
			first_name_yomi: "first_name_yomi(1)",
			birth_day: "2002-01-02",
			sex: "M",
			phone: "",
			address: ""
		};
		var found;
		conti.exec([
			function(done){
				test.request("enter_patient", patient, "POST", function(err, result){
					if( err ){
						done(err);
						return;
					}
					patient.patient_id = result;
					done();
				});
			},
			function(done){
				var data = { patient_id: patient.patient_id };
				test.request("delete_patient", data, "POST", done);
			},
			function(done){
				test.request("find_patient", data, "GET", function(err, result){
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

