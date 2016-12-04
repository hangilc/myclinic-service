var test = require("./test");

describe("Testing /batch-resolve-shinryou-names-at", function(){
	it("positive", function(done){
		var data = {
			names: ["再診", "外来管理加算"],
			at: "2016-12-04"
		};
		test.request("/batch-resolve-shinryou-names-at", data, "POST", function(err, result){
			if( err ){
				done(err);
				return;
			}
			expect(result).deep.equal({
				"再診": 112007410,
				"外来管理加算": 112011010
			});
			done();
		});
	});
});
