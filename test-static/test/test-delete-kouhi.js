describe("Testing delete kouhi", function(){
	it("simple", function(done){
		var kouhi = helper.mockKouhi();
		var foundKouhi;
		conti.exec([
			function(done){
				kouhi.patient_id = 0;
				service.enterKouhi(kouhi, done);
			},
			function(done){
				service.deleteKouhi(kouhi.kouhi_id, done);
			},
			function(done){
				service.findKouhi(kouhi.kouhi_id, function(err, result){
					if( err ){
						done(err);
						return;
					}
					foundKouhi = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(foundKouhi).null;
				done();
			} catch(ex){
				done(ex);
			}
		});
	});

	it("with visit (kohi_1)", function(done){
		var patient = helper.mockPatient();
		var kouhi = helper.mockKouhi();
		var visit = helper.mockVisit();
		conti.exec([
			function(done){
				service.enterPatient(patient, done);
			},
			function(done){
				kouhi.patient_id = patient.patient_id;
				service.enterKouhi(kouhi, done);
			},
			function(done){
				visit.patient_id = patient.patient_id;
				visit.kouhi_1_id = kouhi.kouhi_id;
				service.enterVisit(visit, done);
			},
			function(done){
				service.deleteKouhi(kouhi.kouhi_id, done);
			}
		], function(err){
			if( err ){
				if( err === "この公費は使用されているので、削除できません。" ){
					done();
				} else {
					done(err);
				}
				return;
			}
			done("inappropriate kouhi deletion");
		});
	});

	it("with visit (kouhi_2)", function(done){
		var patient = helper.mockPatient();
		var kouhi = helper.mockKouhi();
		var visit = helper.mockVisit();
		conti.exec([
			function(done){
				service.enterPatient(patient, done);
			},
			function(done){
				kouhi.patient_id = patient.patient_id;
				service.enterKouhi(kouhi, done);
			},
			function(done){
				visit.patient_id = patient.patient_id;
				visit.kouhi_2_id = kouhi.kouhi_id;
				service.enterVisit(visit, done);
			},
			function(done){
				service.deleteKouhi(kouhi.kouhi_id, done);
			}
		], function(err){
			if( err ){
				if( err === "この公費は使用されているので、削除できません。" ){
					done();
				} else {
					done(err);
				}
				return;
			}
			done("inappropriate kouhi deletion");
		});
	});

	it("with visit (kouhi_2)", function(done){
		var patient = helper.mockPatient();
		var kouhi = helper.mockKouhi();
		var visit = helper.mockVisit();
		conti.exec([
			function(done){
				service.enterPatient(patient, done);
			},
			function(done){
				kouhi.patient_id = patient.patient_id;
				service.enterKouhi(kouhi, done);
			},
			function(done){
				visit.patient_id = patient.patient_id;
				visit.kouhi_1_id = kouhi.kouhi_id;
				service.enterVisit(visit, done);
			},
			function(done){
				service.deleteKouhi(kouhi.kouhi_id, done);
			}
		], function(err){
			if( err ){
				if( err === "この公費は使用されているので、削除できません。" ){
					done();
				} else {
					done(err);
				}
				return;
			}
			done("inappropriate kouhi deletion");
		});
	});
});
