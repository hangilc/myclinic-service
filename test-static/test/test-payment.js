"use strict";

describe("Testing payment", function(){
	it("list order", function(done){
		var visitId = 1;
		var payment1 = {
			visit_id: visitId,
			amount: 100,
			paytime: "2016-11-23 21:40:00"
		};
		var payment2 = {
			visit_id: visitId,
			amount: 100,
			paytime: "2016-11-23 21:44:00"
		};
		var payments;
		conti.exec([
			function(done){
				service.enterPayment(payment1.visit_id, payment1.amount, payment1.paytime, done);
			},
			function(done){
				service.enterPayment(payment2.visit_id, payment2.amount, payment2.paytime, done);
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
			}
		], function(err){
			if( err ){
				done(err);
				return;
			}
			expect(payments).eql([payment2, payment1]);
			done();
		});
	});
});
