describe("Testing finish cashier", function(){
	it("one payment", function(done){
		var patient = helper.mockPatient();
		var visit = helper.mockVisit();
		var wqueue = { wait_state: mConsts.WqueueStateWaitCashier };
		var amount = 1000;
		var paytime = "2016-11-20 22:02:03";
		var payments;
		var finishedWqueue;
		conti.exec([
			function(done){
				service.insertPatient(patient, done);
			},
			function(done){
				visit.patient_id = patient.patient_id;
				service.insertVisit(visit, done); 
			},
			function(done){
				wqueue.visit_id = visit.visit_id;
				service.insertWqueue(wqueue, done);
			},
			function(done){
				service.finishCashier(visit.visit_id, amount, paytime, done);
			},
			function(done){
				service.listPayments(visit.visit_id, function(err, result){
					if( err ){
						done(err);
						return;
					}
					payments = result;
					done();
				});
			},
			function(done){
				service.findWqueue(visit.visit_id, function(err, result){
					if( err ){
						done(err);
						return;
					}
					finishedWqueue = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(payments).deep.equal([{
					visit_id: visit.visit_id,
					amount: amount,
					paytime: paytime	
				}]);
				expect(finishedWqueue).equal(null);
				done();
			} catch(ex){
				done(ex);
			}
		});
	});

	it("two payments", function(done){
		var patient = helper.mockPatient();
		var visitId;
		var at = moment().format("YYYY-MM-DD HH:mm:ss");
		var payment1 = {
			amount: 1000,
			paytime: "2016-11-27 17:40:23"
		};
		var payment2 = {
			amount: 2000,
			paytime: "2016-11-27 17:50:23"
		};
		var finalWqueue;
		conti.exec([
			function(done){
				service.insertPatient(patient, done);
			},
			function(done){
				service.startVisit(patient.patient_id, at, function(err, result){
					if( err ){
						done(err);
						return;
					}
					visitId = result;
					payment1.visit_id = visitId;
					payment2.visit_id = visitId;
					done();
				});
			},
			function(done){
				service.startExam(visitId, done);
			},
			function(done){
				service.endExam(visitId, payment1.amount, done);
			},
			function(done){
				service.finishCashier(visitId, payment1.amount, payment1.paytime, done);
			},
			function(done){
				service.endExam(visitId, payment2.amount, done);
			},
			function(done){
				service.finishCashier(visitId, payment2.amount, payment2.paytime, done);
			},
			function(done){
				service.listPayments(visitId, function(err, result){
					if( err ){
						done(err);
						return;
					}
					payments = result;
					done();
				});
			},
			function(done){
				service.findWqueue(visitId, function(err, result){
					if( err ){
						done(err);
						return;
					}
					finalWqueue = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(payments).deep.equal([payment2, payment1]);
				expect(finalWqueue).null;
				done();
			} catch(ex){
				done(ex);
			}
		});
	});

	it("two payments with drug", function(done){
		var patient = helper.mockPatient();
		var visitId;
		var at = moment().format("YYYY-MM-DD HH:mm:ss");
		var payment1 = {
			amount: 1000,
			paytime: "2016-11-27 17:40:23"
		};
		var drug = helper.mockDrug();
		var payment2 = {
			amount: 2000,
			paytime: "2016-11-27 17:50:23"
		};
		var finalWqueue;
		conti.exec([
			function(done){
				service.insertPatient(patient, done);
			},
			function(done){
				service.startVisit(patient.patient_id, at, function(err, result){
					if( err ){
						done(err);
						return;
					}
					visitId = result;
					payment1.visit_id = visitId;
					payment2.visit_id = visitId;
					done();
				});
			},
			function(done){
				service.startExam(visitId, done);
			},
			function(done){
				service.endExam(visitId, payment1.amount, done);
			},
			function(done){
				service.finishCashier(visitId, payment1.amount, payment1.paytime, done);
			},
			function(done){
				drug.visit_id = visitId;
				service.enterDrug(drug, done);
			},
			function(done){
				service.endExam(visitId, payment2.amount, done);
			},
			function(done){
				service.finishCashier(visitId, payment2.amount, payment2.paytime, done);
			},
			function(done){
				service.listPayments(visitId, function(err, result){
					if( err ){
						done(err);
						return;
					}
					payments = result;
					done();
				});
			},
			function(done){
				service.findWqueue(visitId, function(err, result){
					if( err ){
						done(err);
						return;
					}
					finalWqueue = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(payments).deep.equal([payment2, payment1]);
				expect(finalWqueue).not.null;
				expect(finalWqueue.wait_state).equal(mConsts.WqueueStateWaitDrug);
				done();
			} catch(ex){
				done(ex);
			}
		});
	});
});
