"use strict";

var moment = require("moment");
var mConsts = require("myclinic-consts");

function repeat(ch, n){
    var parts = [], i;
    for(i=0;i<n;i++){
        parts.push(ch);
    }
    return parts.join("");
}

exports.padNumber = function(num, nDigits){
    var s = "" + num;
    if( s.length < nDigits ){
        return repeat("0", nDigits-s.length) + s;
    } else {
        return s;
    }
};

exports.formatNumber = function(num){
	return Number(num).toLocaleString();
};

exports.toSqlDate = function(m){
	m = moment(m);
	return m.format("YYYY-MM-DD");
}

exports.todayAsSqldate = function(){
	return exports.toSqlDate(moment());
};

exports.toSqlDatetime = function(m){
	m = moment(m);
	return m.format("YYYY-MM-DD HH:mm:ss");
};

exports.nowAsSqlDatetime = function(m){
	return exports.toSqlDatetime(moment());
}

function assign2(dst, src){
	if( src === null || src === undefined ){
		return dst;
	}
	Object.keys(src).forEach(function(key){
		dst[key] = src[key];
	});
	return dst;
}

exports.assign = function(dst, src){
	var args = Array.prototype.slice.call(arguments, 1);
	var i;
	for(i=0;i<args.length;i++){
		dst = assign2(dst, args[i]);
	}
	return dst;
};

exports.calcAge = function(birthday, at){
    if( !moment.isMoment(birthday) ){
        birthday = moment(birthday);
    }
    if( !moment.isMoment(at) ){
    	at = moment(at);
    }
    return at.diff(birthday, "years");
};

exports.sexToKanji = function(sex){
	switch(sex){
		case "M": return "男";
		case "F": return "女";
		default: return "??";
	}
};

exports.hokenRep = function(visit){
	var terms = [];
	if( visit.shahokokuho ){
		var shahokokuho = visit.shahokokuho;
		terms.push(exports.shahokokuhoRep(shahokokuho.hokensha_bangou));
		if( shahokokuho.kourei > 0 ){
			terms.push("高齢" + shahokokuho.kourei + "割");
		}
	} else if( visit.shahokokuho_id != 0 ){
		terms.push("orphan shahokokuho_id (" + visit.shahokokuho_id + ")");
	}
	if( visit.koukikourei ){
		var koukikourei = visit.koukikourei;
		terms.push(exports.koukikoureiRep(koukikourei.futan_wari));
	} else if( visit.koukikourei_id != 0 ){
		terms.push("orphan koukikourei_id (" + visit.koukikourei_id + ")");
	}
	if( visit.roujin ){
		var roujin = visit.roujin;
		terms.push(exports.roujinRep(roujin.futan_wari));
	} else if( visit.roujin_id != 0 ){
		terms.push("orphan roujin_id (" + visit.roujin_id + ")");
	}
	visit.kouhi_list.forEach(function(kouhi){
		terms.push(exports.kouhiRep(kouhi.futansha));
	});
	return terms.length > 0 ? terms.join("・") : "保険なし";
}

exports.shahokokuhoRep = function(hokenshaBangou){
	var bangou = parseInt(hokenshaBangou, 10);
	if( bangou <= 9999 )
		return "政管健保";
	if( bangou <= 999999 )
		return "国保";
	switch(Math.floor(bangou/1000000)){
		case 1: return "協会けんぽ";
		case 2: return "船員";
		case 3: return "日雇一般";
		case 4: return "日雇特別";
		case 6: return "組合健保";
		case 7: return "自衛官";
		case 31: return "国家公務員共済";
		case 32: return "地方公務員共済";
		case 33: return "警察公務員共済";
		case 34: return "学校共済";
		case 63: return "特定健保退職";
		case 67: return "国保退職";
		case 72: return "国家公務員共済退職";
		case 73: return "地方公務員共済退職";
		case 74: return "警察公務員共済退職";
		case 75: return "学校共済退職";
		default: return "不明";
	}
}

exports.koukikoureiRep = function(futan_wari){
	return "後期高齢" + futan_wari + "割"
}

exports.roujinRep = function(futan_wari){
	return "老人" + futan_wari + "割";
}

exports.kouhiRep = function(futansha_bangou){
	futansha_bangou = parseInt(futansha_bangou, 10);
	if (Math.floor(futansha_bangou / 1000000)  == 41)
		return "マル福";
	else if (Math.floor(futansha_bangou / 1000) == 80136)
		return "マル障（１割負担）";
	else if (Math.floor(futansha_bangou / 1000) == 80137)
		return "マル障（負担なし）";
	else if (Math.floor(futansha_bangou / 1000) == 81136)
		return "マル親（１割負担）";
	else if (Math.floor(futansha_bangou / 1000) == 81137)
		return "マル親（負担なし）";
	else if (Math.floor(futansha_bangou / 1000000) == 88)
		return "マル乳";
	else
		return "公費負担";
}

exports.drugRep = function(drug){
	var category = parseInt(drug.d_category, 10);
	switch(category){
		case mConsts.DrugCategoryNaifuku:
			return drug.name + " " + drug.d_amount + drug.unit + " " + drug.d_usage + 
				" " + drug.d_days + "日分";
		case mConsts.DrugCategoryTonpuku:
			return drug.name + " １回 " + drug.d_amount + drug.unit + " " + drug.d_usage +
				" " + drug.d_days + "回分";
		case mConsts.DrugCategoryGaiyou:
			return drug.name + " " + drug.d_amount + drug.unit + " " + drug.d_usage;
		default:
			return drug.name + " " + drug.d_amount + drug.unit;
	}
};

exports.conductDrugRep = function(drug){
  return drug.name + " " + drug.amount + drug.unit;
};

exports.conductKindToKanji = function(kind) {
    kind = parseInt(kind, 10);
    switch (kind) {
        case mConsts.ConductKindHikaChuusha:
            return "皮下・筋肉注射";
        case mConsts.ConductKindJoumyakuChuusha:
            return "静脈注射";
        case mConsts.ConductKindOtherChuusha:
            return "その他注射";
        case mConsts.ConductKindGazou:
            return "画像";
        default:
            return "不明";
    }
};

exports.conductKizaiRep = function(kizai){
	return kizai.name + " " + kizai.amount + kizai.unit;
};

exports.diseaseFullName = function(disease) {
    var name = (disease ? disease.name : ""), pre = "", post = "";
    disease.adj_list.forEach(function (a) {
        if (mConsts.SmallestPostfixShuushokugoCode > a.shuushokugocode) {
            pre += a.name;
        } else {
            post += a.name;
        }
    });
    return pre + name + post;
};

exports.diseaseEndReasonToKanji = function(reason){
	switch(reason){
		case mConsts.DiseaseEndReasonNotEnded: return "継続";
		case mConsts.DiseaseEndReasonCured: return "治癒";
		case mConsts.DiseaseEndReasonStopped: return "中止";
		case mConsts.DiseaseEndReasonDead: return "死亡";
		default: return "不明";
	}
}

exports.wqueueStateToKanji = function(wqState) {
    var state = wqState - 0;
    if (state == mConsts.WqueueStateWaitExam) return "診待";
    if (state == mConsts.WqueueStateInExam) return "診中";
    if (state == mConsts.WqueueStateWaitCashier) return "会待";
    if (state == mConsts.WqueueStateWaitDrug) return "薬待";
    if (state == mConsts.WqueueStateWaitReExam) return "再待";
    if (state == mConsts.WqueueStateWaitAppointedExam) return "予待";
    if (state == mConsts.WqueueStateWaitReAppointedExam) return "予再";
    return "不明";
};

exports.wqueueStateToName = function(wqState){
    var state = wqState - 0;
    if (state == mConsts.WqueueStateWaitExam) return "waitExam";
    if (state == mConsts.WqueueStateInExam) return "inExam";
    if (state == mConsts.WqueueStateWaitCashier) return "waitCashier";
    if (state == mConsts.WqueueStateWaitDrug) return "waitDrug";
    if (state == mConsts.WqueueStateWaitReExam) return "waitReExam";
    if (state == mConsts.WqueueStateWaitAppointedExam) return "waitAppointedExam";
    if (state == mConsts.WqueueStateWaitReAppointedExam) return "waitReAppointedExam";
    return "unknown";
};

exports.meisaiSections = [
    "初・再診料", "医学管理等", "在宅医療", "検査", "画像診断",
    "投薬", "注射", "処置", "その他"       
];

exports.shuukeiToMeisaiSection = function(shuukeisaki){
	switch(shuukeisaki){
		case mConsts.SHUUKEI_SHOSHIN:
		case mConsts.SHUUKEI_SAISHIN_SAISHIN:
		case mConsts.SHUUKEI_SAISHIN_GAIRAIKANRI:
		case mConsts.SHUUKEI_SAISHIN_JIKANGAI:
		case mConsts.SHUUKEI_SAISHIN_KYUUJITSU:
		case mConsts.SHUUKEI_SAISHIN_SHINYA:
			return "初・再診料";
		case mConsts.SHUUKEI_SHIDO:
			return "医学管理等";
		case mConsts.SHUUKEI_ZAITAKU:
			return "在宅医療";
		case mConsts.SHUUKEI_KENSA:
			return "検査";
		case mConsts.SHUUKEI_GAZOSHINDAN:
			return "画像診断";
		case mConsts.SHUUKEI_TOYAKU_NAIFUKUTONPUKUCHOZAI:
		case mConsts.SHUUKEI_TOYAKU_GAIYOCHOZAI:
		case mConsts.SHUUKEI_TOYAKU_SHOHO:
		case mConsts.SHUUKEI_TOYAKU_MADOKU:
		case mConsts.SHUUKEI_TOYAKU_CHOKI:
			return "投薬";
		case mConsts.SHUUKEI_CHUSHA_SEIBUTSUETC:
		case mConsts.SHUUKEI_CHUSHA_HIKA:
		case mConsts.SHUUKEI_CHUSHA_JOMYAKU:
		case mConsts.SHUUKEI_CHUSHA_OTHERS:
			return "注射";
		case mConsts.SHUUKEI_SHOCHI:
			return "処置";
		case mConsts.SHUUKEI_SHUJUTSU_SHUJUTSU:
		case mConsts.SHUUKEI_SHUJUTSU_YUKETSU:
		case mConsts.SHUUKEI_MASUI:
		case mConsts.SHUUKEI_OTHERS:
		default: return "その他";
	}
}

exports.touyakuKingakuToTen = function(kingaku){
    if( kingaku <= 15 ){
        return 1;
    } else {
        return Math.ceil((kingaku - 15)/10 + 1);
    }
};

exports.shochiKingakuToTen = function(kingaku){
		if( kingaku <= 15 )
			return 0;
		else
			return Math.ceil((kingaku - 15)/10 + 1);
};

exports.kizaiKingakuToTen = function(kingaku){
    return Math.round(kingaku/10.0);
}

exports.calcRcptAge = function(bdYear, bdMonth, bdDay, atYear, atMonth){
    var age;
	age = atYear - bdYear;
	if( atMonth < bdMonth ){
		age -= 1;
	} else if( atMonth === bdMonth ){
		if( bdDay != 1 ){
			age -= 1;
		}
	}
	return age;
};

exports.calcShahokokuhoFutanWariByAge = function(age){
    if( age < 3 )
        return 2;
    else if( age >= 70 )
        return 2;
    else
        return 3;
};

exports.kouhiFutanWari = function(futanshaBangou){
    futanshaBangou = Number(futanshaBangou);
	if( Math.floor(futanshaBangou / 1000000) === 41 )
		return 1;
	else if( Math.floor(futanshaBangou / 1000) === 80136 )
		return 1;
	else if( Math.floor(futanshaBangou / 1000) === 80137 )
		return 0;
	else if( Math.floor(futanshaBangou / 1000) === 81136 )
		return 1;
	else if( Math.floor(futanshaBangou / 1000) === 81137 )
		return 0;
	else if( Math.floor(futanshaBangou / 1000000) === 88 )
		return 0;
	else{
		console.log("unknown kouhi futansha: " + futanshaBangou);
		return 0;
	}
};

exports.calcCharge = function(ten, futanWari){
    var c, r;
	c = parseInt(ten) * parseInt(futanWari);
	r = c % 10;
	if( r < 5 )
		c -= r;
	else
		c += (10 - r);
	return c;
}

