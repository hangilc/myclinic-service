function iterExec(i, funs, done){
	if( i >= funs.length ){
		done();
		return;
	}
	var f = funs[i];
	try {
		f(function(err){
			if( err ){
				done(err);
				return;
			}
			iterExec(i+1, funs, done);
		});
	} catch(ex){
		done(ex);
	}
}

exports.exec = function(funs, done){
	funs = funs.slice();
	iterExec(0, funs, done);
};

function iterForEach(i, arr, fn, done){
	if( i >= arr.length ){
		done();
		return;
	}
	try {
		fn(arr[i], function(err){
			if( err ){
				done(err);
				return;
			}
			iterForEach(i+1, arr, fn, done);
		})
	} catch(ex){
		done(ex);
	}
}

exports.forEach = function(arr, fn, done){
	arr = arr.slice();
	iterForEach(0, arr, fn, done);
};
