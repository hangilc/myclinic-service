"use strict";

var fs = require("fs");

module.exports = {
	dbConfig: {
		host: "localhost",
	    user: process.env.MYCLINIC_DB_TEST_USER,
	    password: process.env.MYCLINIC_DB_TEST_PASS,
	    database: "myclinic_test",
	    dateStrings: true
	},
	masterMap: __dirname + "/service-master-map.txt",
	nameMap: __dirname + "/service-master-name.txt",
	houkatsuList: JSON.parse(fs.readFileSync(__dirname + "/service-rcpt-houkatsu.json", "utf-8")).houkatsu
};