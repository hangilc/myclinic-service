var http = require("http");
var Url = require("url");
var contentType = require("content-type");

function Requester(url){
	if( typeof url === "string" ){
		url = Url.parse(url);
	}
	this.url = url;
	var prefix = url.pathname;
	if( prefix.length >= 1 && prefix[prefix.length-1] === "/" ){
		this.prefix = prefix.substring(0, prefix.length - 1);
	} else {
		this.prefix = prefix;
	}
}

Requester.prototype.request = function(path, data, method, cb){
	var url = this.url;
	if( method === "GET" && data && data !== {} ){
		path += "?" + querystring.stringify(data);
	}
	if( path[0] !== "/" ){
		path = "/" + path;
	}
	var headers = {};
	var body = "";
	if( method !== "GET" && data && data !== {} ){
		body = JSON.stringify(data);
		headers["Content-Type"] = "application/json";
	}
	var opt = {
		hostname: url.hostname,
		port: url.port,
		path: path,
		method: method,
		headers: headers
	};
	var req = http.request(opt, function(res){
		res.setEncoding("utf8");
		var chunks = [];
		res.on("error", function(err){
			cb(err);
		});
		res.on("data", function(chunk){
			chunks.push(chunk);
		});
		res.on("end", function(){
			var resultChunk = chunks.join("");
			if( res.statusCode === 200 ){
				var type = contentType.parse(req).type;
				if( type === "application/json" ){
					cb(undefined, JSON.parse(resultChunk));
				} else {
					cb(undefined, resultChunk);
				}
			} else {
				cb("status-code: " + res.statusCode, resultChunk);
			}
		});
	});
	req.on("error", function(err){
		cb(err);
	});
	req.write(body);
	req.end();
};

module.exports = Requester;

