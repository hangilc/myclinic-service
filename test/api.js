"use strict";

var request = require("./test").request;

exports.enterPatient = function(patient, done){
	request("enter_patient", patient, "POST", function(err, result){
		if( err ){
			done(err);
			return;
		}
		patient.patient_id = result;
		done();
	})
};

exports.listFullPharmaQueue = function(cb){
	request("list_full_pharma_queue", {}, "GET", cb);
};