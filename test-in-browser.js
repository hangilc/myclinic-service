var express = require("express");
var Config = require("myclinic-config");

var app = express();
app.use(express.static("test-static"));
var config = Config.read(process.env.MYCLINIC_CONFIG);
console.log(config);

var port = 10000;
app.listen(port, function(){
	console.log("test server listening to " + port);
	console.log("open http://localhost:10000/index.html in browser");
});

