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
};

exports.listFullVisitsByIyakuhincode = function(patientId, iyakuhincode, offset, n, cb){
	request("list_full_visits_by_iyakuhincode", {
		patient_id: patientId,
		iyakuhincode: iyakuhincode,
		offset: offset,
		n: n
	}, "GET", cb);
};

exports.findPharmaDrug = function(iyakuhincode, cb){
	request("find_pharma_drug", {
		iyakuhincode: iyakuhincode
	}, "GET", cb);
};

exports.prescDone = function(visitId, done){
	request("presc_done", {
		visit_id: visitId
	}, "POST", done);
};

exports.getDrug = function(drugId, cb){
	request("get_drug", {
		drug_id: drugId
	}, "GET", cb);
};

