window.service = require("myclinic-service-api");
window.conti = require("conti");
var mockIndex = 1;
window.getMockIndex = function(){
	return mockIndex++;
};
window.expect = require("chai").expect;
