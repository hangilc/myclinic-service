describe("Testing delete shahokokuho", function(){
	it("simple", function(done){
		var shahokokuho = helper.mockShahokokuho();
		var foundShahokokuho;
		conti.exec([
			function(done){
				shahokokuho.patient_id = 0;
				service.enterShahokokuho(shahokokuho, done);
			},
			function(done){
				service.deleteShahokokuho(shahokokuho.shahokokuho_id, done);
			},
			function(done){
				service.findShahokokuho(shahokokuho.shahokokuho_id, function(err, result){
					if( err ){
						done(err);
						return;
					}
					foundShahokokuho = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(foundShahokokuho).null;
				done();
			} catch(ex){
				done(ex);
			}
		});
	});

	it("with visit", function(done){
		var patient = helper.mockPatient();
		var shahokokuho = helper.mockShahokokuho();
		var visit = helper.mockVisit();
		conti.exec([
			function(done){
				service.enterPatient(patient, done);
			},
			function(done){
				shahokokuho.patient_id = patient.patient_id;
				service.enterShahokokuho(shahokokuho, done);
			},
			function(done){
				visit.patient_id = patient.patient_id;
				visit.shahokokuho_id = shahokokuho.shahokokuho_id;
				service.enterVisit(visit, done);
			},
			function(done){
				service.deleteShahokokuho(shahokokuho.shahokokuho_id, done);
			}
		], function(err){
			if( err ){
				if( err === "この社保・国保は使用されているので、削除できません。" ){
					done();
				} else {
					done(err);
				}
				return;
			}
			done("inappropriate shahokokuho deletion");
		});
	});
});
