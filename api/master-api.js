var MasterMap = require("../lib/master-map");
var NameMap = require("../lib/name-map");

exports.setup = function(app, dbConfig){
	app.post("/batch-resolve-shinryou-names-at", function(req, res){
		var names = req.body.names;
		var at = req.body.at.slice(0, 10);
		var resultMap = {};
		var i, name, code;
		for(i=0;i<names.length;i++){
			name = names[i];
			code = NameMap.shinryouNameToCode(name);
			if( code === 0 ){
				resultMap[name] = code;
			} else if( code ){
				code = MasterMap.mapShinryouMaster(code, at);
				resultMap[name] = code;
			} else {
				res.send(400).send("診療コードを見つけられませんでした: " + name);
				return;
			}
		}
		res.json(resultMap);
	});
};
