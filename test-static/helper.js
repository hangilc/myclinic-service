var gMockIndex = 1;

exports.getMockIndex = function(){
	return gMockIndex++;
};

exports.mockPatient = function(obj){
	var mock = {
		last_name: "last_name_" + gMockIndex++,
		first_name: "first_name_" + gMockIndex++,
		last_name_yomi: "last_name_yomi_" + gMockIndex++,
		first_name_yomi: "first_name_yomi_" + gMockIndex++,
		birth_day: "2006-03-12",
		sex: "M",
		address: "address_" + gMockIndex++,
		phone: "phone_" + gMockIndex++
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
