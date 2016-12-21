var gMockIndex = 1;

function getMockIndex(){
	return gMockIndex++;
}

exports.getMockIndex = getMockIndex;

exports.mockPatient = function(obj){
	var mockId = getMockIndex();
	var mock = {
		last_name: "last_name_" + mockId,
		first_name: "first_name_" + mockId,
		last_name_yomi: "last_name_yomi_" + mockId,
		first_name_yomi: "first_name_yomi_" + mockId,
		birth_day: "2006-03-12",
		sex: "M",
		address: "address_" + mockId,
		phone: "phone_" + mockId
	};
	if( obj ){
		Object.keys(obj).forEach(function(key){
			mock[key] = obj[key];
		});
	}
	return mock
};

exports.mockVisit = function(obj){
	var mock = {
		patient_id: 0,
		v_datetime: "2016-11-27 14:06:12",
		shahokokuho_id: 0,
		koukikourei_id: 0,
		roujin_id: 0,
		kouhi_1_id: 0,
		kouhi_2_id: 0,
		kouhi_3_id: 0
	};
	if( obj ){
		Object.keys(obj).forEach(function(key){
			mock[key] = obj[key];
		});
	}
	return mock;
};

exports.mockDrug = function(obj){
	var mock = {
		visit_id: 0,
		d_iyakuhincode: 0,
		d_amount: "",
		d_usage: "",
		d_days: 0,
		d_category: 0,
		d_shuukeisaki: 0,
		d_prescribed: 0
	};
	if( obj ){
		Object.keys(obj).forEach(function(key){
			mock[key] = obj[key];
		});
	}
	return mock;
};

exports.mockShahokokuho = function(obj){
	var mockId = getMockIndex();
	var mock = {
		hokensha_bangou: 1234,
		hihokensha_kigou: "hihokensha_kigou_" + mockId,
		hihokensha_bangou: "hihokensha_bangou_" + mockId,
		honnin: 0,
		valid_from: "2016-12-01",
		valid_upto: "0000-00-00",
		kourei: 0
	};
	if( obj ){
		Object.keys(obj).forEach(function(key){
			mock[key] = obj[key];
		});
	}
	return mock;
};

exports.mockKoukikourei = function(obj){
	var mockId = getMockIndex();
	var mock = {
		hokensha_bangou: "hokensha_bangou_" + mockId,
		hihokensha_bangou: "hihokensha_bangou_" + mockId,
		futan_wari: 1,
		valid_from: "2016-12-01",
		valid_upto: "0000-00-00"
	};
	if( obj ){
		Object.keys(obj).forEach(function(key){
			mock[key] = obj[key];
		});
	}
	return mock;
};

exports.mockRoujin = function(obj){
	var mockId = getMockIndex();
	var mock = {
		shichouson: 123,
		jukyuusha: 456,
		futan_wari: 1,
		valid_from: "2016-12-01",
		valid_upto: "0000-00-00"
	};
	if( obj ){
		Object.keys(obj).forEach(function(key){
			mock[key] = obj[key];
		});
	}
	return mock;
};

exports.mockKouhi = function(obj){
	var mockId = getMockIndex();
	var mock = {
		futansha: 123,
		jukyuusha: 456,
		valid_from: "2016-12-01",
		valid_upto: "0000-00-00"
	};
	if( obj ){
		Object.keys(obj).forEach(function(key){
			mock[key] = obj[key];
		});
	}
	return mock;
};


