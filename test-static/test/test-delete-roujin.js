describe("Testing delete roujin", function(){
	it("simple", function(done){
		var roujin = helper.mockRoujin();
		var foundRoujin;
		conti.exec([
			function(done){
				roujin.patient_id = 0;
				service.enterRoujin(roujin, done);
			},
			function(done){
				service.deleteRoujin(roujin.roujin_id, done);
			},
			function(done){
				service.findRoujin(roujin.roujin_id, function(err, result){
					if( err ){
						done(err);
						return;
					}
					foundRoujin = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(foundRoujin).null;
				done();
			} catch(ex){
				done(ex);
			}
		});
	});

	it("with visit", function(done){
		var patient = helper.mockPatient();
		var roujin = helper.mockRoujin();
		var visit = helper.mockVisit();
		conti.exec([
			function(done){
				service.enterPatient(patient, done);
			},
			function(done){
				roujin.patient_id = patient.patient_id;
				service.enterRoujin(roujin, done);
			},
			function(done){
				visit.patient_id = patient.patient_id;
				visit.roujin_id = roujin.roujin_id;
				service.enterVisit(visit, done);
			},
			function(done){
				service.deleteRoujin(roujin.roujin_id, done);
			}
		], function(err){
			if( err ){
				if( err === "この老人保険は使用されているので、削除できません。" ){
					done();
				} else {
					done(err);
				}
				return;
			}
			done("inappropriate roujin deletion");
		});
	});
});
