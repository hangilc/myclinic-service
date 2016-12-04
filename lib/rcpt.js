"use strict";

var moment = require("moment");
var mConsts = require("myclinic-consts");
var util = require("./rcpt-util");

var gHoukatsuList = [];

exports.setHoukatsuList = function(list, config){
	gHoukatsuList = list;
};

function RcptVisit(visit, patient){
	var m;
	m = moment(visit.v_datetime);
	this.visit = visit;
	this.patient = patient;
	this.at = visit.v_datetime.slice(0, 10);
	this.year = m.year();
	this.month = m.month()+1;
	this.yearMonth = m.format("YYYY-MM");
	this.meisai = makeInitialMeisai();
}

RcptVisit.prototype.getMeisai = function(){
	var totalTen, futanWari, charge;
	this.handleShinryou();
	this.handleDrugs();
	this.handleConducts();
	totalTen = this.calcTotalTen();
	futanWari = calcFutanWari(this.visit, this.patient);
	charge = util.calcCharge(totalTen, futanWari);
	return {
		meisai: this.meisai,
		totalTen: totalTen,
		futanWari: futanWari,
		charge: charge
	};
};

RcptVisit.prototype.calcTotalTen = function(){
	var key, ten, sect;
	ten = 0;
	for(key in this.meisai){
		sect = this.meisai[key];
		sect.forEach(function(item){
			ten += item.tanka * item.count;
		});
	}
	return ten;
};

RcptVisit.prototype.handleConducts = function(){
	this.visit.conducts.forEach(function(conduct){
		var sect;
		if( conduct.kind === mConsts.ConductKindGazou ){
			sect = "画像診断";
		} else {
			sect = "注射";
		}
		conduct.shinryou_list.forEach(function(shinryou){
			var label, tanka;
			label = shinryou.name;
			tanka = parseInt(shinryou.tensuu, 10);
			this.meisai[sect].push(makeEntry(label, tanka, 1));
		}.bind(this));
		conduct.drugs.forEach(function(drug){
			var label, kingaku, tanka;
			label = conductDrugLabel(drug);
			kingaku = Number(drug.yakka) * Number(drug.amount);
			if( conduct.kind === mConsts.conductKindGazou ){
				tanka = util.shochiKingakuToTen(kingaku);
			} else {
				tanka = util.touyakuKingakuToTen(kingaku);
			}
			this.meisai[sect].push(makeEntry(label, tanka, 1));
		}.bind(this));
		conduct.kizai_list.forEach(function(kizai){
			var label, kingaku, tanka;
			label = kizaiLabel(kizai);
			kingaku = Number(kizai.kingaku) * Number(kizai.amount);
			tanka = util.kizaiKingakuToTen(kingaku);
			this.meisai[sect].push(makeEntry(label, tanka, 1));
		}.bind(this));
	}.bind(this));
};

RcptVisit.prototype.handleShinryou = function(){
	var classified;
	classified = classifyShinryou(this.visit.shinryou_list);
	this.handleSimpleShinryou(classified.simple);
	this.handleHoukatsu(classified.houkatsu);
};

RcptVisit.prototype.handleSimpleShinryou = function(shinryouList){
	shinryouList.forEach(function(shinryou){
		var sect, tanka;
		sect = util.shuukeiToMeisaiSection(shinryou.shuukeisaki);
		tanka = parseInt(shinryou.tensuu);
		this.meisai[sect].push(makeEntry(shinryou.name, tanka, 1))
	}.bind(this))
};

RcptVisit.prototype.handleHoukatsu = function(houkatsuMap){
	var houkatsu, shinryouList, count, ten, name;
	for(houkatsu in houkatsuMap){
		shinryouList = houkatsuMap[houkatsu];
		count = shinryouList.length;
		ten = houkatsuTen(this.yearMonth, houkatsu, count);
		if( ten === null ){
			ten = sumShinryouTen(shinryouList);
		}
		name = shinryouList.map(function(s){ return s.name }).join("・");
		this.meisai["検査"].push(makeEntry(name, ten, 1));
	}
};

RcptVisit.prototype.handleDrugs = function(){
	var classified;
	classified = classifyDrugs(this.visit.drugs);
	this.handleNaifuku(classified.naifuku);
	this.handleTonpuku(classified.tonpuku);
	this.handleGaiyou(classified.gaiyou);
};

RcptVisit.prototype.handleGaiyou = function(drugs){
	drugs.forEach(function(drug){
		var kingaku, tanka, label;
		kingaku = Number(drug.yakka) * Number(drug.d_amount);
		tanka = util.touyakuKingakuToTen(kingaku);
		label = drugLabel(drug);
		this.meisai["投薬"].push(makeEntry(label, tanka, 1));
	}.bind(this));
}

RcptVisit.prototype.handleTonpuku = function(drugs){
	drugs.forEach(function(drug){
		var kingaku, tanka, label, days;
		kingaku = Number(drug.yakka) * Number(drug.d_amount);
		tanka = util.touyakuKingakuToTen(kingaku);
		label = drugLabel(drug);
		days = parseInt(drug.d_days, 10);
		this.meisai["投薬"].push(makeEntry(label, tanka, days));
	}.bind(this));
}

RcptVisit.prototype.handleNaifuku = function(naifukuItems){
	var items;
	items = naifukuItems.getItems();
	items.forEach(function(item){
		var drugs, label, days, kingaku, tanka;
		drugs = item.drugs;
		label = drugs.map(drugLabel).join("、");
		days = parseInt(drugs[0].d_days, 10);
		kingaku = drugs.reduce(function(sum, drug){
			return sum + (Number(drug.yakka) * Number(drug.d_amount));
		}, 0);
		tanka = util.touyakuKingakuToTen(kingaku);
		this.meisai["投薬"].push(makeEntry(label, tanka, days));
	}.bind(this));
}

function makeEntry(label, tanka, count){
	return {
		label: label,
		tanka: tanka,
		count: count
	};
}

function drugLabel(drug){
	return drug.name + " " + drug.d_amount + drug.unit;
}

function conductDrugLabel(drug){
	return drug.name + " " + drug.amount + drug.unit;
}

function kizaiLabel(kizai){
	return kizai.name + " " + kizai.amount + kizai.unit;
}

function classifyDrugs(drugs){
	var d;
	d = {
		naifuku: new NaifukuItems(),
		tonpuku: [],
		gaiyou: []
	};
	drugs.forEach(function(drug){
		switch(drug.d_category){
			case mConsts.DrugCategoryNaifuku: 
				d.naifuku.addDrug(drug);
				break;
			case mConsts.DrugCategoryTonpuku:
				d.tonpuku.push(drug);
				break;
			case mConsts.DrugCategoryGaiyou:
				d.gaiyou.push(drug);
				break;
			default:
				throw new Error("unknown drug category:" + drug.d_category);
		}
	});
	return d;
}

function NaifukuItems(){
	this.items = [];
}

NaifukuItems.prototype.getItems = function(){
	return this.items;	
};

NaifukuItems.prototype.addDrug = function(drug){
	var key, item;
	key = drug.d_days + "|" + drug.d_usage;
	item = this.findItem(key);
	if( item === null ){
		item = this.makeItem(key);
		this.items.push(item);
	}
	item.drugs.push(drug);
};

NaifukuItems.prototype.findItem = function(key){
	var i, n, item;
	n = this.items.length;
	for(i=0;i<n;i++){
		item = this.items[i];
		if( item.key === key ){
			return item;
		}
	}
	return null;
}

NaifukuItems.prototype.makeItem = function(key){
	return {
		key: key,
		drugs: []
	};
}

function sumShinryouTen(shinryouList){
	return shinryouList.reduce(function(sum, shinryou){
		return sum + parseInt(shinryou.tensuu);
	}, 0);
}

function houkatsuTen(yearMonth, houkatsu, count){
	var i, n, m, arr;
	n = gHoukatsuList.length;
	for(i=0;i<n;i++){
		m = gHoukatsuList[i];
		if( m.valid_from <= yearMonth ){
			arr = m[houkatsu];
			return resolve(arr, count);	
		}
	}
	return null;
	
	function resolve(arr, count){
		var i, n, e;
		n = arr.length;
		for(i=0;i<n;i++){
			e = arr[i];
			if( count >= e[0] ){
				return e[1];
			}
		}
		return null;
	}
}

function classifyShinryou(shinryouList){
	var simple = [], houkatsuMap = {};
	shinryouList.forEach(function(shinryou){
		var houkatsu = shinryou.houkatsukensa;
		if( houkatsu === mConsts.HOUKATSU_NONE ){
			simple.push(shinryou);
		} else {
			if( !(houkatsu in houkatsuMap) ){
				houkatsuMap[houkatsu] = [];
			}
			houkatsuMap[houkatsu].push(shinryou);
		}
	});
	return {simple: simple, houkatsu: houkatsuMap};
}

function makeInitialMeisai(){
	var meisai = {};
	mConsts.MeisaiSections.forEach(function(sect){
		meisai[sect] = [];
	});
	return meisai;
}

function calcFutanWari(visit, patient){
	var futanWari, bd, at, age;
	futanWari = 10;
	if( visit.shahokokuho ){
		bd = moment(patient.birth_day);
		at = moment(visit.v_datetime);
		age = util.calcRcptAge(bd.year(), bd.month()+1, bd.date(),
			at.year(), at.month()+1);
		futanWari = util.calcShahokokuhoFutanWariByAge(age);
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
		kouhiFutanWari = util.kouhiFutanWari(kouhi.futansha);
		if( kouhiFutanWari < futanWari ){
			futanWari = kouhiFutanWari;
		}
	});
	return futanWari;
}

exports.RcptVisit = RcptVisit;
exports.calcFutanWari = util.calcFutanWari;

