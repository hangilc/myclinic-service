describe("Testing payment", function(){
	it("list order", function(done){
		var patient = helper.mockPatient();
		var visit = helper.mockVisit();
		var payment1 = {
			amount: 100,
			paytime: "2016-11-23 21:40:00"
		};
		var payment2 = {
			amount: 100,
			paytime: "2016-11-23 21:44:00"
		};
		var payments;
		conti.exec([
			function(done){
				service.enterPatient(patient, done);
			}, 
			function(done){
				visit.patient_id = patient.patient_id;
				service.enterVisit(visit, done);
			},
			function(done){
				var payments = [payment1, payment2];
				payments.forEach(function(pay){
					pay.visit_id = visit.visit_id;
				});
				conti.forEach(payments, function(pay, done){
					service.enterPayment(pay, done);
				}, done);
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
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(payments).deep.equal([payment2, payment1]);
				done();
			} catch(ex){
				done(ex);
			}
		});
	});
});
