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

exports.listTodaysVisitsForPharma = function(cb){
	request("list_todays_visits_for_pharma", {}, "GET", cb);
};

exports.listDrugs = function(visitId, cb){
	request("list_drugs", {visit_id: visitId}, "GET", cb);
};

exports.listVisits = function(patientId, offset, n, cb){
	request("list_visits", {
		patient_id: patientId,
		offset: offset,
		n: n
	}, "GET", cb);
};

exports.listIyakuhinByPatient = function(patientId, cb){
	request("list_iyakuhin_by_patient", {
		patient_id: patientId
	}, "GET", cb);
};

exports.countVisitsByIyakuhincode = function(patientId, iyakuhincode, cb){
	request("count_visits_by_iyakuhincode", {
		patient_id: patientId,
		iyakuhincode: iyakuhincode
	}, "GET", cb);
}