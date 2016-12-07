var expect = require("chai").expect;
var test = require("./test");
var conti = require("conti");
var service = require("../index");
var db = require("myclinic-db");
var moment = require("moment");

describe("Testing update_patient", function(){
	it("simple", function(done){
		var conn = test.getConnection();
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
		var updatedPatient;
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
				patient.phone = "0123-45-667";
				test.request("update_patient", patient, "POST", done);
			},
			function(done){
				test.request("get_patient", {patient_id: patient.patient_id}, "GET", function(err, result){
					if( err ){
						done(err);
						return;
					}
					updatedPatient = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(updatedPatient).deep.equal(patient);
				done();
			} catch(ex){
				done(ex);
			}
		});
	});
});

