"use strict";

var mConsts = require("myclinic-consts");
var moment = require("moment");

// used
function shuukeiToMeisaiSection(shuukeisaki){
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
exports.shuukeiToMeisaiSection = shuukeiToMeisaiSection;

// used
exports.touyakuKingakuToTen = function(kingaku){
    if( kingaku <= 15 ){
        return 1;
    } else {
        return Math.ceil((kingaku - 15)/10 + 1);
    }
};

// used
exports.shochiKingakuToTen = function(kingaku){
		if( kingaku <= 15 )
			return 0;
		else
			return Math.ceil((kingaku - 15)/10 + 1);
};

// used
exports.kizaiKingakuToTen = function(kingaku){
    return Math.round(kingaku/10.0);
}

// used
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

// used
exports.calcShahokokuhoFutanWariByAge = function(age){
    if( age < 3 )
        return 2;
    else if( age >= 70 )
        return 2;
    else
        return 3;
};

// used
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

// used
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

exports.calcFutanWari = function(visit, patient){
	var futanWari, bd, at, age;
	futanWari = 10;
	if( visit.shahokokuho ){
		bd = moment(patient.birth_day);
		at = moment(visit.v_datetime);
		age = exports.calcRcptAge(bd.year(), bd.month()+1, bd.date(),
			at.year(), at.month()+1);
		futanWari = exports.calcShahokokuhoFutanWariByAge(age);
		if( visit.shahokokuho.kourei > 0 ){
			futanWari = visit.shahokokuho.kourei;
		}
	}
	if( visit.koukikourei ){
		futanWari = visit.koukikourei.futan_wari;
	}
	if( visit.roujin ){
		futanWari = visit.roujin.futan_wari;
	}
	visit.kouhi_list.forEach(function(kouhi){
		var kouhiFutanWari;
		kouhiFutanWari = exports.kouhiFutanWari(kouhi.futansha);
		if( kouhiFutanWari < futanWari ){
			futanWari = kouhiFutanWari;
		}
	});
	return futanWari;
};


