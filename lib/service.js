"use strict";

var conti = require("conti");
var db = require("myclinic-db");
var MasterMap = require("./master-map");
var MasterName = require("./master-name");
var mUtil = require("./myclinic-util");
var mConsts = require("myclinic-consts");
var mRcpt = require("./rcpt");
var moment = require("moment");
var mData = require("myclinic-data");

function reg(q, f){
	if( q in exports ){
		throw q + " is already registered.";
	}
	exports[q] = f;
}

exports.modifyDb = function(fn){
	db = fn(db);
};

reg("recent_visits", function(conn, req, res, cb){
	db.recentVisits(conn, 20, cb);
});

reg("get_patient", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	db.getPatient(conn, patientId, cb);
});

reg("get_visit", function(conn, req, res, cb){
	var visitId = +req.query.visit_id;
	db.getVisit(conn, visitId, cb);
});

reg("enter_visit", function(conn, req, res, cb){
	var visit = req.body;
	db.insertVisit(conn, visit, cb);
});

reg("calc_visits", function(conn, req, res, cb){
	var patientId = req.query.patient_id;
	db.calcVisits(conn, patientId, cb);
});

reg("list_full_visits", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	var offset = +req.query.offset;
	var n = +req.query.n;
	db.listFullVisitsForPatient(conn, patientId, offset, n, cb);
});

reg("suspend_exam", function(conn, req, res, done){
	var visitId = +req.body.visit_id;
	if( !(visitId > 0) ){
		done("invalid visitId");
		return;
	}
	db.suspendExam(conn, visitId, done);
});

reg("start_exam", function(conn, req, res, done){
	var visitId = +req.body.visit_id;
	if( !(visitId > 0) ){
		done("invalid visitId");
		return;
	}
	db.startExam(conn, visitId, done);
});

reg("end_exam", function(conn, req, res, done){
	var visitId = +req.body.visit_id;
	var charge = +req.body.charge;
	db.endExam(conn, visitId, charge, done);
})

reg("list_current_full_diseases", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	db.listCurrentFullDiseases(conn, patientId, cb);
});

reg("list_full_wqueue_for_exam", function(conn, req, res, cb){
	db.listFullWqueueForExam(conn, cb);
});

reg("list_full_wqueue_for_cashier", function(conn, req, res, cb){
	db.listFullWqueue(conn, function(err, result){
		if( err ){
			cb(err);
			return;
		}
		var list = result.filter(function(wq){
			return wq.wait_state === mConsts.WqueueStateWaitCashier;
		});
		cb(undefined, list);
	});
});

reg("enter_wqueue", function(conn, req, res, done){
	var wqueue = req.body;
	db.insertWqueue(conn, wqueue, done);
});

reg("find_wqueue", function(conn, req, res, cb){
	var visitId = +req.query.visit_id;
	db.findWqueue(conn, visitId, cb);
});

reg("search_patient", function(conn, req, res, cb){
	var text = req.query.text;
	db.searchPatient(conn, text, cb);
});

reg("list_todays_visits", function(conn, req, res, cb){
	db.listTodaysVisits(conn, cb);
});

reg("start_visit", function(conn, req, res, done){
	var patientId = +req.body.patient_id;
	var at = req.body.at;
	db.startVisit(conn, patientId, at, done);
});

reg("delete_visit", function(conn, req, res, done){
	var visitId = +req.body.visit_id;
	db.safelyDeleteVisit(conn, visitId, done);
});

reg("get_text", function(conn, req, res, cb){
	var textId = +req.query.text_id;
	db.getText(conn, textId, cb);
});

reg("update_text", function(conn, req, res, done){
	var text = req.body;
	db.updateText(conn, text, done);
});

reg("delete_text", function(conn, req, res, done){
	var textId = +req.body.text_id;
	db.deleteText(conn, textId, done);
});

reg("enter_text", function(conn, req, res, cb){
	var text = req.body;
	db.insertText(conn, text, cb);
});

reg("list_available_hoken", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	var at = req.query.at;
	db.listAvailableHoken(conn, patientId, at, cb);
});

reg("update_visit", function(conn, req, res, done){
	var data = {
		visit_id: +req.body.visit_id,
		shahokokuho_id: +req.body.shahokokuho_id,
		koukikourei_id: +req.body.koukikourei_id,
		roujin_id: +req.body.roujin_id,
		kouhi_1_id: +req.body.kouhi_1_id,
		kouhi_2_id: +req.body.kouhi_2_id,
		kouhi_3_id: +req.body.kouhi_3_id
	};
	db.updateVisit(conn, data, done);
});

reg("get_visit_with_full_hoken", function(conn, req, res, cb){
	var visitId = +req.query.visit_id;
	db.getVisitWithFullHoken(conn, visitId, cb);
});

reg("search_iyakuhin_master", function(conn, req, res, cb){
	var text = req.query.text;
	var at = req.query.at;
	db.searchIyakuhinMaster(conn, text, at, cb);
});

reg("search_presc_example", function(conn, req, res, cb){
	var text = req.query.text;
	db.searchPrescExample(conn, text, cb);
});

reg("search_full_drug_for_patient", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	var text = req.query.text;
	db.searchFullDrugForPatient(conn, patientId, text, cb);
});

reg("resolve_iyakuhin_master_at", function(conn, req, res, cb){
	var iyakuhincode = +req.query.iyakuhincode;
	var at = req.query.at;
	iyakuhincode = MasterMap.mapIyakuhinMaster(iyakuhincode, at);
	if( iyakuhincode === 0 ){
		cb("現在使用できない薬剤です。");
		return;
	}
	db.getIyakuhinMaster(conn, iyakuhincode, at, cb);
});

reg("get_iyakuhin_master", function(conn, req, res, cb){
	var iyakuhincode = +req.query.iyakuhincode;
	var at = req.query.at;
	db.getIyakuhinMaster(conn, iyakuhincode, at, cb);
});

reg("enter_drug", function(conn, req, res, cb){
	var drug = req.body;
	//enterDrug(conn, drug, cb);
	db.insertDrug(conn, drug, cb);
});

reg("get_full_drug", function(conn, req, res, cb){
	var drugId = +req.query.drug_id;
	var at = req.query.at;
	db.getFullDrug(conn, drugId, at, cb);
});

reg("list_full_drugs_for_visit", function(conn, req, res, cb){
	var visitId = +req.query.visit_id;
	var at = req.query.at;
	db.listFullDrugsForVisit(conn, visitId, at, cb);
});

function enterDrug(conn, drug, cb){
	var at, drugId;
	conti.exec([
		function(done){
			db.getVisit(conn, drug.visit_id, function(err, result){
				if( err ){
					done(err);
					return;
				}
				at = result.v_datetime;
				done();
			})
		},
		function(done){
			db.getIyakuhinMaster(conn, drug.d_iyakuhincode, at, done);
		},
		function(done){
			db.insertDrug(conn, drug, function(err, result){
				if( err ){
					done(err);
					return;
				}
				drugId = result;
				done();
			})
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, drugId);
	});
}

reg("batch_enter_drugs", function(conn, req, res, cb){
	var drugs = req.body;
	var enteredDrugIds = [];
	conti.forEach(drugs, function(drug, done){
		enterDrug(conn, drug, function(err, result){
			if( err ){
				console.log(err);
				done(drug.name + "をコピーできませんでした。");
				return;
			}
			enteredDrugIds.push(result);
			done();
		})
	}, function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, enteredDrugIds);
	})
});

reg("batch_delete_drugs", function(conn, req, res, done){
	var drugIds = req.body;
	conti.forEachPara(drugIds, function(drugId, done){
		db.deleteDrug(conn, drugId, done);
	}, done);
});

reg("batch_update_drugs_days", function(conn, req, res, done){
	var drugIds = req.body.drug_ids;
	var days = req.body.days;
	var drugs;
	conti.exec([
		function(done){
			conti.mapPara(drugIds, function(drugId, cb){
				db.getDrug(conn, drugId, function(err, result){
					if( err ){
						cb(err);
						return;
					}
					cb(undefined, mUtil.assign({}, result));
				})
			}, function(err, result){
				if( err ){
					done(err);
					return;
				}
				drugs = result;
				done();
			})
		},
		function(done){
			drugs.forEach(function(drug){
				drug.d_days = days;
			});
			conti.forEachPara(drugs, function(drug, done){
				db.updateDrug(conn, drug, done);
			}, done);
		}
	], done);
});

reg("modify_drug", function(conn, req, res, done){
	var drug = req.body;
	var origDrug;
	conti.exec([
		function(done){
			db.getDrug(conn, drug.drug_id, function(err, result){
				if( err ){
					done(err);
					return;
				}
				origDrug = result;
				done();
			})
		},
		function(done){
			drug = mUtil.assign({}, origDrug, drug);
			db.updateDrug(conn, drug, done);
		}
	], done)
});

reg("batch_enter_shinryou", function(conn, req, res, cb){
	var shinryouList = req.body;
	var newShinryouIds = [];
	conti.forEach(shinryouList, function(shinryou, done){
		db.insertShinryou(conn, shinryou, function(err, result){
			if( err ){
				done(err);
				return;
			}
			newShinryouIds.push(result);
			done();
		})
	}, function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, newShinryouIds);
	});
});

reg("get_shinryou", function(conn, req, res, cb){
	var shinryouId = +req.query.shinryou_id;
	db.getShinryou(conn, shinryouId, cb);
});

reg("get_full_shinryou", function(conn, req, res, cb){
	var shinryouId = +req.query.shinryou_id;
	var at = req.query.at;
	db.getFullShinryou(conn, shinryouId, at, cb);
});

reg("list_full_shinryou_for_visit", function(conn, req, res, cb){
	var visitId = +req.query.visit_id;
	var at = req.query.at;
	db.listFullShinryouForVisit(conn, visitId, at, cb);
});

reg("batch_delete_shinryou", function(conn, req, res, done){
	var shinryouIds = req.body;
	conti.forEachPara(shinryouIds, function(shinryouId, done){
		db.deleteShinryou(conn, shinryouId, done);
	}, done);
});

reg("search_shinryou_master", function(conn, req, res, cb){
	var text = req.query.text;
	var at = req.query.at;
	db.searchShinryouMaster(conn, text, at, cb);
});

reg("resolve_shinryou_master_at", function(conn, req, res, cb){
	var shinryoucode = +req.query.shinryoucode;
	var at = req.query.at.slice(0, 10);
	shinryoucode = MasterMap.mapShinryouMaster(shinryoucode, at);
	db.getShinryouMaster(conn, shinryoucode, at, cb);
});

reg("get_shinryou_master", function(conn, req, res, cb){
	var shinryoucode = +req.query.shinryoucode;
	var at = req.query.at;
	db.getShinryouMaster(conn, shinryoucode, at, cb);
});

reg("enter_conduct", function(conn, req, res, cb){
	var conduct = req.body;
	db.insertConduct(conn, conduct, cb);
});

reg("enter_gazou_label", function(conn, req, res, done){
	var gazouLabel = req.body;
	db.insertGazouLabel(conn, gazouLabel, done);
});

reg("set_gazou_label", function(conn, req, res, done){
	var conductId = req.body.conduct_id;
	var label = req.body.label.trim();
	var gazouLabel;
	conti.exec([
		function(done){
			db.findGazouLabel(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				gazouLabel = result;
				done();
			})
		},
		function(done){
			if( label === "" ){
				if( gazouLabel ){
					db.deleteGazouLabel(conn, conductId, done);
				} else {
					done();
				}
			} else {
				if( gazouLabel ){
					gazouLabel = mUtil.assign({}, gazouLabel, {
						label: label
					});
					db.updateGazouLabel(conn, gazouLabel, done);
				} else {
					gazouLabel = {
						visit_conduct_id: conductId,
						label: label
					};
					db.insertGazouLabel(conn, gazouLabel, done);
				}
			}
		}
	], done);
});

reg("enter_conduct_shinryou", function(conn, req, res, cb){
	var conductShinryou = req.body;
	db.insertConductShinryou(conn, conductShinryou, cb);
});

reg("enter_conduct_drug", function(conn, req, res, cb){
	var conductDrug = req.body;
	db.insertConductDrug(conn, conductDrug, cb);
});

reg("enter_conduct_kizai", function(conn, req, res, cb){
	var conductKizai = req.body;
	db.insertConductKizai(conn, conductKizai, cb);
});

reg("batch_enter_conduct_shinryou", function(conn, req, res, cb){
	var conductShinryouList = req.body;
	var conductShinryouIds = [];
	conti.forEach(conductShinryouList, function(conductShinryou, done){
		db.insertConductShinryou(conn, conductShinryou, function(err, result){
			if( err ){
				done(err);
				return;
			}
			conductShinryouIds.push(result);
			done();
		})
	}, function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, conductShinryouIds);
	})
});

reg("get_conduct", function(conn, req, res, cb){
	var conductId = +req.query.conduct_id;
	db.getConduct(conn, conductId, cb);
})

reg("get_full_conduct", function(conn, req, res, cb){
	var conductId = +req.query.conduct_id;
	var at = req.query.at;
	db.getFullConduct(conn, conductId, at, cb);
});

function copyConduct(conn, dstVisitId, srcConduct, cb){
	var conductId = srcConduct.id;
	var srcGazouLabel, srcConductShinryouList, srcConductDrugs, srcConductKizaiList;
	var dstConductId;
	conti.exec([
		function(done){
			db.findGazouLabel(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				srcGazouLabel = result;
				done();
			})
		},
		function(done){
			db.listConductShinryouForConduct(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				srcConductShinryouList = result;
				done();
			})
		},
		function(done){
			db.listConductDrugsForConduct(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				srcConductDrugs = result;
				done();
			})
		},
		function(done){
			db.listConductKizaiForConduct(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				srcConductKizaiList = result;
				done();
			})
		},
		function(done){
			var conduct = {
				visit_id: dstVisitId,
				kind: srcConduct.kind
			};
			db.insertConduct(conn, conduct, function(err, result){
				if( err ){
					done(err);
					return;
				}
				dstConductId = result;
				done();
			})
		},
		function(done){
			if( srcGazouLabel ){
				var gazouLabel = {
					visit_conduct_id: dstConductId,
					label: srcGazouLabel.label
				};
				db.insertGazouLabel(conn, gazouLabel, done);
			} else {
				done();
			}
		},
		function(done){
			conti.forEach(srcConductShinryouList, function(conductShinryou, done){
				var newConductShinryou = {
					visit_conduct_id: dstConductId,
					shinryoucode: conductShinryou.shinryoucode
				};
				db.insertConductShinryou(conn, newConductShinryou, done);
			}, done);
		},
		function(done){
			conti.forEach(srcConductDrugs, function(conductDrug, done){
				var newConductDrug = {
					visit_conduct_id: dstConductId,
					iyakuhincode: conductDrug.iyakuhincode,
					amount: conductDrug.amount,
				};
				db.insertConductDrug(conn, newConductDrug, done);
			}, done);
		},
		function(done){
			conti.forEach(srcConductKizaiList, function(conductKizai, done){
				var newConductKizai = {
					visit_conduct_id: dstConductId,
					kizaicode: conductKizai.kizaicode,
					amount: conductKizai.amount
				};
				db.insertConductKizai(conn, newConductKizai, done);
			}, done);
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, dstConductId);
	});	
}

reg("copy_conducts", function(conn, req, res, cb){
	var srcVisitId = req.body.src_visit_id;
	var dstVisitId = req.body.dst_visit_id;
	var srcConducts, dstConductIds = [];
	conti.exec([
		function(done){
			db.listConductsForVisit(conn, srcVisitId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				srcConducts = result;
				done();
			})
		},
		function(done){
			conti.forEach(srcConducts, function(srcConduct, done){
				copyConduct(conn, dstVisitId, srcConduct, function(err, result){
					if( err ){
						done(err);
						return;
					}
					dstConductIds.push(result);
					done();
				})
			}, done);
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, dstConductIds);
	})
});

reg("delete_conduct", function(conn, req, res, done){
	var conductId = req.body.conduct_id;
	var gazouLabel, conductShinryouList, conductDrugs, conductKizaiList;
	conti.exec([
		function(done){
			db.findGazouLabel(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				gazouLabel = result;
				done();
			})
		},
		function(done){
			db.listConductShinryouForConduct(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				conductShinryouList = result;
				done();
			})
		},
		function(done){
			db.listConductDrugsForConduct(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				conductDrugs = result;
				done();
			})
		},
		function(done){
			db.listConductKizaiForConduct(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				conductKizaiList = result;
				done();
			})
		},
		function(done){
			conti.execPara([
				function(done){
					if( gazouLabel ){
						db.deleteGazouLabel(conn, conductId, done);
					} else {
						done();
					}
				},
				function(done){
					conti.forEachPara(conductShinryouList, function(conductShinryou, done){
						db.deleteConductShinryou(conn, conductShinryou.id, done);
					}, done);
				},
				function(done){
					conti.forEachPara(conductDrugs, function(conductDrug, done){
						db.deleteConductDrug(conn, conductDrug.id, done);
					}, done);
				},
				function(done){
					conti.forEachPara(conductKizaiList, function(conductKizai, done){
						db.deleteConductKizai(conn, conductKizai.id, done);
					}, done);
				},
				function(done){
					db.deleteConduct(conn, conductId, done);
				}
			], done);
		}
	], done);
});

reg("delete_conduct_shinryou", function(conn, req, res, done){
	var id = +req.body.conduct_shinryou_id;
	db.deleteConductShinryou(conn, id, done);
});

reg("delete_conduct_drug", function(conn, req, res, done){
	var id = +req.body.conduct_drug_id;
	db.deleteConductDrug(conn, id, done);
});

reg("delete_conduct_kizai", function(conn, req, res, done){
	var id = +req.body.conduct_kizai_id;
	db.deleteConductKizai(conn, id, done);
});

reg("get_kizai_master", function(conn, req, res, cb){
	var kizaicode = +req.query.kizaicode;
	var at = req.query.at;
	db.getKizaiMaster(conn, kizaicode, at, cb);
});

reg("search_kizai_master", function(conn, req, res, cb){
	var text = req.query.text;
	var at = req.query.at;
	db.searchKizaiMaster(conn, text, at, cb);
});

reg("change_conduct_kind", function(conn, req, res, done){
	var conductId = +req.body.conduct_id;
	var kind = +req.body.kind;
	var conduct;
	conti.exec([
		function(done){
			db.getConduct(conn, conductId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				conduct = result;
				done();
			})
		},
		function(done){
			conduct = mUtil.assign({}, conduct, {kind: kind});
			db.updateConduct(conn, conduct, done);
		}
	], done);
});

function addConduct(conn, visitId, kind, gazouLabelString, conductShinryouList, conductDrugs, conductKizaiList, cb){
	var conductId;
	conti.exec([
		function(done){
			var conduct = {
				visit_id: visitId,
				kind: kind
			};
			db.insertConduct(conn, conduct, function(err, result){
				if( err ){
					done(err);
					return;
				}
				conductId = result;
				done();
			})
		},
		function(done){
			if( gazouLabelString ){
				var gazouLabel = {
					visit_conduct_id: conductId,
					label: gazouLabelString
				};
				db.insertGazouLabel(conn, gazouLabel, done);
			} else {
				done();
			}
		},
		function(done){
			conti.forEach(conductShinryouList, function(conductShinryou, done){
				var shinryou = mUtil.assign({}, conductShinryou, {
					visit_conduct_id: conductId
				});
				db.insertConductShinryou(conn, shinryou, done);
			}, done);
		},
		function(done){
			conti.forEach(conductDrugs, function(conductDrug, done){
				var drug = mUtil.assign({}, conductDrug, {
					visit_conduct_id: conductId
				});
				db.insertConductDrug(conn, drug, done);
			}, done);
		},
		function(done){
			conti.forEach(conductKizaiList, function(conductKizai, done){
				var kizai = mUtil.assign({}, conductKizai, {
					visit_conduct_id: conductId
				});
				db.insertConductKizai(conn, kizai, done);
			}, done);
		},
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, conductId);
	})
}

function addKotsuenTeiryou(conn, visitId, at, cb){
	var kind = mConsts.ConductKindGazou;
	var gazouLabelString = "骨塩定量に使用";
	var shinryoucode = MasterName.shinryouNameToCode("骨塩定量ＭＤ法");
	if( !shinryoucode ){
		cb("骨塩定量ＭＤ法の診療コードを見つけられませんでした。");
		return;
	}
	shinryoucode = MasterMap.mapShinryouMaster(shinryoucode, at);
	var shinryouList = [
		{
			shinryoucode: shinryoucode
		}
	];
	var drugs = [];
	var kizaicode = MasterName.kizaiNameToCode("四ツ切");
	if( !kizaicode ){
		cb("四ツ切の器材コードを見つけられませんでした。");
		return;
	}
	kizaicode = MasterMap.mapKizaiMaster(kizaicode, at);
	var kizaiList = [
		{
			kizaicode: kizaicode,
			amount: 1
		}
	];
	addConduct(conn, visitId, kind, gazouLabelString, shinryouList, drugs, kizaiList, cb);
}

reg("enter_shinryou_by_names", function(conn, req, res, cb){
	var visitId = req.body.visit_id;
	var names = req.body.names;
	var visit, shinryouIds = [], conductIds = [];
	conti.exec([
		function(done){
			db.getVisit(conn, visitId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				visit = result;
				done();
			})
		},
		function(done){
			conti.forEach(names, function(name, done){
				if( name === "骨塩定量" ){
					addKotsuenTeiryou(conn, visitId, visit.v_datetime, function(err, result){
						if( err ){
							done(err);
							return;
						}
						conductIds.push(result);
						done();
					})
				} else {
					var shinryoucode = MasterName.shinryouNameToCode(name);
					if( !shinryoucode ){
						done(name + "に対する診療コードを見つけられません。");
						return;
					}
					shinryoucode = MasterMap.mapShinryouMaster(shinryoucode, visit.v_datetime);
					var shinryou = {
						visit_id: visitId,
						shinryoucode: shinryoucode
					};
					db.insertShinryou(conn, shinryou, function(err, result){
						if( err ){
							done(err);
							return;
						}
						shinryouIds.push(result);
						done();
					})
				}
			}, done);
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, {
			shinryou_ids: shinryouIds,
			conduct_ids: conductIds
		});
	});
});

reg("calc_meisai", function(conn, req, res, cb){
	var visitId = +req.query.visit_id;
	var visit, patient, meisai, charge;
	conti.exec([
		function(done){
			db.getFullVisit(conn, visitId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				visit = result;
				done();
			})
		},
		function(done){
			db.getPatient(conn, visit.patient_id, function(err, result){
				if( err ){
					done(err);
					return;
				}
				patient = result;
				done();
			})
		},
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		var rcpt = new mRcpt.RcptVisit(visit, patient);
		cb(undefined, rcpt.getMeisai());
	})
});

reg("find_charge", function(conn, req, res, cb){
	var visitId = +req.query.visit_id;
	db.findCharge(conn, visitId, cb);
});

reg("update_charge", function(conn, req, res, done){
	var charge = req.body;
	db.updateCharge(conn, charge, done);
});

reg("get_charge", function(conn, req, res, cb){
	var visitId = req.query.visit_id;
	db.getCharge(conn, visitId, cb);
});

reg("search_shoubyoumei_master", function(conn, req, res, cb){
	var text = req.query.text;
	var at = req.query.at;
	db.searchShoubyoumeiMaster(conn, text, at, cb);
});

reg("search_shuushokugo_master", function(conn, req, res, cb){
	var text = req.query.text;
	db.searchShuushokugoMaster(conn, text, cb);
});

reg("get_shoubyoumei_master", function(conn, req, res, cb){
	var code = +req.query.shoubyoumeicode;
	var at = req.query.at;
	db.getShoubyoumeiMaster(conn, code, at, cb);
});

reg("get_shuushokugo_master", function(conn, req, res, cb){
	var code = +req.query.shuushokugocode;
	db.getShuushokugoMaster(conn, code, cb);
});

reg("get_shoubyoumei_master_by_name", function(conn, req, res, cb){
	var name = req.query.name;
	var at = req.query.at;
	db.getShoubyoumeiMasterByName(conn, name, at, cb);
});

reg("get_shuushokugo_master_by_name", function(conn, req, res, cb){
	var name = req.query.name;
	db.getShuushokugoMasterByName(conn, name, cb);
});

reg("enter_disease", function(conn, req, res, cb){
	var shoubyoumeicode = +req.body.shoubyoumeicode;
	var shuushokugocodes = req.body.shuushokugocodes;
	var patientId = +req.body.patient_id;
	var startDate = req.body.start_date;
	var endDate = req.body.end_date || "0000-00-00";
	var endReason = req.body.end_reason || mConsts.DiseaseEndReasonNotEnded
	var disease_id;
	conti.exec([
		function(done){
			var disease = {
				patient_id: patientId,
				shoubyoumeicode: shoubyoumeicode,
				start_date: startDate,
				end_date: endDate,
				end_reason: endReason
			};
			conti.exec([
				function(done){
					db.getShoubyoumeiMaster(conn, disease.shoubyoumeicode, disease.start_date, done);
				},
				function(done){
					db.insertDisease(conn, disease, function(err, result){
						if( err ){
							done(err);
							return;
						}
						disease_id = result;
						done();
					})
				}
			], done);
		},
		function(done){
			conti.forEach(shuushokugocodes, function(shuushokugocode, done){
				var adj = {
					disease_id: disease_id,
					shuushokugocode: shuushokugocode
				};
				db.insertDiseaseAdj(conn, adj, done);
			}, done);
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, disease_id);
	})
});

reg("get_full_disease", function(conn, req, res, cb){
	var diseaseId = +req.query.disease_id;
	db.getFullDisease(conn, diseaseId, cb);
});

reg("get_disease", function(conn, req, res, cb){
	var diseaseId = +req.query.disease_id;
	db.getDisease(conn, diseaseId, cb);
})

reg("batch_update_diseases", function(conn, req, res, done){
	var diseases = req.body;
	conti.forEach(diseases, function(disease, done){
		db.updateDisease(conn, disease, done);
	}, done);
});

reg("list_all_full_diseases", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	db.listAllFullDiseases(conn, patientId, cb);
});

reg("update_disease_with_adj", function(conn, req, res, done){
	var disease = req.body;
	var currentAdjList;
	conti.exec([
		function(done){
			db.getShoubyoumeiMaster(conn, disease.shoubyoumeicode, disease.start_date, done);
		},
		function(done){
			db.updateDisease(conn, disease, done);
		},
		function(done){
			db.listDiseaseAdjForDisease(conn, disease.disease_id, function(err, result){
				if( err ){
					done(err);
					return;
				}
				currentAdjList = result;
				done();
			})
		},
		function(done){
			conti.forEachPara(currentAdjList, function(adj, done){
				db.deleteDiseaseAdj(conn, adj.disease_adj_id, done);
			}, done);
		},
		function(done){
			conti.forEachPara(disease.adj_list, function(adj, done){
				db.insertDiseaseAdj(conn, adj, done);
			}, done);
		}
	], done);
});

reg("delete_disease_with_adj", function(conn, req, res, done){
	var diseaseId = req.body.disease_id;
	var adjList;
	conti.exec([
		function(done){
			db.listDiseaseAdjForDisease(conn, diseaseId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				adjList = result;
				done();
			})
		},
		function(done){
			conti.forEachPara(adjList, function(adj, done){
				db.deleteDiseaseAdj(conn, adj.disease_adj_id, done);
			}, done);
		},
		function(done){
			db.deleteDisease(conn, diseaseId, done);
		}
	], done);
});

reg("search_text_for_patient", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	var text = req.query.text;
	db.searchTextForPatient(conn, patientId, text, cb);
});

reg("search_whole_text", function(conn, req, res, cb){
	var text = req.query.text;
	db.searchWholeText(conn, text, cb);
});

// patient //////////////////////////////////////////////////////////

reg("enter_patient", function(conn, req, res, cb){
	var patient = {
		last_name : req.body.last_name,
		first_name : req.body.first_name,
		last_name_yomi : req.body.last_name_yomi,
		first_name_yomi : req.body.first_name_yomi,
		birth_day : req.body.birth_day,
		sex : req.body.sex,
		phone : req.body.phone,
		address : req.body.address,
	};
	db.insertPatient(conn, patient, cb);
});

// for pharma ///////////////////////////////////////////////////////

reg("list_full_pharma_queue", function(conn, req, res, cb){  // listFullPharmaQueue
	db.listFullPharmaQueue(conn, cb);
});

reg("list_todays_visits_for_pharma", function(conn, req, res, cb){ // listTodaysVisitsForPharma
	db.listTodaysVisitsForPharma(conn, cb);
});

reg("list_drugs", function(conn, req, res, cb){ // listDrugs
	var visitId = +req.query.visit_id;
	db.listDrugsForVisit(conn, visitId, cb);
});

reg("list_visits", function(conn, req, res, cb){ // listVisits
	var patientId = +req.query.patient_id;
	var offset = +req.query.offset;
	var n = +req.query.n;
	db.listVisitsForPatient(conn, patientId, offset, n, cb);
});

reg("list_iyakuhin_by_patient", function(conn, req, res, cb){ // listIyakuhinByPatient
	var patientId = +req.query.patient_id;
	db.listIyakuhinByPatient(conn, patientId, cb);
});

reg("count_visits_by_iyakuhincode", function(conn, req, res, cb){ // countVisitsByIyakuhincode
	var patientId = +req.query.patient_id;
	var iyakuhincode = +req.query.iyakuhincode;
	db.countVisitsByIyakuhincode(conn, patientId, iyakuhincode, cb);
});

reg("list_full_visits_by_iyakuhincode", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	var iyakuhincode = +req.query.iyakuhincode;
	var offset = +req.query.offset;
	var n = +req.query.n;
	db.listFullVisitsByIyakuhincode(conn, patientId, iyakuhincode, offset, n, cb);
});

reg("find_pharma_drug", function(conn, req, res, cb){
	var iyakuhincode = +req.query.iyakuhincode;
	db.findPharmaDrug(conn, iyakuhincode, cb);
});

reg("presc_done", function(conn, req, res, done){
	var visitId = +req.body.visit_id;
	db.prescDone(conn, visitId, done);
});

reg("get_drug", function(conn, req, res, cb){
	var drugId = +req.query.drug_id;
	db.getDrug(conn, drugId, cb);
});

reg("enter_payment", function(conn, req, res, done){
	var payment = req.body;
	db.insertPayment(conn, payment, done);
});

reg("list_payment", function(conn, req, res, cb){
	var visitId = +req.query.visit_id;
	db.listPayment(conn, visitId, cb);
});

reg("finish_cashier", function(conn, req, res, done){
	var visitId = +req.body.visit_id;
	var amount = +req.body.amount;
	var paytime = req.body.paytime;
	mData.finishCashier(conn, visitId, amount, paytime, done);
});

// reception

reg("enter_pharma_queue", function(conn, req, res, done){
	var queue = req.body;
	db.insertPharmaQueue(conn, queue, done);
});

reg("list_full_wqueue", function(conn, req, res, cb){
	db.listFullWqueue(conn, cb);
});

reg("update_patient", function(conn, req, res, done){
	var patient = req.body;
	db.updatePatient(conn, patient, done);
});

reg("get_shahokokuho", function(conn, req, res, cb){
	var shahokokuhoId = +req.query.shahokokuho_id;
	db.getShahokokuho(conn, shahokokuhoId, cb);
});

reg("find_shahokokuho", function(conn, req, res, cb){
	var shahokokuhoId = +req.query.shahokokuho_id;
	db.findShahokokuho(conn, shahokokuhoId, cb);
});

reg("enter_shahokokuho", function(conn, req, res, cb){
	var shahokokuho = req.body;
	db.insertShahokokuho(conn, shahokokuho, cb);
});

reg("update_shahokokuho", function(conn, req, res, done){
	var shahokokuho = req.body;
	db.updateShahokokuho(conn, shahokokuho, done);
});

reg("delete_shahokokuho", function(conn, req, res, done){
	var shahokokuhoId = +req.body.shahokokuho_id;
	conti.exec([
		function(done){
			db.listVisitsForShahokokuho(conn, shahokokuhoId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				if( result.length > 0 ){
					done("この社保・国保は使用されているので、削除できません。");
					return;
				}
				done();
			});
		},
		function(done){
			db.deleteShahokokuho(conn, shahokokuhoId, done);
		}
	], function(err){
		if( err ){
			done(err);
			return;
		}
		done();
	});
});

reg("list_shahokokuho", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	db.listShahokokuho(conn, patientId, cb);
});

reg("get_koukikourei", function(conn, req, res, cb){
	var koukikoureiId = +req.query.koukikourei_id;
	db.getKoukikourei(conn, koukikoureiId, cb);
});

reg("find_koukikourei", function(conn, req, res, cb){
	var koukikoureiId = +req.query.koukikourei_id;
	db.findKoukikourei(conn, koukikoureiId, cb);
});

reg("enter_koukikourei", function(conn, req, res, cb){
	var koukikourei = req.body;
	db.insertKoukikourei(conn, koukikourei, cb);
});

reg("update_koukikourei", function(conn, req, res, done){
	var koukikourei = req.body;
	db.updateKoukikourei(conn, koukikourei, done);
});

reg("delete_koukikourei", function(conn, req, res, done){
	var koukikoureiId = +req.body.koukikourei_id;
	conti.exec([
		function(done){
			db.listVisitsForKoukikourei(conn, koukikoureiId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				if( result.length > 0 ){
					done("この後期高齢は使用されているので、削除できません。");
					return;
				}
				done();
			});
		},
		function(done){
			db.deleteKoukikourei(conn, koukikoureiId, done);
		}
	], function(err){
		if( err ){
			done(err);
			return;
		}
		done();
	});
});

reg("list_koukikourei", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	db.listKoukikourei(conn, patientId, cb);
});

reg("get_roujin", function(conn, req, res, cb){
	var roujinId = +req.query.roujin_id;
	db.getRoujin(conn, roujinId, cb);
});

reg("find_roujin", function(conn, req, res, cb){
	var roujinId = +req.query.roujin_id;
	db.findRoujin(conn, roujinId, cb);
});

reg("enter_roujin", function(conn, req, res, cb){
	var roujin = req.body;
	db.insertRoujin(conn, roujin, cb);
});

reg("update_roujin", function(conn, req, res, done){
	var roujin = req.body;
	db.updateRoujin(conn, roujin, done);
});

reg("delete_roujin", function(conn, req, res, done){
	var roujinId = +req.body.roujin_id;
	conti.exec([
		function(done){
			db.listVisitsForRoujin(conn, roujinId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				if( result.length > 0 ){
					done("この老人保険は使用されているので、削除できません。");
					return;
				}
				done();
			});
		},
		function(done){
			db.deleteRoujin(conn, roujinId, done);
		}
	], function(err){
		if( err ){
			done(err);
			return;
		}
		done();
	});
});

reg("list_roujin", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	db.listRoujin(conn, patientId, cb);
});

reg("get_kouhi", function(conn, req, res, cb){
	var kouhiId = +req.query.kouhi_id;
	db.getKouhi(conn, kouhiId, cb);
});

reg("find_kouhi", function(conn, req, res, cb){
	var kouhiId = +req.query.kouhi_id;
	db.findKouhi(conn, kouhiId, cb);
});

reg("enter_kouhi", function(conn, req, res, cb){
	var kouhi = req.body;
	db.insertKouhi(conn, kouhi, cb);
});

reg("update_kouhi", function(conn, req, res, done){
	var kouhi = req.body;
	db.updateKouhi(conn, kouhi, done);
});

reg("delete_kouhi", function(conn, req, res, done){
	var kouhiId = +req.body.kouhi_id;
	conti.exec([
		function(done){
			db.listVisitsForKouhi(conn, kouhiId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				if( result.length > 0 ){
					done("この公費は使用されているので、削除できません。");
					return;
				}
				done();
			});
		},
		function(done){
			db.deleteKouhi(conn, kouhiId, done);
		}
	], function(err){
		if( err ){
			done(err);
			return;
		}
		done();
	});
});

reg("list_kouhi", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	db.listKouhi(conn, patientId, cb);
});

reg("list_all_hoken", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	var hoken = {};
	conti.exec([
		function(done){
			db.listShahokokuho(conn, patientId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				hoken.shahokokuho_list = result;
				done();
			});
		},
		function(done){
			db.listKoukikourei(conn, patientId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				hoken.koukikourei_list = result;
				done();
			});
		},
		function(done){
			db.listRoujin(conn, patientId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				hoken.roujin_list = result;
				done();
			});
		},
		function(done){
			db.listKouhi(conn, patientId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				hoken.kouhi_list = result;
				done();
			});
		},
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, hoken);
	});
});

reg("list_recently_entered_patients", function(conn, req, res, cb){
	var n = +req.query.n;
	if( !n ){
		n = 12;
	}
	db.listRecentlyEnteredPatients(conn, n, cb);
});

reg("find_patient", function(conn, req, res, cb){
	var patientId = +req.query.patient_id;
	db.findPatient(conn, patientId, cb);
});

reg("delete_patient", function(conn, req, res, done){
	var patientId = +req.body.patient_id;
	db.deletePatient(conn, patientId, done);
});

reg("list_visits_by_date", function(conn, req, res, cb){
	var at = req.query.at;
	db.listVisitsByDate(conn, at, cb);
});





