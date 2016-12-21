describe("Testing delete koukikourei", function(){
	it("simple", function(done){
		var koukikourei = helper.mockKoukikourei();
		var foundKoukikourei;
		conti.exec([
			function(done){
				koukikourei.patient_id = 0;
				service.enterKoukikourei(koukikourei, done);
			},
			function(done){
				service.deleteKoukikourei(koukikourei.koukikourei_id, done);
			},
			function(done){
				service.findKoukikourei(koukikourei.koukikourei_id, function(err, result){
					if( err ){
						done(err);
						return;
					}
					foundKoukikourei = result;
					done();
				});
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			try {
				expect(foundKoukikourei).null;
				done();
			} catch(ex){
				done(ex);
			}
		});
	});

	it("with visit", function(done){
		var patient = helper.mockPatient();
		var koukikourei = helper.mockKoukikourei();
		var visit = helper.mockVisit();
		conti.exec([
			function(done){
				service.enterPatient(patient, done);
			},
			function(done){
				koukikourei.patient_id = patient.patient_id;
				service.enterKoukikourei(koukikourei, done);
			},
			function(done){
				visit.patient_id = patient.patient_id;
				visit.koukikourei_id = koukikourei.koukikourei_id;
				service.enterVisit(visit, done);
			},
			function(done){
				service.deleteKoukikourei(koukikourei.koukikourei_id, done);
			}
		], function(err){
			if( err ){
				if( err === "この後期高齢は使用されているので、削除できません。" ){
					done();
				} else {
					done(err);
				}
				return;
			}
			done("inappropriate koukikourei deletion");
		});
	});
});
