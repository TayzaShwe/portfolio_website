(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'
/* global fetch */

const baseUrl = 'https://min-api.cryptocompare.com/data/'
let apiKey = ''

function setApiKey (userApiKey) {
  apiKey = userApiKey
}

function fetchJSON (url) {
  if (apiKey !== '') {
    if (url.indexOf('?') > -1) {
      url += '&api_key='
    } else {
      url += '?api_key='
    }
    url += apiKey
  }
  return fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`)
      }
      return res.json()
    })
    .then(body => {
      if (body.Response === 'Error') throw body.Message
      return body
    })
}

function coinList () {
  const url = `${baseUrl}all/coinlist`
  return fetchJSON(url)
}

function exchangeList () {
  const url = `${baseUrl}all/exchanges`
  return fetchJSON(url)
}

function constituentExchangeList (options) {
  options = options || {}
  let url = `${baseUrl}all/includedexchanges`
  if (options.instrument) url += `?instrument=${options.instrument}`
  return fetchJSON(url).then(result => result.Data)
}

function newsFeedsAndCategories () {
  const url = `${baseUrl}news/feedsandcategories`
  return fetchJSON(url).then(result => result.Data)
}

function newsList (lang, options) {
  options = options || {}
  let url = `${baseUrl}v2/news/?lang=${lang}`
  if (options.feeds) url += `&feeds=${options.feeds}`
  if (options.categories) url += `&categories=${options.categories}`
  if (options.excludeCategories) url += `&categories=${options.excludeCategories}`
  if (options.lTs) {
    options.lTs = dateToTimestamp(options.lTs)
    url += `&lTs=${options.lTs}`
  }
  return fetchJSON(url).then(result => result.Data)
}

function price (fsym, tsyms, options) {
  options = options || {}
  let url = `${baseUrl}price?fsym=${fsym}&tsyms=${tsyms}`
  if (options.exchanges) url += `&e=${options.exchanges}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  return fetchJSON(url)
}

function priceMulti (fsyms, tsyms, options) {
  options = options || {}
  let url = `${baseUrl}pricemulti?fsyms=${fsyms}&tsyms=${tsyms}`
  if (options.exchanges) url += `&e=${options.exchanges}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  return fetchJSON(url)
}

function priceFull (fsyms, tsyms, options) {
  options = options || {}
  let url = `${baseUrl}pricemultifull?fsyms=${fsyms}&tsyms=${tsyms}`
  if (options.exchanges) url += `&e=${options.exchanges}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  // We want the RAW data, not the DISPLAY data:
  return fetchJSON(url).then(result => result.RAW)
}

function priceHistorical (fsym, tsyms, time, options) {
  options = options || {}
  time = dateToTimestamp(time)
  let url = `${baseUrl}pricehistorical?fsym=${fsym}&tsyms=${tsyms}&ts=${time}`
  if (options.exchanges) url += `&e=${options.exchanges}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  // The API returns json with an extra layer of nesting, so remove it
  return fetchJSON(url).then(result => result[fsym])
}

function generateAvg (fsym, tsym, e, tryConversion) {
  let url = `${baseUrl}generateAvg?fsym=${fsym}&tsym=${tsym}&e=${e}`
  if (tryConversion === false) url += '&tryConversion=false'
  return fetchJSON(url).then(result => result.RAW)
}

function topPairs (fsym, limit) {
  let url = `${baseUrl}top/pairs?fsym=${fsym}`
  if (limit) url += `&limit=${limit}`
  return fetchJSON(url).then(result => result.Data)
}

function topExchanges (fsym, tsym, limit) {
  let url = `${baseUrl}top/exchanges?fsym=${fsym}&tsym=${tsym}`
  if (limit) url += `&limit=${limit}`
  return fetchJSON(url).then(result => result.Data)
}

function topExchangesFull (fsym, tsym, limit) {
  let url = `${baseUrl}top/exchanges/full?fsym=${fsym}&tsym=${tsym}`
  if (limit) url += `&limit=${limit}`
  return fetchJSON(url).then(result => result.Data)
}

function histoDay (fsym, tsym, options) {
  options = options || {}
  if (options.timestamp) options.timestamp = dateToTimestamp(options.timestamp)
  let url = `${baseUrl}histoday?fsym=${fsym}&tsym=${tsym}`
  if (options.exchange) url += `&e=${options.exchange}`
  if (options.limit === 'none') url += '&allData=true'
  else if (options.limit) url += `&limit=${options.limit}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  if (options.aggregate) url += `&aggregate=${options.aggregate}`
  if (options.timestamp) url += `&toTs=${options.timestamp}`
  if (options.aggregatePredictableTimePeriods) url += `&aggregatePredictableTimePeriods=${options.aggregatePredictableTimePeriods}`
  if (options.allData) url += `&allData=${options.allData}`
  if (options.toTs) url += `&toTs=${options.toTs}`
  return fetchJSON(url).then(result => result.Data)
}

function histoHour (fsym, tsym, options) {
  options = options || {}
  if (options.timestamp) options.timestamp = dateToTimestamp(options.timestamp)
  let url = `${baseUrl}histohour?fsym=${fsym}&tsym=${tsym}`
  if (options.exchange) url += `&e=${options.exchange}`
  if (options.limit) url += `&limit=${options.limit}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  if (options.aggregate) url += `&aggregate=${options.aggregate}`
  if (options.timestamp) url += `&toTs=${options.timestamp}`
  if (options.allData) url += `&allData=${options.allData}`
  if (options.toTs) url += `&toTs=${options.toTs}`
  return fetchJSON(url).then(result => result.Data)
}

function histoMinute (fsym, tsym, options) {
  options = options || {}
  if (options.timestamp) options.timestamp = dateToTimestamp(options.timestamp)
  let url = `${baseUrl}histominute?fsym=${fsym}&tsym=${tsym}`
  if (options.exchange) url += `&e=${options.exchange}`
  if (options.limit) url += `&limit=${options.limit}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  if (options.aggregate) url += `&aggregate=${options.aggregate}`
  if (options.timestamp) url += `&toTs=${options.timestamp}`
  if (options.allData) url += `&allData=${options.allData}`
  if (options.toTs) url += `&toTs=${options.toTs}`
  return fetchJSON(url).then(result => result.Data)
}

function dateToTimestamp (date) {
  if (!(date instanceof Date)) throw new Error('timestamp must be an instance of Date.')
  return Math.floor(date.getTime() / 1000)
}

function latestSocial (options) {
  options = options || {}
  let url = `${baseUrl}social/coin/latest`
  if (options.coinId) url += `?coinId=${options.coinId}`
  return fetchJSON(url).then(result => result.Data)
}

function histoSocial (timePeriod, options) {
  options = options || {}
  let url = `${baseUrl}social/coin/histo/${timePeriod === 'hour' ? 'hour' : 'day'}`
  let query = []
  if (options.coinId) query.push(`coinId=${options.coinId}`)
  if (options.aggregate >= 1 && options.aggregate <= 30) query.push(`aggregate=${options.aggregate}`)
  if (options.aggregate && typeof options.aggregatePredictableTimePeriods === 'boolean') query.push(`&aggregatePredictableTimePeriods=${options.aggregatePredictableTimePeriods}`)
  if (options.limit >= 1 && options.limit <= 2000) query.push(`limit=${options.limit}`)
  if (options.toTs) query.push(`toTs=${options.toTs}`)
  return fetchJSON(`${url}${query.length > 0 ? '?' + query.join('&') : ''}`).then(result => result.Data)
}

module.exports = {
  setApiKey,
  coinList,
  constituentExchangeList,
  exchangeList,
  newsFeedsAndCategories,
  newsList,
  price,
  priceMulti,
  priceFull,
  priceHistorical,
  generateAvg,
  topPairs,
  topExchanges,
  topExchangesFull,
  histoDay,
  histoHour,
  histoMinute,
  latestSocial,
  histoSocial
}

},{}],2:[function(require,module,exports){
(function (global){(function (){
"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
if (global.fetch) {
	exports.default = global.fetch.bind(global);
}

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){(function (){
// ------------- START OF MY CODE --------------- //
/**
 * Npm modules required:
 * 1) node-fetch: "npm install node-fetch@2"
 * 2) cryptocompare: "npm install --save cryptocompare"
 * 3) chart.js: "npm install chart.js"
 * 4) chartjs-plugin-zoom: "npm install chartjs-plugin-zoom"
 */
if (global == undefined) {
    var global = window;
}
global.fetch = require('node-fetch');
const cc = require('cryptocompare');
cc.setApiKey('76a059bd9813c0c3e678799f86f22cf562bc1f27ac993640c300212678377184'); // this is my api key from cryptocompare, it is free so I don't mind sharing this

const coinList = {"42":true,"300":true,"365":true,"404":true,"433":true,"611":true,"808":true,"888":true,"1337":true,"2015":true,"XBS":true,"XPY":true,"PRC":true,"YBC":true,"DANK":true,"GIVE":true,"KOBO":true,"DT":true,"CETI":true,"SUP":true,"XPD":true,"GEO":true,"CHASH":true,"NXTI":true,"WOLF":true,"XDP":true,"ACOIN":true,"ALF":true,"AEGIS":true,"ALIEN":true,"APEX":true,"ARCH":true,"ARG":true,"ARI":true,"AXR":true,"BLU":true,"BOST":true,"BQC":true,"XMY":true,"ZET":true,"SXC":true,"QTL":true,"ENRG":true,"RIC":true,"LIMX":true,"BTB":true,"CAIX":true,"BTMK":true,"BUK":true,"CACH":true,"CANN":true,"CAP":true,"CASH":true,"CBX":true,"CCN":true,"CIN":true,"CINNI":true,"CXC":true,"CLAM":true,"CLR":true,"CNL":true,"COMM":true,"COOL":true,"CRACK":true,"CRYPT":true,"DEM":true,"DIAM":true,"DRKC":true,"DSB":true,"EAC":true,"EFL":true,"ELC":true,"EMD":true,"EXCL":true,"EZC":true,"FLAP":true,"FC2":true,"FFC":true,"FIBRE":true,"FRC":true,"FLT":true,"FRK":true,"FRAC":true,"FSTC":true,"GDC":true,"GLYPH":true,"GML":true,"GUE":true,"HAL":true,"HBN":true,"HUC":true,"HVC":true,"HYP":true,"ICB":true,"IFC":true,"IXC":true,"JBS":true,"JKC":true,"JUDGE":true,"KDC":true,"KEYC":true,"KGC":true,"LK7":true,"LKY":true,"LSD":true,"LTCD":true,"LTCX":true,"LXC":true,"LYC":true,"MAX":true,"MINRL":true,"MINC":true,"MRY":true,"MZC":true,"NAN":true,"NAUT":true,"NMB":true,"NRB":true,"NOBL":true,"NRS":true,"NYAN":true,"ORB":true,"OPSC":true,"PHS":true,"POINTS":true,"PSEUD":true,"PXC":true,"PYC":true,"RIPO":true,"RPC":true,"RT2":true,"RYC":true,"RZR":true,"SAT2":true,"SBC":true,"SDC":true,"SFR":true,"SHADE":true,"SHLD":true,"SILK":true,"SLG":true,"SMC":true,"SPOTS":true,"SRC":true,"SWIFT":true,"TAG":true,"TAK":true,"TIT":true,"TRC":true,"TITC":true,"ULTC":true,"UNO":true,"URO":true,"USDE":true,"UTC":true,"UTIL":true,"VDO":true,"VOOT":true,"XBOT":true,"XC":true,"XJO":true,"XLB":true,"XPM":true,"XST":true,"YAC":true,"ZCC":true,"ZED":true,"EKN":true,"XAU":true,"TMC":true,"SJCX":true,"START":true,"HUGE":true,"MAID":true,"007":true,"NSR":true,"TEK":true,"BAY":true,"NTRN":true,"SLING":true,"XVC":true,"XSI":true,"BYC":true,"GEMZ":true,"KTK":true,"HZ":true,"QORA":true,"RBY":true,"PTC":true,"SSD":true,"MMXIV":true,"STV":true,"EBS":true,"AM":true,"AMBER":true,"NKT":true,"J":true,"ABY":true,"MTR":true,"TRI":true,"SWARM":true,"BBR":true,"BTCRY":true,"BCR":true,"XPB":true,"XDQ":true,"FLDC":true,"SLR":true,"SMAC":true,"TRK":true,"U":true,"UIS":true,"CYP":true,"ASN":true,"OC":true,"GSM":true,"FSC":true,"NXTTY":true,"QBK":true,"BLC":true,"MARYJ":true,"OMC":true,"CC":true,"BITS":true,"HYPER":true,"VTR":true,"METAL":true,"GRE":true,"XG":true,"CHILD":true,"BOOM":true,"MINE":true,"UNAT":true,"SLM":true,"XTPL":true,"XCN":true,"CURE":true,"GMC":true,"MMC":true,"OCTOC":true,"EGGC":true,"C2":true,"CAMC":true,"RBR":true,"XQN":true,"ICASH":true,"SOON":true,"BTMI":true,"EVENT":true,"1CR":true,"VIOR":true,"XCO":true,"VMC":true,"VIRAL":true,"EQM":true,"ISL":true,"QSLV":true,"XWT":true,"XNA":true,"SKB":true,"BSTY":true,"FCS":true,"GAM":true,"CESC":true,"TWLV":true,"EAGS":true,"MLTC":true,"ADC":true,"XMS":true,"SIGU":true,"M1":true,"DB":true,"CTO":true,"BITL":true,"FUTC":true,"GLOBE":true,"MRP":true,"CREVA":true,"NANAS":true,"XCE":true,"ACP":true,"DRZ":true,"BSC":true,"DRKT":true,"CIRC":true,"NKA":true,"VERSA":true,"EPY":true,"SQL":true,"CHA":true,"CRW":true,"XPH":true,"GRM":true,"QTZ":true,"ARB":true,"LTS":true,"SPINC":true,"GP":true,"BITZ":true,"DUB":true,"GRAV":true,"BOBS":true,"MNV":true,"QCN":true,"HEDGE":true,"SONG":true,"XSEED":true,"AXIOM":true,"SMLY":true,"CHIP":true,"SPEC":true,"UNC":true,"SPRTS":true,"ZNY":true,"BTQ":true,"PKB":true,"SNRG":true,"GHOUL":true,"HNC":true,"DIGS":true,"GCR":true,"MAPC":true,"MI":true,"TX":true,"LYB":true,"PXI":true,"AMS":true,"OBITS":true,"BLITZ":true,"BHIRE":true,"I0C":true,"NAS2":true,"PAK":true,"DOGED":true,"OK":true,"RVR":true,"HODL":true,"EDRC":true,"HTC":true,"DBIC":true,"XHI":true,"BIOS":true,"CAB":true,"RCX":true,"PWR":true,"TRUMP":true,"PRM":true,"BCY":true,"RBIES":true,"BLRY":true,"DOTC":true,"CREED":true,"POSTC":true,"INFX":true,"ION":true,"GROW":true,"UNITY":true,"OLDSF":true,"SSTC":true,"NETC":true,"TAGR":true,"HMP":true,"ADZ":true,"GAPC":true,"MYC":true,"IVZ":true,"VTA":true,"SOIL":true,"YOC":true,"VPRC":true,"APC":true,"STEPS":true,"DBTC":true,"MOIN":true,"ERC":true,"AIB":true,"PRIME":true,"BERN":true,"BIGUP":true,"XRE":true,"XDB":true,"ANTI":true,"BRK":true,"COLX":true,"MNM":true,"ZEIT":true,"2GIVE":true,"CGA":true,"SWING":true,"NEBU":true,"AEC":true,"FRN":true,"ADNT":true,"N7":true,"CYG":true,"UTH":true,"MPRO":true,"KATZ":true,"SPM":true,"MOJO":true,"BELA":true,"BOLI":true,"CLUD":true,"DIME":true,"HVCO":true,"GIZ":true,"GREXIT":true,"CARBON":true,"DEUR":true,"TUR":true,"DISK":true,"NEVA":true,"CYT":true,"FUZZ":true,"NKC":true,"SECRT":true,"XRA":true,"XNX":true,"STHR":true,"WMC":true,"GOTX":true,"FLVR":true,"REVE":true,"PBC":true,"EDUC":true,"CLINT":true,"CKC":true,"VIP":true,"NXE":true,"ZOOM":true,"YOVI":true,"ORLY":true,"KUBOS":true,"INCP":true,"SAK":true,"EVIL":true,"OMA":true,"MUE":true,"COX":true,"BSEND":true,"BIT16":true,"PDC":true,"CMTC":true,"REE":true,"LQD":true,"MARV":true,"GSY":true,"TRTK":true,"LIR":true,"SCRPT":true,"SPCIE":true,"CJ":true,"PUT":true,"KRAK":true,"DLISK":true,"IBANK":true,"VOYA":true,"ENTER":true,"BM":true,"FRWC":true,"RUST":true,"NZC":true,"XAUR":true,"BFX":true,"UNIQ":true,"CRX":true,"DCT":true,"MUDRA":true,"WARP":true,"CNMT":true,"HEAT":true,"ICN":true,"EXB":true,"CDEX":true,"RBIT":true,"DCS.":true,"GB":true,"SYNX":true,"JWL":true,"TAB":true,"TRIG":true,"BITCNY":true,"BITUSD":true,"ATMC":true,"STO":true,"TOT":true,"BTD":true,"BOTS":true,"MDC":true,"FTP":true,"ZET2":true,"CVNC":true,"KRB":true,"TELL":true,"ENE":true,"TDFB":true,"BLOCKPAY":true,"BXT":true,"ZYD":true,"GOON":true,"VLT":true,"ZNE":true,"DGDC":true,"TODAY":true,"VRM":true,"ROOT":true,"1ST":true,"GPL":true,"DOPE":true,"B3":true,"FX":true,"PIO":true,"PROUD":true,"SMSR":true,"UBIQ":true,"ARM":true,"ERB":true,"LAZ":true,"FONZ":true,"BTCR":true,"FCTC":true,"SANDG":true,"PUNK":true,"DLC":true,"SEN":true,"LTH":true,"BRONZ":true,"SH":true,"BUZZ":true,"PSI":true,"NLC":true,"XBTS":true,"FITC":true,"PINKX":true,"FIRE":true,"UNF":true,"SPORT":true,"PPY":true,"NTC":true,"EGO":true,"RCOIN":true,"X2":true,"TIA":true,"GBRC":true,"HALLO":true,"BBCC":true,"EMIGR":true,"OLYMP":true,"DPAY":true,"HKG":true,"ANTC":true,"JOBS":true,"DGORE":true,"THC":true,"TRA":true,"RMS":true,"FJC":true,"VAPOR":true,"SDP":true,"PREM":true,"CALC":true,"LEA":true,"CF":true,"CRNK":true,"VTY":true,"BS":true,"JIF":true,"CRAB":true,"HILL":true,"MONETA":true,"ECLIP":true,"RUBIT":true,"KRC":true,"ROYAL":true,"LFC":true,"ZUR":true,"NUBIS":true,"TENNET":true,"PEC":true,"32BIT":true,"GNJ":true,"TEAM":true,"SCT":true,"LANA":true,"ELE":true,"GCC":true,"AND":true,"EQUAL":true,"SWEET":true,"2BACCO":true,"DKC":true,"CHOOF":true,"CSH":true,"ZCL":true,"RYCN":true,"PCS":true,"NBIT":true,"WINE":true,"IFLT":true,"ZECD":true,"WASH":true,"VSL":true,"TPG":true,"CBD":true,"PEX":true,"INSANE":true,"PENC":true,"BASH":true,"FAMEC":true,"LIV":true,"SP":true,"MEGA":true,"ALC":true,"HUSH":true,"BTLC":true,"DRM8":true,"FIST":true,"EBZ":true,"DRS":true,"FGZ":true,"ATX":true,"PNC":true,"BRDD":true,"BIPC":true,"DLR":true,"CSMIC":true,"SCASH":true,"XEN":true,"JIO":true,"IW":true,"JNS":true,"TRICK":true,"DCRE":true,"FRE":true,"NPC":true,"PLNC":true,"DGMS":true,"ICOB":true,"ARCO":true,"KURT":true,"XCRE":true,"ENT":true,"UR":true,"ODNT":true,"EUC":true,"CCXC":true,"BCF":true,"SEEDS":true,"TKS":true,"BCCOIN":true,"SHORTY":true,"PCM":true,"KC":true,"CORAL":true,"BamitCoin":true,"NXC":true,"MONEY":true,"BSTAR":true,"HSP":true,"HZT":true,"CRSP":true,"XSPT":true,"CCRB":true,"BULLS":true,"INCNT":true,"NIC":true,"ACN":true,"XNG":true,"XCI":true,"MMXVI":true,"WOP":true,"CQST":true,"IMPS":true,"IN":true,"CHIEF":true,"GOAT":true,"ANAL":true,"RC":true,"PND":true,"PX":true,"OPTION":true,"AV":true,"LTD":true,"HEEL":true,"GAKH":true,"GAIN":true,"S8C":true,"LVG":true,"DRA":true,"LTCR":true,"QBC":true,"XPRO":true,"GIFT":true,"INC":true,"PTA":true,"ACID":true,"ZLQ":true,"RADI":true,"RNC":true,"GOLOS":true,"PASC":true,"TWIST":true,"PAYP":true,"DETH":true,"YES":true,"LENIN":true,"MRSA":true,"OS76":true,"BOSS":true,"BIC":true,"CRPS":true,"NTCC":true,"MAC":true,"SEL":true,"NOO":true,"CHAO":true,"XGB":true,"YMC":true,"JOK":true,"TEC":true,"BOMBC":true,"RIDE":true,"KED":true,"CNO":true,"WEALTH":true,"IOP":true,"XSPEC":true,"PEPECASH":true,"CLICK":true,"KUSH":true,"ERY":true,"PLU":true,"PRES":true,"BTZ":true,"OPES":true,"RATIO":true,"BANC":true,"NICEC":true,"SMF":true,"CWXT":true,"TECH":true,"CIR":true,"LEPEN":true,"ROUND":true,"MARI":true,"HAZE":true,"PRX":true,"NRC":true,"PAC":true,"IMPCH":true,"ERR":true,"TIC":true,"NUKE":true,"EOC":true,"SFC":true,"JANE":true,"CTL":true,"NDOGE":true,"ZBC":true,"FRST":true,"ALEX":true,"TBCX":true,"MCAR":true,"THS":true,"ACES":true,"UAEC":true,"EA":true,"PIE":true,"CREA":true,"WISC":true,"BVC":true,"FIND":true,"STALIN":true,"TSE":true,"BIOB":true,"SWT":true,"PASL":true,"ZER":true,"CHAT":true,"NETKO":true,"ZOI":true,"HONEY":true,"MXTC":true,"MUSIC":true,"VEG":true,"MBIT":true,"VOLT":true,"EDG":true,"B@":true,"CHC":true,"ZENI":true,"PLANET":true,"BSTK":true,"RNS":true,"AMIS":true,"KAYI":true,"XVP":true,"BOAT":true,"TAJ":true,"CJC":true,"AMY":true,"EB3":true,"XVE":true,"FAZZ":true,"ARPAC":true,"ECOC":true,"XLR":true,"DARK":true,"WGO":true,"ATMOS":true,"ETT":true,"VISIO":true,"HPC":true,"GIOT":true,"CXT":true,"EMPC":true,"LGD":true,"BUCKS":true,"MCRN":true,"WSX":true,"IEC":true,"IMS":true,"ARGUS":true,"CNT":true,"LMC":true,"BTCS":true,"PROC":true,"XGR":true,"HMQ":true,"BCAP":true,"DUO":true,"RBX":true,"GRW":true,"APX":true,"MILO":true,"OLV":true,"IOU":true,"PZM":true,"PHR":true,"PUPA":true,"XCT":true,"DEA":true,"REDCO":true,"ZSE":true,"TAP":true,"BITOK":true,"MUU":true,"MNE":true,"DICE":true,"SBSC":true,"USC":true,"DUX":true,"XPS":true,"EQT":true,"INSN":true,"MNTC":true,"F16":true,"NEF":true,"QWARK":true,"ADL":true,"PTOY":true,"ZRC":true,"LKK":true,"ESP":true,"DYN":true,"SEQ":true,"MCAP":true,"VERI":true,"CFI":true,"IXT":true,"TFL":true,"QAU":true,"ECOB":true,"AHOO":true,"TIX":true,"CHAN":true,"CMP":true,"HRB":true,"8BT":true,"DAOACT":true,"MIV":true,"WGR":true,"XEL":true,"NVST":true,"FUNC":true,"WTT":true,"MYB":true,"STAR":true,"COR":true,"XRL":true,"OROC":true,"MBI":true,"DDF":true,"DIM":true,"GGS":true,"FYN":true,"FND":true,"DCY":true,"CFT":true,"D":true,"DP":true,"VUC":true,"BTPL":true,"UNIFY":true,"BRIT":true,"AMMO":true,"SOCC":true,"LA":true,"IML":true,"STU":true,"GUNS":true,"IFT":true,"BCAT":true,"SYC":true,"IND":true,"NPX":true,"SCORE":true,"OTX":true,"VOISE":true,"ETBS":true,"CVCOIN":true,"DRP":true,"ARC":true,"NDC":true,"POE":true,"ADT":true,"UET":true,"AGRS":true,"BEACH":true,"DAS":true,"XCJ":true,"RKC":true,"NLC2":true,"LINDA":true,"KING93":true,"ANCP":true,"RCC":true,"ROOTS":true,"CABS":true,"OPT":true,"ZNT":true,"BITSD":true,"XLC":true,"SKIN":true,"MSP":true,"HIRE":true,"DFBT":true,"EQ":true,"WLK":true,"XID":true,"GCN":true,"TME":true,"SIGT":true,"ONX":true,"COE":true,"ARENA":true,"CRM":true,"DGPT":true,"MOBI":true,"CSNO":true,"COREG":true,"KEN":true,"QVT":true,"TIE":true,"AUT":true,"GRWI":true,"CCC":true,"UMC":true,"BMXT":true,"OCL":true,"TOM":true,"SMNX":true,"MRV":true,"MBRS":true,"PGL":true,"XMCC":true,"AUN":true,"CMPCO":true,"DTCT":true,"WNET":true,"PRG":true,"THNX":true,"WORM":true,"FUCK":true,"VRD":true,"SIFT":true,"IWT":true,"JDC":true,"ITF":true,"AIX":true,"ENTRP":true,"PIX":true,"MEDI":true,"HGT":true,"LTA":true,"NIMFA":true,"SCOR":true,"MLS":true,"KEX":true,"COB":true,"BRO":true,"MINEX":true,"ATL":true,"DFT":true,"SOJ":true,"HDG":true,"STCN":true,"SQP":true,"RIYA":true,"LNK":true,"MNTP":true,"ALTOCAR":true,"BKX":true,"BOU":true,"AMT":true,"LBTC":true,"FRAZ":true,"EMT":true,"KRONE":true,"SRT":true,"ACC":true,"Z2":true,"LINX":true,"XCXT":true,"BLAS":true,"SCL":true,"EON":true,"PRIX":true,"CNX":true,"WRC":true,"BRX":true,"UCASH":true,"DEEPG":true,"WSH":true,"ARNA":true,"ABC":true,"BMC":true,"SKRT":true,"3DES":true,"PYN":true,"KAPU":true,"SENSE":true,"FC":true,"NRN":true,"ATKN":true,"RUSTBITS":true,"REX":true,"ETHD":true,"SUMO":true,"H2O":true,"TKT":true,"RHEA":true,"ART":true,"SNOV":true,"MTN":true,"STOCKBET":true,"SND":true,"XP":true,"GLA":true,"ZNA":true,"EZM":true,"ODN":true,"MTK":true,"MAT":true,"GJC":true,"WIC":true,"WAND":true,"ELIX":true,"EBTC":true,"HAC":true,"BIS":true,"OPP":true,"ROCK2":true,"EARTH":true,"VSX":true,"GRFT":true,"CZC":true,"PPP":true,"GUESS":true,"CIX":true,"ERT":true,"FLIK":true,"MBT":true,"ALIS":true,"LEV":true,"ARBI":true,"ARNX":true,"ROK":true,"XRED":true,"FLP":true,"VRP":true,"NTM":true,"TZC":true,"MCI":true,"FUJIN":true,"ATCC":true,"KOLION":true,"ELTC2":true,"ILCT":true,"RYZ":true,"TER":true,"XCS":true,"BQ":true,"EVR":true,"TOA":true,"VIVO":true,"AURS":true,"CAG":true,"ECHT":true,"INXT":true,"RGC":true,"EBET":true,"BITCM":true,"CPAY":true,"RUP":true,"WHL":true,"UP":true,"ETG":true,"WOMEN":true,"MAY":true,"EDDIE":true,"SOMA":true,"NAMO":true,"GAT":true,"BLUE":true,"WYR":true,"VZT":true,"LUX":true,"PIRL":true,"ECASH":true,"ODMC":true,"BRAT":true,"DTR":true,"TKR":true,"ELITE":true,"XIOS":true,"DOV":true,"REA":true,"AVE":true,"BTDX":true,"LOAN":true,"ZAB":true,"BT1":true,"BT2":true,"SHARPE":true,"JCR":true,"XSB":true,"EBST":true,"KEK":true,"AID":true,"BLHC":true,"ALTCOM":true,"UGC":true,"PURE":true,"CLD":true,"OTN":true,"POS":true,"REBL":true,"NEOG":true,"EXN":true,"TRCT":true,"UKG":true,"BTCRED":true,"CPEX":true,"JTX":true,"AXT":true,"RUPX":true,"BDR":true,"TIOX":true,"HNCN":true,"MADC":true,"PURA":true,"INN":true,"HST":true,"BDL":true,"CMS":true,"XBL":true,"ZEPH":true,"ATFS":true,"GES":true,"PHORE":true,"LCASH":true,"CFD":true,"SPHTX":true,"WSC":true,"DBET":true,"XGOX":true,"NEWB":true,"RMC":true,"CREDO":true,"MSR":true,"CJT":true,"EVN":true,"ELLA":true,"BPL":true,"ROCK":true,"DRXNE":true,"SKR":true,"GRID":true,"XPTX":true,"ETK":true,"EMPH":true,"SOAR":true,"ISH":true,"MNX":true,"CRDS":true,"VIU":true,"SCRM":true,"DBR":true,"GFT":true,"STAC":true,"RIPT":true,"BBT":true,"GBX":true,"CSTL":true,"XLQ":true,"TRIA":true,"PBL":true,"MAG":true,"STEX":true,"UFR":true,"LOCI":true,"LAB":true,"DEB":true,"FLIXX":true,"FRD":true,"PFR":true,"ECA":true,"LDM":true,"LTG":true,"STP":true,"SPANK":true,"WISH":true,"AERM":true,"PLX":true,"FOOD":true,"VOT":true,"XSH":true,"GEA":true,"BCO":true,"DSR":true,"BDG":true,"ONG":true,"PRL":true,"BTCM":true,"ETBT":true,"ZCG":true,"MUT":true,"DIVX":true,"RHOC":true,"XUN":true,"RFL":true,"ELTCOIN":true,"GRX":true,"NTK":true,"ERO":true,"RLX":true,"CWV":true,"NRO":true,"SEND":true,"GLT":true,"X8X":true,"COAL":true,"DAXX":true,"BWK":true,"FNTB":true,"XMRG":true,"BTCE":true,"BOXY":true,"UTNP":true,"EGAS":true,"DPP":true,"TGT":true,"BMT":true,"BIO":true,"MTRC":true,"PCN":true,"PYP":true,"CRED":true,"SBTC":true,"KLKS":true,"AC3":true,"CHIPS":true,"LTHN":true,"GER":true,"LTCU":true,"MGO":true,"BTCA":true,"CCOS":true,"HAT":true,"CWX":true,"ZP":true,"POP":true,"PNX":true,"AMM":true,"XCPO":true,"HTML":true,"NMS":true,"PHO":true,"XTRA":true,"NTWK":true,"SUCR":true,"ACCO":true,"BYTHER":true,"EREAL":true,"CPN":true,"XFT":true,"BSE":true,"Q2C":true,"SPF":true,"TDS":true,"ORE":true,"SPK":true,"GOA":true,"WAGE":true,"GUN":true,"FLOT":true,"CL":true,"SHND":true,"AUA":true,"DNN":true,"SAGA":true,"IRL":true,"TROLL":true,"JET":true,"LCP":true,"TGCC":true,"SDRN":true,"INK":true,"KBR":true,"MONK":true,"MGN":true,"KZC":true,"GNR":true,"LNC":true,"LWF":true,"WCG":true,"BHIVE":true,"LCK":true,"MFG":true,"SPX":true,"ONL":true,"ET4":true,"LCT":true,"EBC":true,"VESTA":true,"CPY":true,"STEN":true,"SFU":true,"PCOIN":true,"BLNM":true,"LUC":true,"EDT":true,"CYDER":true,"SRNT":true,"MLT":true,"BTO":true,"DOCC":true,"ARCT":true,"IMVR":true,"IDH":true,"ITZ":true,"XBP":true,"EXRN":true,"LGO":true,"SGL":true,"FSBT":true,"CFTY":true,"DTX":true,"MCU":true,"PRPS":true,"DUBI":true,"SGN":true,"MOT":true,"QBAO":true,"ACCN":true,"OPC":true,"SAF":true,"PYLNT":true,"EVE":true,"REPUX":true,"JOYT":true,"CAPD":true,"BTW":true,"AXPR":true,"FOTA":true,"SPEND":true,"ZPT":true,"REF":true,"SXDT":true,"SXUT":true,"MZX":true,"Q1S":true,"XTO":true,"WT":true,"HGS":true,"SISA":true,"EBIT":true,"RCT":true,"CUZ":true,"BETR":true,"ING":true,"CVNG":true,"EQUI":true,"MCT":true,"HHEM":true,"CWIS":true,"SWM":true,"MDCL":true,"WOBTC":true,"DNO":true,"eFIC":true,"DRPU":true,"DOR":true,"PRFT":true,"PARETO":true,"DTRC":true,"NDLC":true,"MUN":true,"TIG":true,"LYK":true,"NYX":true,"SAT":true,"CRL":true,"ORI":true,"LGR":true,"BCA":true,"B2X":true,"UETL":true,"NBR":true,"ARY":true,"ILT":true,"SCOOBY":true,"CEFS":true,"BUN":true,"BSR":true,"SKULL":true,"TRDT":true,"XBTY":true,"JC":true,"SKC":true,"JEW":true,"ERIS":true,"KRM":true,"CDY":true,"CRDNC":true,"CADN":true,"BTF":true,"IPC":true,"SHOW":true,"AIT":true,"STQ":true,"CXP":true,"FDX":true,"KREDS":true,"EQL":true,"GAI":true,"VULC":true,"DVTC":true,"DADI":true,"MGGT":true,"TOKC":true,"UNRC":true,"NOX":true,"HYS":true,"LCWP":true,"NAVI":true,"ADI":true,"VVI":true,"ANKORUS":true,"IVC":true,"HLP":true,"VIN":true,"SHPING":true,"VANY":true,"NOXB":true,"FLIP":true,"CLIN":true,"GOOD":true,"ENK":true,"ALX":true,"DTH":true,"TDX":true,"LOTTO":true,"FUNK":true,"LEAF":true,"BITCAR":true,"CLN":true,"ORYX":true,"BASHC":true,"DIGIF":true,"DGM":true,"CBS":true,"SVD":true,"PROOF":true,"BTCH":true,"redBUX":true,"LIZ":true,"CIF":true,"SPD":true,"RPUT":true,"FILL":true,"PROPS":true,"CEDEX":true,"FUNDP":true,"PUSHI":true,"BINS":true,"POKER":true,"AXYS":true,"EVENC":true,"BOLD":true,"EXTN":true,"DIG":true,"ETS":true,"LIPC":true,"GOFF":true,"HELL":true,"ELP":true,"RKT":true,"ELI":true,"CO2":true,"INVOX":true,"ACTN":true,"LTCH":true,"ZUP":true,"USCOIN":true,"BCHT":true,"ELIC":true,"MOAT":true,"BBI":true,"ENTRC":true,"BTCGO":true,"KNW":true,"PGC":true,"PKC":true,"SQOIN":true,"TBAR":true,"TAN":true,"CPL":true,"TUBE":true,"OMX":true,"TRCK":true,"MBM":true,"INVC":true,"W3C":true,"DIN":true,"INSTAR":true,"PSD":true,"J8T":true,"LELE":true,"DROP":true,"AKA":true,"SHIP":true,"LCS":true,"LALA":true,"LEDU":true,"FOXT":true,"ETKN":true,"ROX":true,"AMBT":true,"BTRM":true,"MANNA":true,"ePRX":true,"HMC":true,"ZIX":true,"ORGT":true,"PAN":true,"BOTC":true,"VIEW":true,"ADK":true,"VIT":true,"SERA":true,"BLN":true,"AET":true,"CMOS":true,"REDN":true,"TLP":true,"BSX":true,"BBN":true,"TDZ":true,"PAVO":true,"BUBO":true,"USOAMIC":true,"FLUZ":true,"IPSX":true,"MIO":true,"AIC":true,"BNN":true,"SPND":true,"FNO":true,"PAS":true,"CVTC":true,"PLMT":true,"RNTB":true,"XCLR":true,"BPX":true,"FDZ":true,"VTN":true,"MASP":true,"XTL":true,"UCN":true,"HUR":true,"BRIA":true,"IC":true,"ETHPR":true,"MNB":true,"ACHC":true,"RAC":true,"BEX":true,"HOLD":true,"EZT":true,"VIC":true,"XCM":true,"NFN":true,"CEEK":true,"WIIX":true,"BCI":true,"MEDIC":true,"BBCT":true,"KWH":true,"VLD":true,"FTX":true,"GSI":true,"ALPS":true,"BKC":true,"DEV":true,"CHT":true,"GREEN":true,"ABJ":true,"FTW":true,"RAP":true,"ARTE":true,"ANI":true,"PHC":true,"ETHM":true,"UBC":true,"NOKU":true,"PAT":true,"LIGER":true,"CHFN":true,"EURN":true,"LEU":true,"SWC":true,"ORS":true,"SEM":true,"DARX":true,"BBK":true,"UWC":true,"CPX":true,"EQC":true,"ADH":true,"LIF":true,"EFX":true,"LND":true,"MNRB":true,"FTO":true,"HPAY":true,"CARE":true,"NZL":true,"XMC":true,"OAK":true,"DML":true,"TIPS":true,"TBX":true,"WCOIN":true,"CHARM":true,"PROTON":true,"DEAL":true,"JUMP":true,"ZCO":true,"TRAXIA":true,"SS":true,"0XBTC":true,"XMO":true,"APH":true,"NBAI":true,"TUT":true,"BETT":true,"NOAH":true,"PAL":true,"BFDT":true,"KEP":true,"RUBY":true,"CTKN":true,"YUM":true,"FNP":true,"VLUX":true,"SSH":true,"XBI":true,"MRK":true,"FRV":true,"WINS":true,"XES":true,"RTB":true,"DXC":true,"CHBR":true,"OWD":true,"ELLI":true,"DAN":true,"CSEN":true,"GBG":true,"SHL":true,"IVY":true,"KEC":true,"AMN":true,"SABR":true,"HWC":true,"BITGOLD":true,"BITSILVER":true,"GIN":true,"NLX":true,"LNKC":true,"STM":true,"ITL":true,"AITT":true,"ITM":true,"SNTR":true,"ZMR":true,"XMV":true,"HER":true,"PARLAY":true,"SLX":true,"LTCC":true,"RST":true,"AMX":true,"TFC":true,"IRC":true,"PLATC":true,"OIO":true,"ANGL":true,"ANTS":true,"STT":true,"WYS":true,"COG":true,"ZIPT":true,"OSA":true,"EXC":true,"BCIO":true,"BMK":true,"ROC":true,"LYL":true,"PHI":true,"PMNT":true,"BNTN":true,"HYT":true,"GRMD":true,"SSC":true,"BKT":true,"STAX":true,"MRN":true,"FOPA":true,"OOT":true,"SIC":true,"REL":true,"EJAC":true,"XT3":true,"MGD":true,"VIG":true,"PLURA":true,"SWACH":true,"NWCN":true,"ICST":true,"XTNC":true,"ROE":true,"DKD":true,"POSQ":true,"YCE":true,"OCX":true,"STOR":true,"ARO":true,"BWS":true,"BTCC":true,"GOLF":true,"XCEL":true,"ECH":true,"XMN":true,"PLUS1":true,"COI":true,"CANDY":true,"AXE":true,"SHARD":true,"GMCN":true,"TRVC":true,"BITX":true,"SKRB":true,"HFT":true,"OOW":true,"DTEM":true,"TIP":true,"HB":true,"TRW":true,"GIC":true,"ZMN":true,"PNY":true,"SAFE":true,"COU":true,"ABS":true,"VITAE":true,"0xDIARY":true,"BSPM":true,"TDP":true,"XGS":true,"XUEZ":true,"BIM":true,"WORX":true,"Dow":true,"PYT":true,"DEI":true,"OYS":true,"JEX":true,"ILK":true,"RYO":true,"URALS":true,"QWC":true,"BITN":true,"DACASH":true,"EUNO":true,"KAAS":true,"MMO":true,"DASC":true,"PGTS":true,"SLST":true,"SPN":true,"ZINC":true,"KETAN":true,"NIX":true,"ZCN":true,"RPM":true,"DGX":true,"ITA":true,"NOM":true,"XSTC":true,"U42":true,"EGCC":true,"FREC":true,"DCC":true,"MOTI":true,"PCO":true,"XPST":true,"MCV":true,"SCRL":true,"CONI":true,"XPAT":true,"MBLC":true,"DIW":true,"JOINT":true,"IDXM":true,"CCO":true,"TKA":true,"GETX":true,"BWT":true,"EMV":true,"ESZ":true,"TRAK":true,"BTRN":true,"VME":true,"PERU":true,"VITE":true,"BBO":true,"YUP":true,"SNIP":true,"SAL":true,"CARD":true,"THRT":true,"GTK":true,"SKRP":true,"AVH":true,"SCC":true,"HALO":true,"BSTN":true,"PITCH":true,"NANJ":true,"DIT":true,"AZART":true,"RDC":true,"TTU":true,"AOP":true,"XAP":true,"INTO":true,"AIMS":true,"SEER":true,"SPLB":true,"CMZ":true,"NOBS":true,"HMN":true,"MHP":true,"HMD":true,"JSE":true,"IMGZ":true,"IAM":true,"URB":true,"CHART":true,"WHEN":true,"SFT":true,"ORBIS":true,"BLKS":true,"ETRNT":true,"ITR":true,"ZEEW":true,"ENTRY":true,"PHTC":true,"ZAZA":true,"DNET":true,"IDAP":true,"HEAL":true,"OFCR":true,"SHPT":true,"RBDT":true,"SKYFT":true,"TFLEX":true,"STRY":true,"GBTC":true,"NBOX":true,"BUD":true,"DBCCOIN":true,"K2G":true,"SPOT":true,"VTUUR":true,"ETI":true,"FRECNX":true,"LAX":true,"DREAM":true,"PTI":true,"LPC":true,"MFX":true,"NOIZ":true,"SPIKE":true,"SGO":true,"RAWG":true,"BDB":true,"ZNAQ":true,"YBT":true,"OPET":true,"PSK":true,"COT":true,"WPT":true,"ABELE":true,"ARBT":true,"BILL":true,"XDT":true,"WPP":true,"SLT":true,"CCCX":true,"VRH":true,"AEN":true,"SOLID":true,"VANIG":true,"AIRE":true,"GMA":true,"WMB":true,"MVU":true,"TLNT":true,"GLDR":true,"IMU":true,"TRT":true,"CRS":true,"URT":true,"CRON":true,"DIP":true,"PROD":true,"REDC":true,"ZCHN":true,"TTV":true,"OICOIN":true,"ENQ":true,"DTN":true,"IDM":true,"SIDT":true,"CDPT":true,"CRGO":true,"QRP":true,"TIIM":true,"BNR":true,"ZCC1":true,"KRP":true,"OLE":true,"AMLT":true,"HGO":true,"TCOIN":true,"BZ":true,"VLP":true,"BTK":true,"BOUTS":true,"EST":true,"OGT":true,"NPER":true,"ATON":true,"EURS":true,"XCG":true,"BOONS":true,"PCH":true,"OPU":true,"ETALON":true,"TICS":true,"ZPR":true,"ESTATE":true,"BLV":true,"RRC":true,"MPG":true,"IG":true,"FML":true,"TLU":true,"PSM":true,"AUDC":true,"NMH":true,"KST":true,"DEL":true,"PBLK":true,"MDN":true,"GPPT":true,"BRNX":true,"SRCOIN":true,"MMTM":true,"XGH":true,"DICEM":true,"PASS":true,"HRO":true,"BSCH":true,"TRVR":true,"PESA":true,"CLPX":true,"DAOX":true,"GLN":true,"AUK":true,"PCCM":true,"PLAN":true,"TRAID":true,"BNTE":true,"MIB":true,"LYNK":true,"TBC":true,"CCL":true,"TCX":true,"HLD":true,"NUSD":true,"TCHB":true,"DAX":true,"BECH":true,"CIC":true,"MIODIO":true,"MOV":true,"IHF":true,"CNAB":true,"SGP":true,"LTPC":true,"HANA":true,"BTV":true,"URP":true,"SHE":true,"IVN":true,"ZAT":true,"IMT":true,"ROBET":true,"CRYP":true,"BONIX":true,"BTXC":true,"DAPS":true,"ETE":true,"NHCT":true,"AZ":true,"SWA":true,"USDCT":true,"MTCMN":true,"ZEST":true,"CSP":true,"USDC":true,"NRVE":true,"XCASH":true,"RMESH":true,"GBXT":true,"ABCC":true,"BASIS":true,"JIB":true,"PMTN":true,"PHM":true,"CUSD":true,"KUSD":true,"VEOT":true,"GGR":true,"MENLO":true,"METM":true,"ARAW":true,"BRAZ":true,"TALAO":true,"IZX":true,"DIVI":true,"HQT":true,"NBAR":true,"KBX":true,"MYDFS":true,"BHPC":true,"VTOS":true,"M2O":true,"SLY":true,"BEAT":true,"MOLK":true,"MSD":true,"SEED":true,"SEALN":true,"GBO":true,"DFXT":true,"NWP":true,"EVOS":true,"DEEX":true,"LTZ":true,"MTZ":true,"TBL":true,"BXY":true,"KUE":true,"ESN":true,"H3O":true,"BETHER":true,"WTL":true,"HIH":true,"ANGEL":true,"P2PS":true,"TWISTR":true,"CXA":true,"BITTO":true,"UMK":true,"VNX":true,"WMK":true,"OJX":true,"CHW":true,"VEX":true,"LQDN":true,"BIOC":true,"CPLO":true,"XPX":true,"RIPAX":true,"HETA":true,"NOW":true,"CIX100":true,"FIH":true,"MINX":true,"MOBU":true,"NVDX":true,"COVEX":true,"TAL":true,"F2K":true,"GTX":true,"LK":true,"QOBI":true,"BVO":true,"VENA":true,"CDRX":true,"ELES":true,"GEON":true,"TZO":true,"WLME":true,"INVX":true,"ABXC":true,"LINKC":true,"IMPCN":true,"FORK":true,"NMK":true,"OUT":true,"IOVT":true,"MYO":true,"ORET":true,"SEC":true,"QUIZ":true,"CYRS":true,"UTL":true,"JOYS":true,"DACH":true,"MNVM":true,"PLTX":true,"BTMG":true,"BRIK":true,"XTN":true,"BTZN":true,"CLRTY":true,"NAVIB":true,"ARTP":true,"PLEO":true,"GDX":true,"EGDC":true,"ENTT":true,"RWD":true,"AURUM":true,"WRL":true,"CRWD":true,"ENCN":true,"EYE":true,"GTR":true,"HXC":true,"OPEX":true,"SKYM":true,"SCIA":true,"TXP":true,"GPS":true,"WTXH":true,"BBG":true,"NZE":true,"SHKG":true,"TENZ":true,"TWC":true,"WUG":true,"CAND":true,"CTW":true,"XIM":true,"NAM":true,"2TF":true,"BZKY":true,"CARAT":true,"ZILLA":true,"TCJ":true,"MAEP":true,"DN8":true,"XNT":true,"LX":true,"AWAX":true,"TKD":true,"VTAG":true,"WBY":true,"BBOS":true,"BFEX":true,"HUS":true,"APXT":true,"IDORU":true,"WOM":true,"BONA":true,"HLDY":true,"HORUS":true,"MEETONE":true,"IOTW":true,"EMPR":true,"MPAY":true,"AGM":true,"MTCN":true,"PTO":true,"AS":true,"OSF":true,"DLPT":true,"GREENT":true,"VIDI":true,"ZYM":true,"RPB":true,"DYNCOIN":true,"MIT":true,"VANM":true,"PSF":true,"LITION":true,"MZG":true,"VIAZ":true,"BTZC":true,"ECR":true,"RF":true,"ARMS":true,"MPXT":true,"XELS":true,"PGF7T":true,"ZUUM":true,"UCOINT":true,"YDY":true,"FTUM":true,"SPON":true,"DLXV":true,"OCEANT":true,"TECO":true,"GOALS":true,"ETHIX":true,"TTB":true,"CHK":true,"VLTX":true,"OASC":true,"TREE":true,"FTRC":true,"HBX":true,"LAO":true,"GOVT":true,"COGEN":true,"DAILY":true,"SREUR":true,"MAZC":true,"TGTC":true,"PLNX":true,"IPT":true,"IGTT":true,"SRXIO":true,"GZB":true,"GGP":true,"IFUM":true,"ATC":true,"DOOH":true,"IOUX":true,"BQTX":true,"NVOY":true,"CYBR":true,"LLG":true,"LCR":true,"SNPC":true,"VTM":true,"NRX":true,"BTSG":true,"CINX":true,"CCIN":true,"CCI":true,"RDS":true,"GMS":true,"SGAT":true,"SILKT":true,"TCHN":true,"ICHN":true,"AENT":true,"LYFE":true,"REMCO":true,"GEMA":true,"VTEX":true,"SRV":true,"YMZ":true,"AER":true,"ASQT":true,"BLKD":true,"CYS":true,"DDL":true,"COY":true,"FNL":true,"B2G":true,"CSQ":true,"HBE":true,"ICT":true,"CPROP":true,"MOOLYA":true,"PON":true,"CREV":true,"VAD":true,"IDC":true,"LBR":true,"EMX":true,"XBASE":true,"LEN":true,"KUBO":true,"FABA":true,"LQ8":true,"GC":true,"INFLR":true,"LIB":true,"PERMIAN":true,"PETL":true,"XDMC":true,"PPS":true,"SMILO":true,"BCVB":true,"TREX":true,"VNS":true,"VRF":true,"AUX":true,"LYQD":true,"CBP":true,"SMOKE":true,"EDN":true,"DT1":true,"FARMA":true,"STACS":true,"JMC":true,"FRED":true,"CNCT":true,"ENGT":true,"VRTY":true,"TEAMT":true,"3XD":true,"FPC":true,"SYNCO":true,"77G":true,"HIDU":true,"USE":true,"NGIN":true,"KOTO":true,"VTL":true,"SECI":true,"SPRTZ":true,"C25":true,"LYN":true,"STASH":true,"HERB":true,"XQR":true,"URX":true,"KSYS":true,"MTEL":true,"MTT":true,"MITC":true,"BBTC":true,"UMO":true,"MUST":true,"ELT":true,"XNB":true,"BTCEX":true,"EXO":true,"ONAM":true,"BIH":true,"CJR":true,"BLTG":true,"ASGC":true,"MIMI":true,"PXG":true,"ORM":true,"TRET":true,"SET":true,"BEER":true,"TIMI":true,"NRP":true,"CEN":true,"UNX":true,"OWC":true,"WOWX":true,"THO":true,"TOSS":true,"KMX":true,"SG":true,"SUNEX":true,"XRBT":true,"XBOND":true,"BOSE":true,"JOY":true,"GBE":true,"HRBE":true,"PINMO":true,"POPC":true,"SCOP":true,"BMG":true,"OXY2":true,"VC":true,"FAIRC":true,"BPN":true,"DYC":true,"LN":true,"FTR":true,"RWE":true,"TASH":true,"TXM":true,"TRAVEL":true,"AUPC":true,"COSX":true,"DNTX":true,"HART":true,"KSS":true,"LIPS":true,"MIBO":true,"BRIX":true,"NZO":true,"PTT":true,"XRK":true,"RMOB":true,"XRF":true,"SUT":true,"VRX Token":true,"WDX":true,"AIOT":true,"AMOS":true,"ESW":true,"XBANK":true,"OX":true,"CAID":true,"GUAR":true,"LTE":true,"NEXXO":true,"QNTR":true,"BTCUS":true,"RAYS":true,"MOL":true,"REME":true,"RENC":true,"TLT":true,"EMOT":true,"USAT":true,"VOLAIR":true,"AIRT":true,"VTRD":true,"GALI":true,"BTU":true,"APS":true,"XBX":true,"FFUEL":true,"NSP":true,"SNcoin":true,"TTNT":true,"BWT2":true,"OATH":true,"SBA":true,"DXG":true,"EXTP":true,"ZEX":true,"XCZ":true,"CBUK":true,"HIX":true,"TGN":true,"COGS":true,"XRM":true,"CCOIN":true,"APZ":true,"ICHX":true,"IMP":true,"FORCE":true,"QUSD":true,"PLG":true,"PVP":true,"RAIZER":true,"DAYTA":true,"ORV":true,"AQU":true,"CXG":true,"CHFT":true,"VNTY":true,"SSX":true,"KLK":true,"LVN":true,"FFCT":true,"AZU":true,"ARQ":true,"WU":true,"ZUC":true,"GTIB":true,"CR":true,"VEO":true,"DLA":true,"BB1":true,"DAGT":true,"GVE":true,"KUV":true,"YACHTCO":true,"BOLTT":true,"ENCX":true,"VALID":true,"TYM":true,"VENUS":true,"HYGH":true,"ALCE":true,"NODIS":true,"MNC":true,"HVE":true,"XR":true,"ALP":true,"EMU":true,"ARTC":true,"NRM":true,"APOD":true,"AX":true,"CWEX":true,"ECTE":true,"LABX":true,"GEP":true,"IZA":true,"GBA":true,"ITU":true,"FANZ":true,"CSPN":true,"CCH":true,"XOV":true,"EQUAD":true,"CURA":true,"ERA":true,"MAKE":true,"SPKZ":true,"SCRIBE":true,"SQR":true,"GNC":true,"WVR":true,"PHT":true,"WHN":true,"LYTX":true,"TJA":true,"InBit":true,"DIO":true,"LIC":true,"SCA":true,"XOS":true,"UGT":true,"ZEON":true,"XRX":true,"PARQ":true,"T4M":true,"TFF":true,"IZZY":true,"SONT":true,"SWI":true,"LUNES":true,"EDEXA":true,"PPI":true,"ANTE":true,"TRXDICE":true,"AFTT":true,"TRXWIN":true,"IGG":true,"MIG":true,"BWN":true,"IPUX":true,"PCC":true,"DARB":true,"MBTX":true,"CFun":true,"AAS":true,"VOLLAR":true,"DXN":true,"BUYI":true,"AFCT":true,"INET":true,"WHY":true,"URIS":true,"ADUX":true,"HRD":true,"QCO":true,"SHER":true,"ZEROB":true,"ISG":true,"GEC":true,"TAGZ":true,"SKP":true,"MCRC":true,"XGN":true,"YPTO":true,"UBE":true,"ETGP":true,"GFCS":true,"IX":true,"HCXP":true,"AGRO":true,"BYTS":true,"EUCX":true,"MYTV":true,"LEVL":true,"PRY":true,"TTC":true,"BCNX":true,"EVED":true,"HTER":true,"GESE":true,"GIF":true,"2KEY":true,"DEVX":true,"TMB":true,"HBRS":true,"XPL":true,"MTSH":true,"TEMPO":true,"PPR":true,"REW":true,"STE":true,"TPLAY":true,"TELE":true,"UDOO":true,"KICKS":true,"SPORTG":true,"CRES":true,"AES":true,"AIBK":true,"STONE":true,"OILD":true,"VLM":true,"LOLC":true,"LOTES":true,"LOTEU":true,"RVO":true,"KBT":true,"USDX":true,"LHT":true,"PLAT":true,"NYCREC":true,"NSD":true,"BOLT":true,"SPT":true,"FBB":true,"TCST":true,"BSAFE":true,"DBTN":true,"HET":true,"DARC":true,"CMA":true,"MAPR":true,"PBET":true,"PUX":true,"YANU":true,"XCB":true,"RSF":true,"WMD":true,"TOYKEN":true,"XAL":true,"TAS":true,"UNTD":true,"COVA":true,"GEX":true,"VDL":true,"TMN":true,"ASST":true,"BEET":true,"IFX":true,"MART":true,"TC":true,"GNTO":true,"LMXC":true,"UTPL":true,"GDR":true,"LNX":true,"ORIGIN":true,"NTO":true,"TXT":true,"SCONE":true,"VLS":true,"AWR":true,"ULED":true,"UVU":true,"KOZ":true,"SMAT":true,"IOWN":true,"AYA":true,"BUSDC":true,"BLAST":true,"ZOPT":true,"FILM":true,"VDX":true,"CKUSD":true,"CTPT":true,"ESBC":true,"GRAYLL":true,"SERV":true,"PTON":true,"DPN":true,"THEMIS":true,"PLY":true,"BWX":true,"VST":true,"BOXX":true,"UT":true,"WINT":true,"DVT":true,"BOMB":true,"BRYLL":true,"CAM":true,"BITNEW":true,"BCV":true,"FLC":true,"INB":true,"BIHU":true,"1SG":true,"KT":true,"INE":true,"AT":true,"DEX":true,"ELD":true,"UND":true,"PEOS":true,"GTN":true,"VIPS":true,"BBGC":true,"INFC":true,"WGP":true,"NPXSXEM":true,"USCC":true,"ANDC":true,"MRS":true,"NNB":true,"USDQ":true,"WWB":true,"VANT":true,"BTCB":true,"IONC":true,"CNUS":true,"SDA":true,"SMARTUP":true,"UIP":true,"JCT":true,"DOS":true,"DLO":true,"DUOT":true,"AIRX":true,"MIN":true,"B91":true,"AIDT":true,"ALI":true,"CLB":true,"CZR":true,"GSE":true,"KNT":true,"KWATT":true,"MAS":true,"UCH":true,"VDG":true,"PRS":true,"EHRT":true,"XRC":true,"TERA":true,"VOCO":true,"TNS":true,"SOP":true,"TYPE":true,"CYL":true,"HLT":true,"E2C":true,"TAC":true,"TENX":true,"EKG":true,"PHV":true,"ONOT":true,"BITRUE":true,"SWAPS":true,"ACDC":true,"YEC":true,"ADN":true,"FTN":true,"NTY":true,"ADRX":true,"MESG":true,"SHX":true,"UPX":true,"BCT":true,"TRTT":true,"ABX":true,"MONT":true,"TN":true,"PBQ":true,"ZDR":true,"DOCT":true,"TCHAIN":true,"XRTC":true,"VOL":true,"BSOV":true,"NAT":true,"RET":true,"GMAT":true,"HUM":true,"BCAC":true,"XD":true,"OTO":true,"BQQQ":true,"LOCUS":true,"COZP":true,"OGOD":true,"FOIN":true,"YTA":true,"LXT":true,"IMG":true,"DPT":true,"TRAT":true,"OPNN":true,"SINS":true,"DXR":true,"PC":true,"GOS":true,"DEFI":true,"BXK":true,"KNOW":true,"XPC":true,"ACD":true,"AMON":true,"BENZI":true,"BGBP":true,"BHP":true,"XCHF":true,"BXA":true,"CBNT":true,"DEEP":true,"DOC":true,"DTC":true,"DWC":true,"ELAC":true,"ETSC":true,"FMEX":true,"FTK":true,"GE":true,"GOT":true,"ITOC":true,"JCB":true,"KSC":true,"LHD":true,"LKN":true,"MMT":true,"OSC":true,"PIB":true,"PNK":true,"PROT":true,"QQBC":true,"SPIN":true,"TCNX":true,"THEX":true,"UAT":true,"UENC":true,"URAC":true,"USDSB":true,"VINCI":true,"WLO":true,"XENO":true,"XSR":true,"ZAIF":true,"ETM":true,"FAB":true,"VD":true,"NYE":true,"STREAM":true,"BPRO":true,"TOL":true,"CVCC":true,"EVT":true,"NTBC":true,"ATN":true,"NASH":true,"CUST":true,"QCH":true,"FO":true,"SON":true,"BQT":true,"WSD":true,"SDS":true,"ZT":true,"GOM":true,"OF":true,"CBM":true,"EMRX":true,"IZI":true,"UC":true,"TOSC":true,"OVC":true,"MCC":true,"HVNT":true,"MEXC":true,"NSS":true,"TRP":true,"MB":true,"CENT":true,"MB8":true,"HSN":true,"IDRT":true,"ZUM":true,"PIPL":true,"BNANA":true,"VNDC":true,"HUSD":true,"GAP":true,"DDAM":true,"PLAC":true,"MOGU":true,"CXCELL":true,"BGONE":true,"FLAS":true,"DEQ":true,"BCB":true,"LBK":true,"GSTT":true,"TREEC":true,"SCTK":true,"SINX":true,"HAZ":true,"AIPE":true,"MISS":true,"DKKT":true,"BTY":true,"CSAC":true,"TEM":true,"DMC":true,"KISC":true,"VBT":true,"G50":true,"SEOS":true,"ODC":true,"GALT":true,"LTBTC":true,"TENA":true,"SPLA":true,"UNICORN":true,"EONC":true,"PRCM":true,"BFCH":true,"LIGHT":true,"CBFT":true,"TRDS":true,"ETHPLO":true,"LKU":true,"SUTER":true,"FMCT":true,"LINKA":true,"ZVC":true,"OROX":true,"OLXA":true,"WIX":true,"BRZE":true,"BCZERO":true,"BTC2":true,"ECOREAL":true,"S4F":true,"BIPX":true,"BOK":true,"TEP":true,"TSR":true,"HNB":true,"DILI":true,"CAI":true,"FLG":true,"MCH":true,"7E":true,"XTX":true,"LOBS":true,"MGX":true,"DAD":true,"SOVE":true,"BCS":true,"THP":true,"TKC":true,"LT":true,"MSN":true,"W1":true,"OFBC":true,"CB":true,"TD":true,"DRINK":true,"SNL":true,"EOSC":true,"GLOS":true,"SEA":true,"CBE":true,"DZCC":true,"TRCB":true,"UIN":true,"XFC":true,"ROAD":true,"BRZ":true,"GKI":true,"FBN":true,"EVY":true,"PTN":true,"TDE":true,"ECP":true,"XBG":true,"PP":true,"CNTM":true,"SCAP":true,"FN":true,"DYNMT":true,"MDM":true,"CCA":true,"DFP":true,"QTCON":true,"GTSE":true,"API":true,"RES":true,"AMAL":true,"BIUT":true,"MLGC":true,"PSC":true,"DMTC":true,"DAMO":true,"XSPC":true,"USDG":true,"DGLD":true,"LVIP":true,"BOA":true,"CHARS":true,"TYT":true,"NVL":true,"CWBTC":true,"FCQ":true,"BTCK":true,"DAVP":true,"XTP":true,"CUT":true,"VEN":true,"LTBX":true,"ZANO":true,"CYBER":true,"KOK":true,"KSH":true,"HTDF":true,"N8V":true,"EBK":true,"PEG":true,"ERK":true,"BNP":true,"APM":true,"BLTV":true,"RRB":true,"MESH":true,"HINT":true,"ALY":true,"SPOK":true,"USDH":true,"GARK":true,"IDHUB":true,"IOEX":true,"LM":true,"BIKI":true,"DLX":true,"DALI":true,"FLDT":true,"TCO":true,"ETY":true,"LBXC":true,"JOB":true,"VEIL":true,"BTBL":true,"MKEY":true,"TAUC":true,"GIB":true,"SCDS":true,"CCX":true,"SYM":true,"GIX":true,"SENNO":true,"BEP":true,"GANA":true,"KAL":true,"AIDUS":true,"STEEP":true,"ZOC":true,"YTN":true,"SCRIV":true,"AREPA":true,"CHEESE":true,"PEPS":true,"OMEGA":true,"BBS":true,"BZL":true,"GSR":true,"VARIUS":true,"AGET":true,"ZCR":true,"AEVO":true,"NAH":true,"EGEM":true,"DXO":true,"GOSS":true,"NYEX":true,"GIO":true,"TELOS":true,"SIERRA":true,"VIVID":true,"RPD":true,"PENG":true,"MERI":true,"KTS":true,"NOR":true,"X42":true,"XWP":true,"CSNP":true,"CALL":true,"MOCO":true,"ARMR":true,"DIVO":true,"HUSL":true,"WLF":true,"CTAG":true,"CWN":true,"BLINK":true,"JUL":true,"BC":true,"NCOV":true,"ES":true,"EER":true,"USDA":true,"DBY":true,"KAM":true,"EBASE":true,"SWYFTT":true,"DOGZ":true,"WPX":true,"GFUN":true,"NWC":true,"JMT":true,"URBC":true,"ABA":true,"DSC":true,"DAPP":true,"XNC":true,"AMDC":true,"NNC":true,"CCTN":true,"TWEE":true,"KBOT":true,"EOSBULL":true,"XRPBEAR":true,"EUSD":true,"ETR":true,"FK":true,"XLA":true,"TCC":true,"AUNIT":true,"BNBBULL":true,"ODX":true,"TRXBULL":true,"TRXBEAR":true,"LTCBULL":true,"LTCBEAR":true,"BKRW":true,"HBD":true,"FRSP":true,"ELAMA":true,"ANCT":true,"USDJ":true,"QC":true,"ALV":true,"GZE":true,"DACS":true,"NII":true,"UPEUR":true,"UPUSD":true,"CIM":true,"LCX":true,"THX!":true,"COSP":true,"MZK":true,"HUNT":true,"VNXLU":true,"AIN":true,"BTCHG":true,"300F":true,"HKDX":true,"CNYX":true,"NZDX":true,"CHFX":true,"CADX":true,"USDEX":true,"JPYX":true,"AUDX":true,"GOLDX":true,"ZARX":true,"TRYX":true,"SGDX":true,"RUBX":true,"POLNX":true,"EXCHBULL":true,"ALTBEAR":true,"ZLS":true,"PGX":true,"SLVX":true,"DEP":true,"CTT":true,"KDG":true,"HMR":true,"KIM":true,"LMCH":true,"SNB":true,"CBUCKS":true,"LAR":true,"EUCOIN":true,"QBZ":true,"BSVBULL":true,"BSVBEAR":true,"FF1":true,"BCHBULL":true,"BCHBEAR":true,"ISIKC":true,"ZFL":true,"PCX":true,"MWC":true,"IDNA":true,"IZER":true,"XXA":true,"STAKE":true,"IBVOL":true,"BVOL":true,"SATX":true,"UFOC":true,"BONO":true,"WADS":true,"ALA":true,"XTZBULL":true,"XTZBEAR":true,"EC":true,"BTCT":true,"BTCSHORT":true,"CNRG":true,"ADAI":true,"ZNZ":true,"GLEEC":true,"LRG":true,"RVX":true,"ANJ":true,"WET":true,"YOUC":true,"CWR":true,"IBS":true,"ZTN":true,"DGN":true,"TRNSC":true,"GLDS":true,"CTE":true,"LLION":true,"SOW":true,"PWON":true,"Si14":true,"SKFT":true,"TUNEZ":true,"BRAND":true,"NTS":true,"WSLT":true,"ENC":true,"SETI":true,"SDAT":true,"IGCH":true,"PXB":true,"LUM":true,"TYC":true,"JACS":true,"SETS":true,"WOONK":true,"ESH":true,"CPI":true,"1GOLD":true,"LOON":true,"NDN":true,"GGC":true,"XIO":true,"1UP":true,"AFFC":true,"BAN":true,"BBDT":true,"CDL":true,"GLDY":true,"CNHT":true,"1211.CUR":true,"1810.CUR":true,"9988.CUR":true,"TERADYNE":true,"SESG.CUR":true,"TRIPAD":true,"PNC.CUR":true,"EXAS.CUR":true,"IPN.CUR":true,"STM.CUR":true,"TSLA.CUR":true,"SDC.CUR":true,"JBL.CUR":true,"WLL.CUR":true,"Oil - Crude.CUR":true,"BILL.CUR":true,"BBY.CUR":true,"BILI.CUR":true,"GME.CUR":true,"AA.CUR":true,"BSX.CUR":true,"TFX.CUR":true,"NKE.CUR":true,"ABBV.CUR":true,"AN.CUR":true,"AAP.CUR":true,"AR.CUR":true,"RH.CUR":true,"JCP.CUR":true,"EPAM.CUR":true,"ATVI.CUR":true,"WMT.CUR":true,"BA.CUR":true,"TGT.CUR":true,"YNDX.CUR":true,"ROKU.CUR":true,"CVS.CUR":true,"C.CUR":true,"LHA.CUR":true,"BLUE.CUR":true,"F.CUR":true,"DDOG.CUR":true,"K.CUR":true,"M.CUR":true,"SOHU.CUR":true,"DHR.CUR":true,"TXT.CUR":true,"SLCA.CUR":true,"R.CUR":true,"BYND.CUR":true,"S.CUR":true,"IBM.CUR":true,"XPO.CUR":true,"V.CUR":true,"W.CUR":true,"VI":true,"SDT":true,"FORESTPLUS":true,"DDK":true,"MTXLT":true,"LQBTC":true,"XPR":true,"UTI":true,"CN50.CUR":true,"SQ.CUR":true,"CC.CUR":true,"NVDA.CUR":true,"NZD.CUR":true,"TWTR.CUR":true,"MTCH.CUR":true,"FTXR.CUR":true,"FR40.CUR":true,"SWN.CUR":true,"DIS.CUR":true,"INTC.CUR":true,"INCY.CUR":true,"TEAM.CUR":true,"AMZN.CUR":true,"DWDP.CUR":true,"ALXN.CUR":true,"AUD.CUR":true,"DE30.CUR":true,"DE.CUR":true,"DG.CUR":true,"SRPT.CUR":true,"APAM.CUR":true,"CHK.CUR":true,"KHC.CUR":true,"BBBY.CUR":true,"GPS.CUR":true,"ADS.CUR":true,"CRON.CUR":true,"FIVE.CUR":true,"PBF.CUR":true,"TLRY.CUR":true,"GRUB.CUR":true,"PAYC.CUR":true,"DLPH.CUR":true,"BABA.CUR":true,"JWN.CUR":true,"PBR.CUR":true,"GOLD.CUR":true,"CHF.CUR":true,"NL25.CUR":true,"EMN.CUR":true,"HCA.CUR":true,"PBYI.CUR":true,"AEM.CUR":true,"SIG.CUR":true,"Silver.CUR":true,"SYY.CUR":true,"NOW.CUR":true,"VOO.CUR":true,"EXEL.CUR":true,"ICPT.CUR":true,"FB.CUR":true,"QRVO.CUR":true,"OAS.CUR":true,"CSCO.CUR":true,"IT40.CUR":true,"PTON.CUR":true,"GPRO.CUR":true,"GWPH.CUR":true,"FP.CUR":true,"MNK.CUR":true,"WB.CUR":true,"NTES.CUR":true,"MSFT.CUR":true,"SHOP.CUR":true,"WBA.CUR":true,"LLY.CUR":true,"IFX.CUR":true,"GD.CUR":true,"GE.CUR":true,"NKTR.CUR":true,"MOMO.CUR":true,"BIG.CUR":true,"ONEM.CUR":true,"WATT.CUR":true,"ALLY.CUR":true,"AGN.CUR":true,"SWKS.CUR":true,"CAD.CUR":true,"AFp.CUR":true,"GT.CUR":true,"AZBI":true,"DVX":true,"ASM":true,"GHOST":true,"HIBS":true,"BZUN.CUR":true,"TMUS.CUR":true,"XEC.CUR":true,"CLVS.CUR":true,"PEP.CUR":true,"TEVA.CUR":true,"ISRG.CUR":true,"BIDU.CUR":true,"PFE.CUR":true,"522.CUR":true,"COMM.CUR":true,"SBUX.CUR":true,"IRBT.CUR":true,"SBER.CUR":true,"VOW3.CUR":true,"YY.CUR":true,"OGZD.CUR":true,"DLTR.CUR":true,"IP.CUR":true,"ALNY.CUR":true,"AIR.CUR":true,"SMG.CUR":true,"MAC.CUR":true,"YOLO.CUR":true,"FVRR.CUR":true,"FSLR.CUR":true,"JKS.CUR":true,"RNX":true,"KDAG":true,"DRM":true,"PAXGBULL":true,"PAXGBEAR":true,"PAXGHALF":true,"PHNX":true,"MHLX":true,"SPICE":true,"GGOLD":true,"ALCH":true,"SODA":true,"GILD.CUR":true,"RAD.CUR":true,"APA.CUR":true,"MGM.CUR":true,"GRMN.CUR":true,"UAA.CUR":true,"ADNT.CUR":true,"LYFT.CUR":true,"WORK.CUR":true,"MCHP.CUR":true,"MRVL.CUR":true,"US500.CUR":true,"MRK.CUR":true,"NDA.CUR":true,"SNE.CUR":true,"CNX.CUR":true,"VNET.CUR":true,"WFC.CUR":true,"QCOM.CUR":true,"SP35.CUR":true,"FDX.CUR":true,"US30.CUR":true,"TPX.CUR":true,"NFLX.CUR":true,"TWLO.CUR":true,"KO.CUR":true,"RMD.CUR":true,"BTC3L":true,"EU50.CUR":true,"DAI.CUR":true,"BTC3S":true,"BMW.CUR":true,"ETH3L":true,"DAL.CUR":true,"MCD.CUR":true,"ETH3S":true,"ADABEAR":true,"ADABULL":true,"MATICBEAR":true,"ATOMBULL":true,"ATOMBEAR":true,"ALGOBULL":true,"ALGOBEAR":true,"KNCBULL":true,"THETABULL":true,"KNCBEAR":true,"BEARSHIT":true,"ETCBULL":true,"ETCBEAR":true,"TOMOBEAR":true,"TOMOBULL":true,"DRGNBEAR":true,"DRGNBULL":true,"THETABEAR":true,"MIDBEAR":true,"MIDBULL":true,"OKBBEAR":true,"OKBBULL":true,"BTMXBEAR":true,"BTMXBULL":true,"LEOBULL":true,"LEOBEAR":true,"HTBEAR":true,"HTBULL":true,"DOGEBEAR":true,"PRIVBEAR":true,"PRIVBULL":true,"USDTBULL":true,"USDTBEAR":true,"WDAY.CUR":true,"SNAP.CUR":true,"241.CUR":true,"HMI.CUR":true,"XLV.CUR":true,"PYPL.CUR":true,"SSA.CUR":true,"UBER.CUR":true,"VLDY":true,"NEE.CUR":true,"CPRT.CUR":true,"CPB.CUR":true,"LB.CUR":true,"NEM.CUR":true,"ADPT.CUR":true,"ETL.CUR":true,"NET.CUR":true,"OSTK.CUR":true,"AMUN.CUR":true,"BMRN.CUR":true,"Platinum.CUR":true,"TTWO.CUR":true,"NCLH.CUR":true,"GOOGL.CUR":true,"BNTX.CUR":true,"EDF.CUR":true,"CBK.CUR":true,"OCFT.CUR":true,"EXPE.CUR":true,"JNJ.CUR":true,"JPM.CUR":true,"VGT.CUR":true,"BIIB.CUR":true,"PTEN.CUR":true,"STLD.CUR":true,"TRI.CUR":true,"GLPG.CUR":true,"YELP.CUR":true,"ARNC.CUR":true,"ADBE.CUR":true,"SAGE.CUR":true,"LKOD.CUR":true,"EBAY.CUR":true,"DBK.CUR":true,"Palladium.CUR":true,"ORCL.CUR":true,"LX.CUR":true,"CAG.CUR":true,"1COV.CUR":true,"MU.CUR":true,"SPN.CUR":true,"CTLT.CUR":true,"CIEN.CUR":true,"MJ.CUR":true,"DBX.CUR":true,"AMD.CUR":true,"XLNX.CUR":true,"MC.CUR":true,"MA.CUR":true,"RNO.CUR":true,"FTCH.CUR":true,"OHL.CUR":true,"TER.CUR":true,"TRIP.CUR":true,"BTRS":true,"D4RK":true,"BIDR":true,"DAWN":true,"IDK":true,"BTSE":true,"PAMP":true,"CODEO":true,"MP":true,"BTE":true,"LUCY":true,"POL":true,"PMGT":true,"PAZZI":true,"ISP":true,"SILKR":true,"CCOMM":true,"LACCOIN":true,"BASIC":true,"VARC":true,"TRCL":true,"EFK":true,"INNOU":true,"CVS":true,"ZLST":true,"JUR":true,"OZP":true,"SAC1":true,"BKS":true,"CCXX":true,"BPS":true,"RAKU":true,"DMCH":true,"PLAAS":true,"NEAL":true,"VEDX":true,"WEST":true,"BRTR":true,"UFC":true,"TTM":true,"IDX":true,"FXF":true,"OKS":true,"XANK":true,"BLX":true,"FOUR":true,"XGM":true,"STONK":true,"NEXBT":true,"ECOCH":true,"PROB":true,"DEMOS":true,"NEST":true,"HYBN":true,"UHP":true,"IMST":true,"GEODB":true,"UBU":true,"ATT":true,"HOMI":true,"TEND":true,"MDU":true,"XAMP":true,"FOCV":true,"INRT":true,"LIDER":true,"FEX":true,"AOS":true,"BPLC":true,"AICO":true,"FLS":true,"ETHP":true,"LID":true,"GEEQ":true,"STAMP":true,"DPIE":true,"RMPL":true,"MGP":true,"JT":true,"ZNN":true,"EDGEW":true,"ANW":true,"BDCC":true,"CORX":true,"PAR":true,"BREE":true,"BNBUP":true,"BNBDOWN":true,"XTZDOWN":true,"PRQ":true,"4ART":true,"CAPT":true,"TRUST":true,"REAP":true,"BRDG":true,"DZI":true,"ZLW":true,"BART":true,"SHB":true,"RWS":true,"ZIN":true,"KLP":true,"ZPAE":true,"UNT":true,"HAKKA":true,"STOP":true,"HTN":true,"DGVC":true,"PDF":true,"RUG":true,"CVPT":true,"CATX":true,"DFIO":true,"NEWTON":true,"VIDYA":true,"QQQF":true,"LIBFX":true,"$BASED":true,"YFFI":true,"LYRA":true,"STATERA":true,"PEARL":true,"DEXG":true,"YFIS":true,"CHAIN":true,"OIN":true,"SLINK":true,"TOMA":true,"UNIFI":true,"DACC2":true,"YFIVE":true,"BAST":true,"YFIE":true,"RELVT":true,"OPTC":true,"INXP":true,"TLN":true,"KARMAD":true,"CORN":true,"SALMON":true,"JFI":true,"QOOB":true,"MATH":true,"SEEDV":true,"LGOT":true,"CELOUSD":true,"XFTC":true,"TRXDOWN":true,"XRPDOWN":true,"POWER":true,"HGET":true,"RVC":true,"CRT":true,"YSAFE":true,"UTOPIA":true,"TYS":true,"ACH":true,"SASHIMI":true,"UNDB":true,"SAKE":true,"YFFC":true,"ZDEX":true,"YFARM":true,"KATANA":true,"ANK":true,"CNYT":true,"ZYRO":true,"PRINT":true,"WNRZ":true,"PFID":true,"DBOX":true,"VYBE":true,"NUTS":true,"TRBT":true,"SUSHIBULL":true,"SUSHIBEAR":true,"UNISWAPBULL":true,"UNISWAPBEAR":true,"XETH":true,"YFFII":true,"ETHPY":true,"JIAOZI":true,"ON":true,"XSTAR":true,"ASK":true,"EVCC":true,"RTH":true,"DOGEC":true,"QAC":true,"HTA":true,"CR8":true,"BAK":true,"DVS":true,"BCEO":true,"BITC":true,"LOT":true,"DSCP":true,"SURE":true,"RC20":true,"TOC":true,"SCFIV2":true,"CHVF":true,"LGCY":true,"UCO":true,"CHI":true,"YSR":true,"DAB":true,"YFF":true,"MEXP":true,"DTOP":true,"GPKR":true,"MFC":true,"SPRKL":true,"SBE":true,"YFBETA":true,"DCASH":true,"PTF":true,"AVAXIOU":true,"EMN":true,"ONIT":true,"AGS":true,"WBNB":true,"AETH":true,"ISDT":true,"BASID":true,"BWF":true,"YFBT":true,"FAME":true,"MXT":true,"UFFYI":true,"FAG":true,"NIN":true,"SFG":true,"PJM":true,"UNII":true,"XFI":true,"CORE":true,"BID":true,"KING":true,"DAOVC":true,"HOTN":true,"IOV":true,"HLPT":true,"DICETRX":true,"BEC":true,"AXEL":true,"KOMP":true,"FIT":true,"BBC":true,"XSP":true,"TRIX":true,"YFIII":true,"BUY":true,"ECELL":true,"KIF":true,"DUN":true,"UCA":true,"WBX":true,"DDR":true,"CUTE":true,"PLTC":true,"USG":true,"SEAL":true,"MBN":true,"BTTR":true,"OWL":true,"STBZ":true,"ZEFU":true,"YUSRA":true,"POST":true,"ASTA":true,"HLX":true,"ZEE":true,"NICE":true,"UBXT":true,"LCG":true,"SWAG":true,"HTHEDGE":true,"HTHALF":true,"HEDGESHIT":true,"HALFSHIT":true,"HALF":true,"EXCHHEDGE":true,"EXCHHALF":true,"ETHHEDGE":true,"ETHHALF":true,"ETCHEDGE":true,"ETCHALF":true,"EOSHEDGE":true,"EOSHALF":true,"DRGNHEDGE":true,"DRGNHALF":true,"DOGEHEDGE":true,"DOGEHALF":true,"DMGBULL":true,"DMGBEAR":true,"DEFIHEDGE":true,"DEFIHALF":true,"DEFIBEAR":true,"CUSDTHEDGE":true,"CUSDTHALF":true,"CUSDTBULL":true,"CUSDTBEAR":true,"COMPHEDGE":true,"COMPHALF":true,"COMPBULL":true,"COMPBEAR":true,"BTMXHEDGE":true,"BTMXHALF":true,"BSVHEDGE":true,"BSVHALF":true,"BNBHEDGE":true,"BNBHALF":true,"BCHHEDGE":true,"BCHHALF":true,"BALHEDGE":true,"BALHALF":true,"BALBULL":true,"BALBEAR":true,"ATOMHEDGE":true,"ATOMHALF":true,"ALTHEDGE":true,"ALTHALF":true,"ALGOHEDGE":true,"ALGOHALF":true,"ADAHEDGE":true,"ADAHALF":true,"SPEED":true,"TRYBBULL":true,"TRYBBEAR":true,"TRXHEDGE":true,"TRXHALF":true,"TOMOHEDGE":true,"TOMOHALF":true,"TRYBHALF":true,"THETAHEDGE":true,"VETBEAR":true,"SXPHEDGE":true,"TRYBHEDGE":true,"SXPHALF":true,"SXPBEAR":true,"PRIVHEDGE":true,"PRIVHALF":true,"PAXGHEDGE":true,"OKBHEDGE":true,"OKBHALF":true,"MKRBULL":true,"MKRBEAR":true,"MIDHEDGE":true,"MIDHALF":true,"MATICHEDGE":true,"MATICHALF":true,"LTCHEDGE":true,"LTCHALF":true,"LINKHEDGE":true,"LINKHALF":true,"LEOHEDGE":true,"LEOHALF":true,"KNCHEDGE":true,"KNCHALF":true,"HMST":true,"AQT":true,"HNY":true,"CAMP":true,"KOREC":true,"KORE":true,"WINR":true,"DRC":true,"XTZHEDGE":true,"XTZHALF":true,"XRPHEDGE":true,"XRPHALF":true,"XAUTHEDGE":true,"XAUTHALF":true,"XAUTBULL":true,"XAUTBEAR":true,"VETHEDGE":true,"VETBULL":true,"PRIA":true,"DAM":true,"XHT":true,"RUC":true,"AXIAV3":true,"WON":true,"BOR":true,"USNBT":true,"NBT":true,"SSL":true,"USDF":true,"STPL":true,"SUSD":true,"STPT":true,"IBP":true,"VELOX":true,"RSV":true,"YO":true,"APIX":true,"RKN":true,"RINGX":true,"AG8":true,"PEAK":true,"ECU":true,"DUCATO":true,"BCHDOWN":true,"CNTR":true,"BHAO":true,"SURF":true,"PTERIA":true,"WEMIX":true,"N0031":true,"SUP8EME":true,"ORAI":true,"KP4R":true,"AUSCM":true,"XFYI":true,"MOONDAY":true,"FWT":true,"HD":true,"SNTVT":true,"ELAD":true,"CROAT":true,"DFD":true,"MSB":true,"XAT":true,"XDOT":true,"BOOB":true,"GBK":true,"TAT":true,"YYFI":true,"DFGL":true,"NVA":true,"LEX":true,"BLOODY":true,"ASP":true,"PICKLE":true,"EOSBEAR":true,"FAIRG":true,"SPENDC":true,"TRUMPLOSE":true,"YSEC":true,"SMPL":true,"DOGDEFI":true,"XPN":true,"8X8":true,"TRUMPWIN":true,"GOF":true,"FLETA":true,"SPKL":true,"SMARTCREDIT":true,"JEM":true,"NAMI":true,"AKN":true,"META":true,"USDTHEDGE":true,"USDTHALF":true,"UTU":true,"ORC":true,"ORGA":true,"BETF":true,"YFR":true,"TESSLA":true,"MOONC":true,"FINOM":true,"MOON":true,"FFYI":true,"FIN":true,"TAPC":true,"TTT":true,"BAMBOO":true,"VERIF":true,"SAV3":true,"LIEN":true,"IDEFI":true,"XDGB":true,"KFC":true,"SPAIN":true,"SPA":true,"LANE":true,"FAIR":true,"FNX":true,"FIELD":true,"ALN":true,"GAL":true,"NVZN":true,"BWB":true,"MNR":true,"MEDIT":true,"MINDS":true,"NEWS":true,"RAISE":true,"CTI":true,"XDNA":true,"TIGER":true,"TCH":true,"OPENDAO":true,"FRA":true,"MAHA":true,"2BASED":true,"UNN":true,"ADP":true,"R34P":true,"GRPL":true,"RFCTR":true,"YVS":true,"TCORE":true,"NHBTC":true,"MEDICO":true,"DXF":true,"XETH-G":true,"PYRK":true,"WBBC":true,"TBB":true,"DYP":true,"CHAL":true,"TRINI":true,"TNC":true,"REV":true,"PAI":true,"ESD":true,"PYLON":true,"FOREVER":true,"AVALON":true,"CRDT":true,"FRAX":true,"FXS":true,"WIFI":true,"ONS":true,"AME":true,"XED":true,"PIS":true,"DGCL":true,"MCP":true,"BAO":true,"TSD":true,"SAS":true,"MSWAP":true,"KOBE":true,"COVEROLD":true,"DNS":true,"LDO":true,"WHITE":true,"LOG":true,"WISE":true,"COINVEST":true,"MISCOIN":true,"MIS":true,"FORTUNE":true,"SHACOIN":true,"XDEF2":true,"IBETH":true,"BRI":true,"BUXCOIN":true,"CBK":true,"EAURIC":true,"BTCAS":true,"GLOBAL":true,"LUCKYB":true,"pBTC35A":true,"HGOLD":true,"UMX":true,"DSTR":true,"UNIDX":true,"XLMBULL":true,"XLMBEAR":true,"THETAHALF":true,"MINDEX":true,"MIC":true,"STARP":true,"BAGS":true,"PROS":true,"PUSD":true,"GERA":true,"COMBO":true,"YFTE":true,"TPAY":true,"ETZ":true,"VRX":true,"GLCH":true,"ARIA20":true,"ROYA":true,"RIGEL":true,"NDX":true,"CSX":true,"DUCKD":true,"DDIM":true,"ROUTE":true,"YFO":true,"USDFL":true,"FL":true,"NGM":true,"KSP":true,"NTB":true,"INFI":true,"NORD":true,"GFARM2":true,"ELX":true,"SPC.QRC":true,"PI":true,"BITF":true,"BFC":true,"PHOON":true,"CVR":true,"UNDG":true,"CRC":true,"CC10":true,"ARMOR":true,"ARNXM":true,"SNOW":true,"AREN":true,"BTNYX":true,"FEY":true,"HH":true,"ARE":true,"DOGY":true,"NC":true,"TROP":true,"POC":true,"NAWA":true,"SIN":true,"YPIE":true,"LMY":true,"BU":true,"NAX":true,"BIXB":true,"TKMN":true,"U8D":true,"FAMILY":true,"KHM":true,"VBX":true,"TMCN":true,"XLAB":true,"ALH":true,"LITHIUM":true,"MT":true,"INFINI":true,"GRON":true,"YPRO":true,"I9C":true,"IDAC":true,"RAINC":true,"HAI":true,"CLUB":true,"AIBB":true,"CAR":true,"CBRT":true,"CCT":true,"CDX":true,"CMM":true,"DGC":true,"ET":true,"FCN":true,"HCC":true,"HORSE":true,"LTB":true,"MARS":true,"MMNXT":true,"MXX":true,"NSURE":true,"ODE":true,"PLOT":true,"RTE":true,"STRS":true,"VEC2":true,"XIOT":true,"DCX":true,"UOP":true,"APY":true,"ZZZ":true,"CARR":true,"AXNT":true,"YFXL":true,"COINSL":true,"WNXM":true,"WCCX":true,"JUN":true,"CIVIT":true,"WORLD":true,"VALUE":true,"$TRDL":true,"FUSE":true,"YFV":true,"KRX":true,"REST":true,"CARROT":true,"SWPRL":true,"GNY":true,"BFLY":true,"QRK":true,"PMEER":true,"CURIO":true,"MP3":true,"VAIOT":true,"ALIAS":true,"INDEX":true,"BT":true,"BUILDTEAM":true,"TFT":true,"ETH2":true,"MASQ":true,"CTASK":true,"RPT":true,"DERI":true,"KTT":true,"OUR":true,"FILDA":true,"RENDOGE":true,"PICA":true,"SST":true,"IPDN":true,"RISEP":true,"GENSTAKE":true,"GEN":true,"MYST":true,"XFUND":true,"METH":true,"RWN":true,"TRIGID":true,"RETAIL":true,"UNISTAKE":true,"FDR":true,"PREMIA":true,"DSLA":true,"SGT":true,"GIG":true,"OLY":true,"PRVS":true,"DEXM":true,"FYZNFT":true,"GARD":true,"PBASE":true,"UEC":true,"WCELO":true,"GOLD":true,"CLIQ":true,"UMB":true,"VSP":true,"PODIUM":true,"POD":true,"SKLAY":true,"LHB":true,"TON":true,"RAI":true,"BITT":true,"GUSD":true,"QTF":true,"STETH":true,"STAKEDETH":true,"SLNV2":true,"ROS":true,"HBO":true,"LRN":true,"ROT":true,"MTRG":true,"CREDIT":true,"AZUKI":true,"$ANRX":true,"BUSD":true,"RFOX":true,"CARPE":true,"WHALE":true,"REVV":true,"DG":true,"LAYER":true,"SHROOM":true,"DOKI":true,"MONAV":true,"POLK":true,"ALOHA":true,"BSP":true,"XTK":true,"EROWAN":true,"OXEN":true,"OPCT":true,"HOPR":true,"IGI":true,"DSD":true,"PPBLZ":true,"NDR":true,"CHONK":true,"WAIF":true,"BONK":true,"DAOB":true,"MANDALA":true,"CPS":true,"CPC":true,"MATTER":true,"DWZ":true,"URUS":true,"VKNF":true,"FONT":true,"DOWS":true,"HFIL":true,"MODUM":true,"MOD":true,"CRYPTOE":true,"DEGOV":true,"PGT":true,"NESTREE":true,"EGG":true,"SLICE":true,"BINTEX":true,"DEFLCT":true,"BALPHA":true,"EHASH":true,"DEOR":true,"AVAL":true,"SCP":true,"FSW":true,"PAID":true,"OM":true,"YFDAI":true,"UNCX":true,"YFPRO":true,"RPZX":true,"MPH":true,"AAPX":true,"PROXI":true,"TMT":true,"BSYS":true,"REHAB":true,"CHOW":true,"STARC":true,"DOLA":true,"YIELD":true,"IFUND":true,"VSD":true,"CGG":true,"INF":true,"HAPI":true,"ARGON":true,"WATCH":true,"VRAP":true,"GSPI":true,"PCNT":true,"WHIRL":true,"SLME":true,"CELEB":true,"KINE":true,"DIESEL":true,"CTF":true,"TANGO":true,"BCP":true,"OROP":true,"XNS":true,"INS":true,"MCAT20":true,"EVC":true,"EVRICE":true,"EDDA":true,"B26":true,"VISR":true,"JULB":true,"DUK+":true,"SCAT":true,"XEND":true,"L3P":true,"BRICK":true,"BSCV":true,"QUAM":true,"LOCO":true,"ELAND":true,"DAFI":true,"BCUG":true,"DKA":true,"PAINT":true,"AFO":true,"GST":true,"SOCKS":true,"GSWAP":true,"NFTXHI":true,"NFY":true,"XNO":true,"POLC":true,"GUM":true,"LOOT":true,"BHT":true,"HBC":true,"STR":true,"ANDX":true,"DORA":true,"TARA":true,"OVR":true,"X.CUR":true,"XCUR":true,"ATD":true,"FMG":true,"KWD":true,"TOWER":true,"ICAP":true,"SOTA":true,"WOWS":true,"XMON":true,"SCB":true,"CONV":true,"VOICE":true,"MUTE":true,"ETHV":true,"ZUT":true,"ZXC":true,"ARTF":true,"CHADS":true,"SYNCC":true,"SYNC":true,"BIDI":true,"BDP":true,"BTCF":true,"DELTAC":true,"DELTA":true,"BLZD":true,"LAS":true,"SFUND":true,"INV":true,"INVIC":true,"DRT":true,"SIGN":true,"$ROPE":true,"XAYA":true,"RUGZ":true,"PRDX":true,"FUD":true,"GFX":true,"SAFEBTC":true,"TIDAL":true,"KPAD":true,"BITSZ":true,"AWX":true,"AWS":true,"MORA":true,"POLAR":true,"MRCH":true,"HAUS":true,"MARSH":true,"UDT":true,"WXDAI":true,"BREW":true,"MFI":true,"DDS":true,"MIDAS":true,"MARK":true,"SEEN":true,"WAULT":true,"HETH":true,"WOA":true,"WVG0":true,"COKE":true,"DYT":true,"RSIN":true,"RECOM":true,"BMXX":true,"MLA":true,"SIGUSD":true,"VNFT":true,"SIGRSV":true,"DEBASE":true,"ALPACA":true,"SI":true,"FOTO":true,"TOOLS":true,"KCH":true,"TLO":true,"ZAI":true,"TIFT":true,"SBDO":true,"HYPE":true,"ARCA":true,"APECOIN":true,"DAIQ":true,"VKF":true,"BNBDOOM":true,"DOOM":true,"BCHDOOM":true,"ETHDOOM":true,"LTCDOOM":true,"OKBDOOM":true,"QARK":true,"KCAL":true,"HELMET":true,"ARTH":true,"SBS":true,"PEGS":true,"DEFI5":true,"CURRY":true,"KOIN":true,"BSGS":true,"DBUND":true,"R3FI":true,"ZZZV2":true,"XUSD":true,"EOX":true,"QFI":true,"PGU":true,"GASG":true,"KBTC":true,"KLON":true,"KBOND":true,"GOGO":true,"VAI":true,"XGT":true,"GOVI":true,"SOAK":true,"POLA":true,"FAI":true,"ID":true,"B20":true,"BDAY":true,"BRY":true,"SINE":true,"NUA":true,"VIKING":true,"AIOZ":true,"SHOPX":true,"PMON":true,"MTHD":true,"XBE":true,"ROPE":true,"SATT":true,"COVIR":true,"MCO2":true,"TRDG":true,"WQT":true,"MAI":true,"LQTY":true,"ARNO":true,"LUSD":true,"8PAY":true,"KONO":true,"MCAU":true,"CTC":true,"TOPN":true,"STRK":true,"BDPI":true,"CARDS":true,"TOTM":true,"CARRY":true,"KTN":true,"OCTI":true,"PUSH":true,"AHT":true,"MARO":true,"DMD":true,"RFUEL":true,"EUM":true,"AUROS":true,"GMEE":true,"CPCOIN":true,"RBC":true,"AUDIO":true,"MLK":true,"TT":true,"DEFIT":true,"MBOX":true,"TRO":true,"SOGE":true,"GHX":true,"COM":true,"BAAS":true,"UBA":true,"PFL":true,"INNBC":true,"PKF":true,"ETHA":true,"BIOT":true,"KRATOS":true,"TOS":true,"XOR":true,"MTLX":true,"BAG":true,"RGT":true,"SVX":true,"WP":true,"AGT":true,"REVO":true,"BAS":true,"BITASEAN":true,"SOBA":true,"HFI":true,"EQZ":true,"ZMY":true,"RGP":true,"OMNI":true,"SEPA":true,"DFY":true,"K21":true,"ATMCHAIN":true,"BACOIN":true,"LF":true,"BLES":true,"FMT":true,"CODEX":true,"DEXTF":true,"BYN":true,"RVP":true,"GAINS":true,"MVI":true,"WOMI":true,"VNTW":true,"MOFI":true,"SATA":true,"SPMK":true,"AR":true,"BSKT":true,"PYR":true,"WXTZ":true,"FROGE":true,"ARTEON":true,"SHD":true,"KYTE":true,"FUNDC":true,"FUND":true,"ZAPP":true,"FINA":true,"YCBF":true,"DVG":true,"NUX":true,"RAZOR":true,"GS":true,"RVF":true,"ZIG":true,"BXF":true,"MYID":true,"IDEA":true,"ZCX":true,"TRU":true,"AXN":true,"DDOS":true,"CKEK":true,"BAC":true,"SAR":true,"KXUSD":true,"MUNCH":true,"IDICE":true,"ICE":true,"WANATHA":true,"PDEX":true,"NAME":true,"SKEY":true,"SPDR":true,"WCUSD":true,"ETHO":true,"LON":true,"OG":true,"KVNT":true,"BVND":true,"NFXC":true,"CATC":true,"CAT":true,"POCKET":true,"1IRST":true,"FST":true,"LEASH":true,"DOGIRA":true,"DXH":true,"BDOG":true,"HUSKY":true,"CHS":true,"STOGE":true,"APN":true,"SYL":true,"XFIT":true,"SBGO":true,"GPT":true,"DART":true,"GOL":true,"LAND":true,"KEL":true,"ANS":true,"DAIN":true,"BFIC":true,"METEOR":true,"DHV":true,"GETH":true,"DAFT":true,"BLCT":true,"DXD":true,"COFIX":true,"IZE":true,"INO":true,"UMBR":true,"CIPHC":true,"XCF":true,"SFI":true,"LABRA":true,"SAITO":true,"CBSN":true,"SDX":true,"DOUGH":true,"BIND":true,"WBIND":true,"JGN":true,"KIMCHI":true,"METER":true,"SUPERTX":true,"XRIBA":true,"ETHY":true,"BNF":true,"MTTCOIN":true,"MW":true,"88MPH":true,"BMP":true,"GXT":true,"SOX":true,"HSS":true,"CCE":true,"GBCR":true,"ZLOT":true,"EL":true,"FR":true,"SWFL":true,"BASE":true,"SORA":true,"BFI":true,"GAZE":true,"WZEC":true,"WFIL":true,"WOZX":true,"VCK":true,"TESTA":true,"GASP":true,"DMX":true,"HEZ":true,"CTCN":true,"RFI":true,"BOSONC":true,"STING":true,"STN":true,"COINDEFI":true,"TOKEN":true,"PHALA":true,"PXL":true,"CONS":true,"CYC":true,"LLAND":true,"VR":true,"FASTMOON":true,"HORD":true,"OCE":true,"XPO":true,"LEMD":true,"HOKK":true,"MOMA":true,"HAKA":true,"GASTRO":true,"MUSK":true,"FINE":true,"BSCS":true,"C3":true,"COPS":true,"SMTY":true,"CRWNY":true,"FEI":true,"GRUMPY":true,"PENDLE":true,"TOZ":true,"BBANK":true,"ERROR":true,"ALPHR":true,"ENX":true,"MOAR":true,"SHO":true,"CFXQ":true,"STACK":true,"KFI":true,"NEXT":true,"BTH":true,"PIPI":true,"SHEESHA":true,"ARA":true,"STND":true,"DSCVR":true,"2LC":true,"POP!":true,"NAOS":true,"EPK":true,"RNB":true,"LOCG":true,"VSPACEX":true,"ALEPH":true,"PUSSY":true,"ORAO":true,"ARES":true,"EXCC":true,"YVBOOST":true,"COSHI":true,"BCMC1":true,"FLX":true,"TBIS":true,"MIRC":true,"INSURC":true,"INSUR":true,"PEKC":true,"EMBER":true,"EMB":true,"FLASHC":true,"PLE":true,"CFLASH":true,"COMFI":true,"BANK":true,"COMB":true,"LABS":true,"RBTC":true,"ZEP":true,"MDH":true,"UBI":true,"TRR":true,"LOWB":true,"DFND":true,"SHIH":true,"POLX":true,"KAT":true,"GYEN":true,"BIFIF":true,"CEUR":true,"ZYTARA":true,"FCL":true,"ZWAP":true,"CARTAXI":true,"TOKENSTARS":true,"CUBEAUTO":true,"CUBE":true,"TCAP":true,"COCK":true,"PGN":true,"MTC":true,"HUBII":true,"HBT":true,"DFYN":true,"JINDOGE":true,"CANYA":true,"CAN":true,"RAIF":true,"ARGO":true,"WOOFY":true,"WAR":true,"SHOKK":true,"KKO":true,"DOP":true,"OIL":true,"PHIBA":true,"ETH2X-FLI":true,"DOGEDAO":true,"PNODE":true,"KLEE":true,"HNZO":true,"GARUDA":true,"CLS":true,"WSDOGE":true,"MALLY":true,"FOGE":true,"ELONGD":true,"EROTICA":true,"PAND":true,"CYBERD":true,"UTT":true,"CHIWAWA":true,"WIS":true,"EXY":true,"GERO":true,"CTX":true,"WILC":true,"XKI":true,"CVX":true,"EMON":true,"RUSH":true,"BIST":true,"LOCC":true,"BEZOGE":true,"BAKE":true,"SOLO":true,"CHIHUA":true,"CORGI":true,"MFS":true,"CLU":true,"YFX":true,"CRD":true,"IMPULSE":true,"APW":true,"LUNE":true,"ALU":true,"GAS":true,"DEFT":true,"ZOOT":true,"TKINU":true,"OCTO":true,"KEI":true,"KALLY":true,"MOOV":true,"HOTCROSS":true,"KUB":true,"NOA":true,"FFA":true,"NMT":true,"CHINU":true,"FEAR":true,"QQQ":true,"MEDIA":true,"NSBT":true,"USDN":true,"SRA":true,"PNL":true,"ZCOR":true,"USDAP":true,"UPCO2":true,"KAWA":true,"BON":true,"BNA":true,"TGAME":true,"GBT":true,"UNITS":true,"OUSD":true,"PNGN":true,"XCAD":true,"SPELL":true,"BLKC":true,"ELONONE":true,"FINU":true,"DEK":true,"IONX":true,"HINA":true,"CAPS":true,"GEMS":true,"JEJUDOGE":true,"CHEX":true,"ZUSD":true,"MUSDCOIN":true,"MUSD":true,"LAT":true,"DLPD":true,"DUCK":true,"PIZZACOIN":true,"PIZZA":true,"MERCURY":true,"MER":true,"FLY":true,"FLYCOIN":true,"XAI":true,"ARTDECO":true,"VEED":true,"LOL":true,"SMT":true,"N1":true,"LESS":true,"LSS":true,"NIIFI":true,"MYOBU":true,"KDOGE":true,"UFT":true,"TINKU":true,"ZOO":true,"CAVA":true,"TOKO":true,"SAFEHAMSTERS":true,"PUGL":true,"SCOIN":true,"KVI":true,"BUFFDOGE":true,"MOZ":true,"BKING":true,"BIDCOM":true,"CXO":true,"TAAS":true,"WOOP":true,"BCDT":true,"AMATEN":true,"AMA":true,"IOI":true,"AI":true,"KGO":true,"SWISE":true,"IRON":true,"BUGG":true,"GNBT":true,"ANV":true,"PDOG":true,"VBSC":true,"GDT":true,"OGSP":true,"CRDTS":true,"EQO":true,"AAB":true,"XAUT":true,"PLF":true,"TRYB":true,"UBTC":true,"FYZ":true,"CNB":true,"FUNX":true,"MXW":true,"TAI":true,"FACE":true,"UPT":true,"MINI":true,"TKY":true,"BTNT":true,"COSM":true,"KBC":true,"TSHP":true,"USDS":true,"CHX":true,"ZIP":true,"VEEN":true,"MXM":true,"FNB":true,"AAPL.CUR":true,"PLAI":true,"FORM":true,"NFLX":true,"TSLA":true,"AAPL":true,"BYND":true,"AMZN":true,"BABA":true,"BILI":true,"GOOGL":true,"PFE":true,"SPY":true,"ACB":true,"HYC":true,"VELO":true,"ABNB":true,"FIS":true,"AMD":true,"APHA":true,"INFT":true,"ARKK":true,"VID":true,"ARX":true,"BB":true,"KYL":true,"SRK":true,"CWS":true,"BLY":true,"NBOT":true,"BITW":true,"BIONT":true,"CGC":true,"DKNG":true,"ETHE":true,"GDXJ":true,"GLD":true,"GLXY":true,"GME":true,"HOOD":true,"MRNA":true,"MSTR":true,"NOK":true,"NVDA":true,"PENN":true,"PYPL":true,"SQ":true,"TLRY":true,"TSM":true,"TWTR":true,"PLANETS":true,"USO":true,"UBER":true,"ZM":true,"NABOX":true,"OMT":true,"COOP":true,"METAC":true,"SIG":true,"PENTA":true,"BMH":true,"AAT":true,"VRC":true,"NUT":true,"FME":true,"ASAFE2":true,"TUDA":true,"GSTC":true,"KTON":true,"QUROZ":true,"KIND":true,"BCHC":true,"CPT":true,"ORME":true,"MONARCH":true,"CONUN":true,"INST":true,"GOD":true,"PEA":true,"SETH2":true,"DPX":true,"GET":true,"WIKI":true,"VALOR":true,"EMC":true,"SPHR":true,"YFL":true,"ZYN":true,"ECT":true,"NBC":true,"PERX":true,"RDPX":true,"DTEP":true,"NEFTIPEDIA":true,"SFUEL":true,"PANGEA":true,"PYQ":true,"PAPADOGE":true,"PEEPS":true,"EVZ":true,"MVC":true,"XAVA":true,"GENS":true,"MEM":true,"AIDI":true,"NBNG":true,"MATPAD":true,"INARI":true,"FOREVERUP":true,"VRISE":true,"BAKT":true,"ARTG":true,"RAPDOGE":true,"PIN":true,"RNBW":true,"2CRZ":true,"RAD":true,"SYLO":true,"WCS":true,"GTH":true,"SMBSWAP":true,"STEP":true,"CLOUTIO":true,"CLOUT":true,"DEVCOIN":true,"DVC":true,"MASTERMINT":true,"TRIBETOKEN":true,"TRIBE":true,"B21":true,"NDAU":true,"NGC":true,"BNS":true,"TONE":true,"F9":true,"PDOGE":true,"DAY":true,"RAIL":true,"PSWAP":true,"IPX":true,"BANCA":true,"CMCT":true,"ADM":true,"DFC":true,"BYTZ":true,"MO":true,"SUPERBID":true,"GOC":true,"DVPN":true,"PBT":true,"DAV":true,"HUB":true,"AIM":true,"MISHKA":true,"DVP":true,"XRUNE":true,"ASTROLION":true,"DOOR":true,"DRCT":true,"NPLC":true,"FESS":true,"DDRST":true,"G999":true,"GREARN":true,"CLT":true,"MNST":true,"IQQ":true,"ACXT":true,"SLRS":true,"SGE":true,"KELPIE":true,"PONZU":true,"DRE":true,"ANDROTTWEILER":true,"ASD":true,"CFF":true,"FEVR":true,"ZORT":true,"YLDY":true,"OFC":true,"MOK":true,"SHIBMERICAN":true,"GREY":true,"EFFT":true,"PROGE":true,"WPE":true,"QNX":true,"THEDAO":true,"MARXCOIN":true,"MARX":true,"COINLION":true,"LION":true,"MINDGENE":true,"MG":true,"OCTOIN":true,"OCC":true,"DAWGS":true,"CFG":true,"WCFG":true,"BXX":true,"ARW":true,"JEFF":true,"SHFL":true,"ARTEX":true,"CHY":true,"COLLG":true,"SHIBERUS":true,"BST":true,"MINUTE":true,"DEFLA":true,"SBRT":true,"TBCC":true,"DIAMND":true,"CVA":true,"CVAG":true,"XWIN":true,"TENSHI":true,"MCONTENT":true,"TOKAU":true,"CAVO":true,"1TRC":true,"ZOE":true,"WOLFY":true,"RELOADED":true,"SBANK":true,"XYZ":true,"GODL":true,"BABYCUBAN":true,"NVX":true,"TKG":true,"HANU":true,"KIRBY":true,"TAIYO":true,"SHON":true,"INVESTEL":true,"CFLO":true,"EDR":true,"STAK":true,"LIVE":true,"ANB":true,"BSCGIRL":true,"JPYC":true,"STRAKS":true,"LIVESTARS":true,"CLEVERCOIN":true,"GSHIBA":true,"ABI":true,"MFUND":true,"IPAD":true,"LKT":true,"UNCLE":true,"BURP":true,"INVI":true,"YINBI":true,"CRTS":true,"PCHS":true,"LCMS":true,"LMAO":true,"CASPER":true,"MBCC":true,"ALITA":true,"PYRAM":true,"DAF":true,"UFI":true,"DADDYDOGE":true,"1-UP":true,"LYXE":true,"SPADE":true,"F7":true,"YGG":true,"COVAL":true,"XSD":true,"ADD":true,"ADEL":true,"MAP":true,"$KIRBYRELOADED":true,"DBZ":true,"BANKETH":true,"VICEX":true,"FIG":true,"UCT":true,"SPACECOIN":true,"SPACE":true,"WIZ":true,"WHO":true,"WEBC":true,"WAY":true,"WIB":true,"W12":true,"WBET":true,"WCT":true,"WBB":true,"WCC":true,"WIKEN":true,"ETERNALC":true,"WFX":true,"WELL":true,"SHIB":true,"XDC":true,"SLP":true,"DIC":true,"BORING":true,"DERC":true,"VAB":true,"SAFEMOON":true,"WMT":true,"TLM":true,"FLR":true,"SHB4":true,"PVU":true,"ZJLT":true,"EVAULT":true,"ERG":true,"OMI":true,"ALICE":true,"EFI":true,"HEX":true,"COVIDTOKEN":true,"BSATOSHI":true,"SENSO":true,"HNT":true,"CAKE":true,"LITH":true,"CHZ":true,"XSUSHI":true,"VAR":true,"CVXCRV":true,"IBEUR":true,"MIM":true,"FLOAT":true,"MANA":true,"XCH":true,"YETU":true,"C98":true,"CTK":true,"TVK":true,"VIDZ":true,"TOKE":true,"AQUARI":true,"LPK":true,"SAITAMA":true,"AAVEUP":true,"ELON":true,"ENERGYX":true,"DODO":true,"TFUEL":true,"DFA":true,"PIPT":true,"DFSPORTS":true,"WASABI":true,"ICHI":true,"RULER":true,"$MAID":true,"IDLE":true,"KISHU":true,"RBIS":true,"BASK":true,"SIMPLE":true,"NFT":true,"THETA":true,"BPT":true,"SUSHIUP":true,"SXPUP":true,"GENIX":true,"ZCON":true,"BABYSAITAMA":true,"TOMO":true,"KEEP":true,"XRPUP":true,"ETHPAD":true,"TWT":true,"LANC":true,"DFI":true,"EQX":true,"MCF":true,"OXT":true,"SUNC":true,"KDA":true,"KAR":true,"PORT":true,"CTSI":true,"KITSU":true,"MYTH":true,"CFL365":true,"A5T":true,"SWOP":true,"CIV":true,"NMX":true,"CLV":true,"DOTUP":true,"CYCLUB":true,"KRO":true,"UMI":true,"DEGO":true,"AWO":true,"CBANK":true,"FDO":true,"BTCDOWN":true,"BULLSHIT":true,"TKO":true,"BEAM":true,"SUM":true,"MMUI":true,"BOOST":true,"DID":true,"IAG":true,"SPI":true,"FEG":true,"PPN":true,"LPT":true,"YBK":true,"KAVA":true,"SKT":true,"BADGER":true,"CFX":true,"RFT":true,"LTRBT":true,"RYOSHI":true,"EXE":true,"ALPA":true,"HI":true,"WNCG":true,"ASG":true,"SPHRI":true,"WLUNA":true,"$TREAM":true,"SKU":true,"CW":true,"AGPC":true,"PIRATE":true,"CATT":true,"DNXC":true,"CIRUS":true,"TXA":true,"DBUY":true,"CSWAP":true,"BORED":true,"XRD":true,"MGAMES":true,"RELAY":true,"BORUTO":true,"TSA":true,"INXM":true,"MSC":true,"MASTERCOIN":true,"OGO":true,"KP3R":true,"CITY":true,"WICC":true,"PNG":true,"BRNK":true,"PSLIP":true,"KSHIB":true,"MINTYS":true,"FLRS":true,"FRTS":true,"TXL":true,"KUMA":true,"DPET":true,"BP":true,"STOS":true,"AFN":true,"RTM":true,"BITREWARDS":true,"RBUNNY":true,"YAYCOIN":true,"FBFTX":true,"FB":true,"PLAY":true,"FLOW":true,"PTR":true,"WRX":true,"LDFI":true,"XT":true,"KLC":true,"ALUSD":true,"MOVR":true,"CYCE":true,"JASMY":true,"BFT.BITCI":true,"SNFT.BITCI":true,"ANKA.BITCI":true,"DNZ.BITCI":true,"ESES.BITCI":true,"KSK.BITCI":true,"XVS":true,"BAL":true,"LIT":true,"KSTT.BITCI":true,"QISWAP":true,"QI":true,"EMAR":true,"EDEN":true,"BITCOINV":true,"NR1.BITCI":true,"TBFT.BITCI":true,"TMSH.BITCI":true,"RAMP":true,"BTCST":true,"SDN":true,"FARA":true,"AKITA":true,"ALPHA":true,"MIR":true,"DDX":true,"SAFESTAR":true,"BGLD":true,"PAPER":true,"SWP":true,"TALK":true,"ARR":true,"XIN":true,"BARK":true,"FLURRY":true,"FIFTY":true,"PETN":true,"LSP":true,"POOL":true,"VIDYX":true,"HERO":true,"SHARE":true,"PIG":true,"ONC":true,"PAYCON":true,"MIDN":true,"MDT":true,"ICP":true,"SNY":true,"TORG":true,"ONEX":true,"XLS":true,"DYDX":true,"BTRST":true,"ATLAS":true,"XEP":true,"ATTR":true,"YAY":true,"YAXIS":true,"PBX":true,"XNL":true,"MONI":true,"ETL":true,"LARIX":true,"PLGR":true,"STF":true,"DOGGY":true,"XIASI":true,"KEANU":true,"THG":true,"NAFT":true,"SKILL":true,"ZOON":true,"HOD":true,"SMG":true,"WSG":true,"MPLUS":true,"MPL":true,"HNST":true,"PWAR":true,"TSX":true,"RACA":true,"KCCPAD":true,"TPAD":true,"SISHI":true,"FEED":true,"PET":true,"COOK":true,"SAI":true,"PACOCA":true,"HZN":true,"HUNNY":true,"RABBIT":true,"ALLEY":true,"TENFI":true,"HEROES":true,"UNCL":true,"WHEEL":true,"SHIBACASH":true,"LONG":true,"EGGP":true,"EIFI":true,"DUELERS":true,"TENDIE":true,"COSMIC":true,"OVO":true,"VENTION":true,"DCB":true,"BEAST":true,"BETU":true,"IBG":true,"WENLAMBO":true,"SHEESH":true,"RELI":true,"PETG":true,"CHECOIN":true,"UGD":true,"ECO":true,"NSFW":true,"ECOFI":true,"INCAKE":true,"GEMG":true,"KLO":true,"USDP":true,"FOREVERFOMO":true,"MRF":true,"RVST":true,"DOGEGF":true,"XBN":true,"CXPAD":true,"POODL":true,"KWS":true,"KRN":true,"BBADGER":true,"RMRK":true,"KOL":true,"BLADE":true,"DIVER":true,"PFY":true,"CHOPPER":true,"DOGEX":true,"RICKMORTY":true,"UZUMAKI":true,"FATCAKE":true,"PIT":true,"WHEAT":true,"ARATA":true,"BHO":true,"JED":true,"SPHYNX":true,"BKR":true,"ZMBE":true,"LPI":true,"RAINBOW":true,"YDR":true,"FLEX":true,"STEPH":true,"CELT":true,"FIDA":true,"SRP":true,"ENTR":true,"OPUL":true,"TRGI":true,"RICH":true,"ODDZ":true,"JADE":true,"PKD":true,"PRV":true,"BMARS":true,"BUMN":true,"DOGO":true,"OSWAP":true,"BPAY":true,"CRDN":true,"DMOD":true,"LOUD":true,"DXB":true,"QBT":true,"VRT":true,"VERTEX":true,"VTX":true,"XIL":true,"KALM":true,"RICECOIN":true,"TOKU":true,"TOK":true,"SALE":true,"ARV":true,"VFY":true,"MOONSHOT":true,"ADAT":true,"BNBCH":true,"CAKEMOON":true,"MILK":true,"LTBC":true,"XMG":true,"SHIBAL":true,"NU":true,"COMPD":true,"DAG":true,"MIL":true,"GHST":true,"POND":true,"TOX":true,"MDX":true,"TBT":true,"MOONLIGHT":true,"ROOBEE":true,"STMX":true,"FOC":true,"CQT":true,"HTR":true,"DAI":true,"MOVE":true,"BABYFLOKI":true,"HYDRA":true,"KLV":true,"ADAB":true,"FORTH":true,"HXT":true,"ILC":true,"BABY":true,"ERE":true,"HOGE":true,"LEOS":true,"PUNDIX":true,"CSPR":true,"STRAX":true,"MOONARCH":true,"DEXE":true,"BZZONE":true,"BOND":true,"EXZO":true,"MNG":true,"BITCI":true,"MASS":true,"REEF":true,"BNBBEAR":true,"BETACOIN":true,"BETA":true,"SCN":true,"CSS":true,"BOGCOIN":true,"DATAWALLET":true,"DXT":true,"POLISPLAY":true,"POLIS":true,"GENXNET":true,"GENX":true,"OWNDATA":true,"OWN":true,"AEON":true,"UOS":true,"FLASH":true,"NVT":true,"XLT":true,"CSC":true,"ADAUP":true,"BONES":true,"AXC":true,"DCK":true,"PHA":true,"ELCASH":true,"MOB":true,"TENT":true,"CRB":true,"XSGD":true,"DOTDOWN":true,"IMPT":true,"SKI":true,"EFIL":true,"HAND":true,"CACHE":true,"FIII":true,"CHE":true,"ARRR":true,"ROSE":true,"LDOGE":true,"LINA":true,"ATMI":true,"DBIX":true,"FILUP":true,"TCP":true,"HDAC":true,"SSGT":true,"LYNX":true,"BEN":true,"THUNDER":true,"BBP":true,"BTCN":true,"KB3":true,"INT":true,"VBK":true,"ZND":true,"LCC":true,"CAIZ":true,"EBOX":true,"EOSUP":true,"ASR":true,"MNZ":true,"PRP":true,"CRTM":true,"EXRD":true,"BIP":true,"BOS":true,"BTCV":true,"IOTX":true,"XBY":true,"MOTO":true,"ZXT":true,"SAFEMARS":true,"ELLIP":true,"HEGIC":true,"ROSN":true,"AMC":true,"HLM":true,"LEND":true,"KVT":true,"XNN":true,"UNFI":true,"YAG":true,"LPOOL":true,"MASK":true,"BABYDOGE":true,"ATA":true,"ROOM":true,"OST":true,"SPS":true,"TERN.ETH":true,"WSCRT":true,"TOMOE":true,"WSIENNA":true,"SPC":true,"SQG":true,"WELD":true,"BNK":true,"EMAX":true,"HEXC":true,"SXPDOWN":true,"FIRU":true,"MATICBULL":true,"SCOT":true,"SOKU":true,"SMILE":true,"FOREVERPUMP":true,"LAIKA":true,"SFP":true,"VFOX":true,"SWAPZ":true,"OCTAX":true,"COLL":true,"BUFF":true,"SAFEBULL":true,"BURNDOGE":true,"CUMMIES":true,"WANA":true,"USDT":true,"CKB":true,"COGE":true,"HARD":true,"SHIELDNET":true,"RLY":true,"8BIT":true,"AAVEDOWN":true,"SCIX":true,"PQT":true,"ERSDL":true,"PERL":true,"SKL":true,"MELLO":true,"LUCKY":true,"ELEMENTS":true,"GOMT":true,"IRT":true,"MND":true,"DARICO":true,"DOGEBNB":true,"PRINTS":true,"EDGE":true,"UNIQUE":true,"TRIP":true,"COCOS":true,"RPL":true,"UNIDOWN":true,"AMO":true,"WRZ":true,"XPOKE":true,"APIS":true,"MGUL":true,"OOE":true,"UNIUP":true,"ETHBULL":true,"BULLC":true,"ITGR":true,"DATX":true,"CUE":true,"CUEX":true,"RFG":true,"HASH":true,"ELM":true,"LINKDOWN":true,"NFTX":true,"SIL":true,"RAVEN":true,"XYM":true,"BONUSCAKE":true,"ATM":true,"SPE":true,"TFI":true,"JUP":true,"HNS":true,"SCH":true,"DARKEN":true,"BUNNYROCKET":true,"CPAN":true,"ZABAKU":true,"NAKA":true,"BSCM":true,"PIKACHU":true,"GOTEM":true,"AU":true,"DDN":true,"SOV":true,"MANGA":true,"SLIM":true,"MED":true,"FILST":true,"KISHIMOTO":true,"GFN":true,"PFT":true,"FODL":true,"EDGT":true,"TORII":true,"GOMA":true,"GAFI":true,"SBR":true,"JOE":true,"METIS":true,"XWG":true,"SHELL":true,"REDI":true,"POK":true,"KALA":true,"NFTART":true,"EPAN":true,"BABYFB":true,"VLXPAD":true,"FWB":true,"BATH":true,"EVRY":true,"CHLT":true,"LAZIO":true,"CMCX":true,"WINK":true,"1WO":true,"BEAR":true,"SUGAR":true,"BIT":true,"GOST":true,"BOT":true,"DTA":true,"HPAD":true,"PARANOIA":true,"PARA":true,"EBSC":true,"GRIMEX":true,"RSUN":true,"APAD":true,"QUARTZ":true,"TZKI":true,"WOLVERINU":true,"INUYASHA":true,"MINISHIB":true,"PINU":true,"NAUSICAA":true,"SAKATA":true,"BRTX":true,"YOCO":true,"AITECH":true,"RBN":true,"KITTY":true,"NXMC":true,"ONE":true,"OH":true,"WDC":true,"DINGER":true,"JRIT":true,"KAC":true,"1INCHUP":true,"1INCHDOWN":true,"ASS":true,"TRONPAD":true,"SWAPP":true,"OBSCURE":true,"OBS":true,"AURORAC":true,"AUR":true,"INU":true,"MEWTWO":true,"MSA":true,"JPAW":true,"L":true,"SLA":true,"BOXT":true,"TSF":true,"SSVCOIN":true,"$TIME":true,"SLAM":true,"LUMI":true,"ALLBI":true,"CGS":true,"TUP":true,"SCLP":true,"SGB":true,"FOL":true,"RIL":true,"KAREN":true,"SAMO":true,"SQUID":true,"CATGIRL":true,"OPIUM":true,"DOGEZILLA":true,"TABOO":true,"AURY":true,"GODS":true,"GINUX":true,"SPWN":true,"PIST":true,"PANDO":true,"1INCH":true,"WEB":true,"TUSD":true,"SIP":true,"MINTCOIN":true,"MINT":true,"PLAYC":true,"PLA":true,"BCHA":true,"MYL":true,"VPP":true,"BITG":true,"BPRIVA":true,"MONONOKEINU":true,"POCO":true,"RRT":true,"SLOKI":true,"VAL":true,"XRT":true,"ALCHE":true,"TRIAS":true,"HCT":true,"YAP":true,"HMT":true,"LVX":true,"QUBITICA":true,"QBIT":true,"YOSI":true,"NFTB":true,"FOXF":true,"STS":true,"OXY":true,"WIFEDOGE":true,"RD":true,"STRAY":true,"IDTT":true,"WOOF":true,"RARE":true,"STC":true,"NASADOGE":true,"FAST":true,"TIKI":true,"PARAB":true,"LZ":true,"IBNB":true,"APYS":true,"AVXL":true,"PERA":true,"MWAR":true,"SHILL":true,"CASHT":true,"CATE":true,"DARCRUS":true,"DAR":true,"ENVIENTA":true,"ENV":true,"AQUAC":true,"NEETCOIN":true,"NEET":true,"AGF":true,"CBRL":true,"WARS":true,"DBA":true,"SHIBAMOM":true,"BRKL":true,"YAE":true,"ECC":true,"ORT":true,"BLS":true,"FNDZ":true,"KCCM":true,"FBNB":true,"QDX":true,"EMPIRE":true,"BCNA":true,"SOUND":true,"DREAMS":true,"CATZ":true,"SOSNOVKINO":true,"SNK":true,"MBX":true,"BNPL":true,"CWAR":true,"FF":true,"DFSG":true,"SLND":true,"ZUNA":true,"ENS":true,"EVERLIFE":true,"KMON":true,"SOLARDAO":true,"BENJACOIN":true,"BNC":true,"MERKLE":true,"BNBH":true,"REU":true,"ETERNAL":true,"DOG":true,"STKATOM":true,"BACON":true,"STKXPRT":true,"DXCT":true,"XDEFI":true,"DOGEDASH":true,"BLOCKS":true,"GM":true,"BOBA":true,"NEOS":true,"AGEUR":true,"ANGLE":true,"NFD":true,"METACAT":true,"PAD":true,"LEAG":true,"SNOOP":true,"YEL":true,"MARS4":true,"STANDARD":true,"DVF":true,"STRP":true,"FOLD":true,"SWD":true,"LMT":true,"LINKBULL":true,"WDR":true,"GORILLAINU":true,"SPAY":true,"DMLG":true,"MIA":true,"OPA":true,"HERA":true,"AVN":true,"WAI":true,"NORA":true,"CERE":true,"GODZ":true,"DNFT":true,"PORTO":true,"PSP":true,"REVA":true,"CHAMP":true,"XNFT":true,"KFT":true,"THN":true,"ROCKI":true,"SUNNY":true,"GMCOIN":true,"PLUGCN":true,"MARSRISE":true,"MST":true,"BITHER":true,"BTR":true,"REINDEER":true,"RDT":true,"RAY":true,"ATHE":true,"BMON":true,"COS":true,"CLEARPOLL":true,"POLL":true,"BNRTX":true,"BNX":true,"SOLARFARM":true,"CELL":true,"DNOTES":true,"NOTE":true,"WILD":true,"LOCK":true,"HIVE":true,"KLAY":true,"PERP":true,"FOAM":true,"GOREC":true,"QUICK":true,"TITAN":true,"EXIP":true,"STRONG":true,"EXLT":true,"HOTT":true,"AWC":true,"EWT":true,"ICOO":true,"10SET":true,"BLOCKSTAMP":true,"FREE":true,"JUI":true,"PBR":true,"API3":true,"NOIA":true,"QRDO":true,"FOXD":true,"PAXG":true,"SGOLD":true,"SXPBULL":true,"VLTC":true,"SHREK":true,"TCHTRX":true,"BIFI":true,"BRAIN":true,"BTTF":true,"ETHS":true,"EXMR":true,"LTCUP":true,"OPS":true,"QNTU":true,"ERC20":true,"FNK":true,"MUSTANGC":true,"DAO":true,"DRACO":true,"LINKUP":true,"MTLM3":true,"NIM":true,"PNP":true,"ACE":true,"YIN":true,"FIO":true,"RAM":true,"MINIDOGE":true,"NPXS":true,"POLS":true,"LUTETIUM":true,"TST":true,"FOR":true,"GTC":true,"GNT":true,"AMP":true,"DFSOCIAL":true,"ICH":true,"SHIBELON":true,"CPRX":true,"SUSHIDOWN":true,"TROY":true,"VEE":true,"AMB":true,"DIGG":true,"ETHUP":true,"LKR":true,"USHIBA":true,"YFIUP":true,"MELD":true,"RIO":true,"CNS":true,"ERN":true,"EXIT":true,"BOSU":true,"LTCP":true,"MM":true,"WRT":true,"PULSE":true,"AVA":true,"BTA":true,"IETH":true,"MIST":true,"ONGAS":true,"XTC":true,"PTU":true,"BCHUP":true,"NCR":true,"BSCPAD":true,"BTCZ":true,"AUSD":true,"WNYC":true,"DUC":true,"FLLW":true,"LUA":true,"MN":true,"NGL":true,"ALIC":true,"IMX":true,"SIS":true,"ATB":true,"UFO":true,"GAIAPLATFORM":true,"PARKGENE":true,"GENE":true,"AUCTION":true,"BIRDCHAIN":true,"BIRD":true,"BTCD":true,"DREP":true,"ILV":true,"DNA":true,"BICO":true,"SHIRYOINU":true,"GRT":true,"FREN":true,"PINK":true,"PSG":true,"RARI":true,"SONA":true,"SHAKE":true,"MILK2":true,"LTNM":true,"OMIC":true,"KMA":true,"SANTOS":true,"XTAG":true,"CCAR":true,"FLAME":true,"UNIC":true,"KILT":true,"TESMA":true,"SRX":true,"PERI":true,"MIMO":true,"DS":true,"MOCHI":true,"GN":true,"DOE":true,"TRL":true,"HKC":true,"PEOPLE":true,"DOSE":true,"POLYDOGE":true,"LATTE":true,"TOWN":true,"TONCOIN":true,"XEC":true,"FLM":true,"NODE":true,"WAXE":true,"CHARIZARD":true,"XPNET":true,"SCAR":true,"VVS":true,"REALM":true,"XTM":true,"MEMEINU":true,"PARAL":true,"HEART":true,"MONO":true,"GMMT":true,"ENEDEX":true,"XPAY":true,"FDT":true,"LUDO":true,"CWT":true,"MINDCOIN":true,"DEC":true,"TSC":true,"NYBBLE":true,"wsOHM":true,"sOHM":true,"gOHM":true,"NETCOIN":true,"MODEX":true,"LEOPARD":true,"LACE":true,"PCL":true,"MNET":true,"VOXEL":true,"RIFI":true,"ZMT":true,"TRAVELLER":true,"SUB":true,"SPOOL":true,"AUTON":true,"BABYELON":true,"BHD":true,"BOSON":true,"CROWD":true,"EOSDOWN":true,"EPS":true,"FARMC":true,"KWIK":true,"LEMON":true,"UNIGRID":true,"NYN":true,"TRVL":true,"ST":true,"TETRIX":true,"ENO":true,"CINU":true,"CLVX":true,"AKTIO":true,"BKN":true,"VAIYO":true,"CEM":true,"AGV":true,"FRDX":true,"QUBE":true,"BTN":true,"KALYCOIN":true,"BTRFLY":true,"RUX":true,"TDAO":true,"TR3":true,"CLNY":true,"EZ":true,"ETHOS":true,"DESO":true,"VLC":true,"NIFTSY":true,"BTCBR":true,"EURT":true,"EURX":true,"GOG":true,"JFIN":true,"MCS":true,"PDATA":true,"KIRO":true,"MNS":true,"MC":true,"GMPD":true,"MHT":true,"SFM":true,"HIGH":true,"WSB":true,"E21":true,"GF":true,"DEVT":true,"STKAAVE":true,"STZEN":true,"AAA":true,"EPIK":true,"VEGA":true,"NIF":true,"DAPPT":true,"MBS":true,"ZERO":true,"LITENETT":true,"LNT":true,"IBFR":true,"CRF":true,"MNGO":true,"BEPRO":true,"R1":true,"SHIBO":true,"MSOL":true,"SECO":true,"STSOL":true,"INTER":true,"GATE":true,"CPH":true,"LUNR":true,"DIKO":true,"TULIP":true,"WOD":true,"GLM":true,"HACHIKO":true,"BLAZR":true,"PONYO":true,"ASIA":true,"ZEROEX":true,"VPAD":true,"YOOSHI":true,"NYANTE":true,"NNI":true,"WMATIC":true,"IMPACTXP":true,"VADER":true,"KASTA":true,"RDR":true,"LUS":true,"FLOKI":true,"ARDX":true,"WNK":true,"F2C":true,"BTTOLD":true,"COVN":true,"SHIBADOLLARS":true,"PHONON":true,"WEB3":true,"GAMMA":true,"1ART":true,"MITX":true,"BLOOMT":true,"BLT":true,"STARSH":true,"STARS":true,"NCT":true,"NAMEC":true,"DONATION":true,"DON":true,"UNB":true,"NERVE":true,"NRV":true,"SYNLEV":true,"SYN":true,"REALPLATFORM":true,"REVU":true,"STARL":true,"WBTC":true,"XLMDOWN":true,"ALBT":true,"ATRI":true,"BEST":true,"OHMV2":true,"DEFIBULL":true,"ELS":true,"FOODC":true,"MCN":true,"TRST":true,"UNORE":true,"VCN":true,"VGX":true,"YOP":true,"BULL":true,"KATA":true,"GLMR":true,"CLDX":true,"CNC":true,"CTY":true,"ERD":true,"EXCHBEAR":true,"FILDOWN":true,"GRN":true,"MINTME":true,"SETHER":true,"KINT":true,"ATOLO":true,"AURORA":true,"WND":true,"BONDED":true,"SSG":true,"POKT":true,"JBX":true,"BORA":true,"GAMEC":true,"OCT":true,"SHA":true,"SOLE":true,"ACM":true,"TGC":true,"TRTL":true,"VIDT":true,"VRSC":true,"YSH":true,"2GT":true,"ADADOWN":true,"VGO":true,"ONLY":true,"BONDLY":true,"CBDC":true,"DRG":true,"OCN":true,"OHM":true,"COMT":true,"DPS":true,"EASYF":true,"WLITI":true,"BETH":true,"BURGER":true,"CNBC":true,"WSTETH":true,"BED":true,"NS2DRP":true,"ZAM":true,"DSH":true,"ETHBEAR":true,"ETHDOWN":true,"ROOK":true,"SPH":true,"TES":true,"TRS":true,"TRXUP":true,"UNIT":true,"VXV":true,"WUST":true,"XTZUP":true,"GHOSTM":true,"WTK":true,"ASTRAL":true,"STBU":true,"RNDR":true,"XPRT":true,"BRGX":true,"OOKI":true,"LOKA":true,"XPT":true,"DHT":true,"SHINJA":true,"SOFI":true,"GRAVITYF":true,"GFI":true,"SLICEC":true,"SLC":true,"AWORK":true,"IONZ":true,"SOLARIX":true,"LOOKS":true,"OSMO":true,"OXD":true,"ASH":true,"ABEY":true,"PLI":true,"EVER":true,"VOY":true,"ACA":true,"SATS":true,"WILDC":true,"ATH":true,"ORACLECHAIN":true,"MOFOLD":true,"AVO":true,"PROP":true,"LOVE":true,"GARI":true,"NUMBERS":true,"NUM":true,"LIFE":true,"EGC":true,"ASTR":true,"VLX":true,"MPT":true,"CHMB":true,"ANC":true,"XBB":true,"BOE":true,"DMTR":true,"EXP":true,"ATR":true,"BTCL":true,"CGLD":true,"DIEM":true,"DPR":true,"ETHB":true,"MTBC":true,"MNW":true,"HITBTC":true,"HXX":true,"IGNIS":true,"NCASH":true,"NFTP":true,"O3":true,"FREEROSS":true,"FCON":true,"IXS":true,"ARKER":true,"FRR":true,"MAKI":true,"SWASH":true,"NTVRK":true,"FTG":true,"ZKT":true,"PEL":true,"SOLR":true,"SUNOLD":true,"SYBC":true,"XTREME":true,"AUTO":true,"BAR":true,"GZIL":true,"PHX":true,"PLC":true,"SOLA":true,"TAURI":true,"WTC":true,"XTROPTIONS":true,"XUP":true,"ILA":true,"CLH":true,"CREDI":true,"RACEFI":true,"CWEB":true,"DAPPX":true,"CPOOL":true,"MBTC":true,"GTON":true,"ACCEL":true,"SAFES":true,"DRONE":true,"ORCA":true,"SX":true,"1ECO":true,"1PECO":true,"APXP":true,"ARTII":true,"B2M":true,"CHN":true,"CHNG":true,"CIND":true,"CRFI":true,"LPNT":true,"MBET":true,"TONIC":true,"SNS":true,"HBB":true,"ZKP":true,"TRACE":true,"NT":true,"WALLET":true,"LOOTEX":true,"STORE":true,"NINKY":true,"BPAD":true,"XAEAXII":true,"CBC":true,"DIFX":true,"BLINU":true,"CULT":true,"CHEESUS":true,"BDOT":true,"CGT":true,"RADR":true,"BAOE":true,"SSHARE":true,"PERC":true,"ONSTON":true,"WPR":true,"UNBREAKABLE":true,"SUPER":true,"XLD":true,"SGR":true,"STOX":true,"STX":true,"ENTC":true,"KOM":true,"CFXT":true,"KINGSHIB":true,"PAF":true,"CLIFF":true,"FTS":true,"CTPL":true,"HYVE":true,"EPTT":true,"BCZ":true,"BDX":true,"EWC":true,"ASTRO":true,"MYCELIUM":true,"MYCE":true,"ADS":true,"ALKI":true,"VDV":true,"TYCOON":true,"JCC":true,"GPX":true,"ICA":true,"KRRX":true,"MF1":true,"MQL":true,"NKCLC":true,"SBT":true,"YEFI":true,"FLUX":true,"ZPTC":true,"GGG":true,"EGI":true,"MIKS":true,"YAMV1":true,"YAMV2":true,"SURV":true,"FALCONS":true,"ROAR":true,"ERTHA":true,"MMPRO":true,"FSHN":true,"SVS":true,"STON":true,"DHS":true,"DEPO":true,"EVU":true,"POSI":true,"MONS":true,"LBLOCK":true,"PLASTIK":true,"TRAVA":true,"ONLYCUMIES":true,"OPENRI":true,"BRISE":true,"YUMMY":true,"VODKA":true,"MRFOX":true,"LEXI":true,"AFEN":true,"LOVELY":true,"TCY":true,"AVG":true,"SSV":true,"WRK":true,"CODI":true,"BEPR":true,"BRT":true,"APP":true,"THT":true,"LNR":true,"WEC":true,"ZONO":true,"NFTY":true,"BHAX":true,"LUFFY":true,"YUCT":true,"CSOV":true,"PDX":true,"USNOTA":true,"VIBLO":true,"MGT":true,"SHOP":true,"UPI":true,"VOX":true,"CCD":true,"UNW":true,"SAP":true,"GNNX":true,"KAINET":true,"UDO":true,"I7":true,"CHSB":true,"SRN":true,"DIA":true,"PPC":true,"PTD":true,"PLCU":true,"REFI":true,"SIGNA":true,"UPR":true,"EVERGREEN":true,"OPENDAOSOS":true,"HEP":true,"REVON":true,"AWT":true,"VERA":true,"GHD":true,"ANTEX":true,"MEL":true,"KIAN":true,"ZUKI":true,"OOGI":true,"KALAM":true,"PLEX":true,"TWIN":true,"IJC":true,"UNBNK":true,"ALD":true,"TKING":true,"LORD":true,"DDDD":true,"INFTT":true,"DASHD":true,"MOO":true,"NEXM":true,"PKN":true,"HEC":true,"VEMP":true,"VINU":true,"RADAR":true,"BLUESPARROW":true,"ASPO":true,"SENATE":true,"BSI":true,"VYNC":true,"KIBA":true,"EGR":true,"GAMINGSHIBA":true,"DEVO":true,"BRIC":true,"T":true,"RETIRE":true,"GAIA":true,"GUSDT":true,"ZINU":true,"ERON":true,"ZLDA":true,"QRX":true,"BLXM":true,"DBX":true,"SANA":true,"SDOG":true,"LORDZ":true,"DOME":true,"SAPP":true,"GTFO":true,"AFIN":true,"DNF":true,"MVRS":true,"FUKU":true,"TRYF":true,"AUTHORSHIP":true,"XIV":true,"ETERNALT":true,"XET":true,"AXIAL":true,"AXL":true,"BINEM":true,"TDROP":true,"ATS":true,"AITHEON":true,"ACU":true,"GRIDCOIN":true,"ANTIS":true,"DODI":true,"GRC":true,"MCRT":true,"RAVELOUS":true,"QUACK":true,"RAVE":true,"DBD":true,"IMC":true,"CARTERCOIN":true,"CART":true,"ACYC":true,"BIGHAN":true,"SAUNA":true,"BHC":true,"OUD":true,"PIZA":true,"RIMBIT":true,"MRCR":true,"RBT":true,"MAN":true,"NXT":true,"MIMATIC":true,"NEOM":true,"LFW":true,"DOGECOLA":true,"DVDX":true,"RTT":true,"GELATO":true,"YARL":true,"GFCE":true,"YFIDOWN":true,"WOO":true,"NYZO":true,"NXD":true,"YLD":true,"WTON":true,"PKR":true,"ZENITH":true,"PIGGYCOIN":true,"PIGGY":true,"LILFLOKI":true,"AC":true,"AERO":true,"ALCX":true,"AXIS":true,"BTCUP":true,"BTX":true,"DOGACOIN":true,"DYNO":true,"FLOWP":true,"HVN":true,"MAPS":true,"MOS":true,"PLR":true,"RHP":true,"SANSHU":true,"SPARTA":true,"SUNI":true,"TFBX":true,"UBX":true,"XCR":true,"XLMUP":true,"XRPBULL":true,"YON":true,"GROWTH":true,"GRO":true,"MR":true,"WELT":true,"MESA":true,"SRWD":true,"MRXB":true,"MYNE":true,"SMD":true,"TEDDY":true,"CBAT":true,"CZRX":true,"BENJI":true,"BOG":true,"BUNNY":true,"CDN":true,"DESI":true,"ETHBN":true,"FOX":true,"GIM":true,"JULD":true,"LTCDOWN":true,"OKOIN":true,"RVT":true,"SPORE":true,"SWINGBY":true,"BEAN":true,"BMI":true,"BTCP":true,"CTLX":true,"DEXT":true,"DTB":true,"EMANATE":true,"ENU":true,"BAND":true,"MUSE":true,"EVX":true,"IDT":true,"GIMMER":true,"PPAY":true,"UNQ":true,"CDAI":true,"GMR":true,"CUSDT":true,"REGALCOIN":true,"CSAI":true,"REC":true,"CREP":true,"CETH":true,"CUSDC":true,"CCOMP":true,"WAG":true,"RENA":true,"ARTI":true,"WEVE":true,"CRBN":true,"ITAM":true,"KAI":true,"LIME":true,"LNL":true,"BLIN":true,"MEAN":true,"SIDUS":true,"SHOE":true,"NFTL":true,"AART":true,"MRT":true,"RICE":true,"STORM":true,"LAVA":true,"AVAX":true,"TITA":true,"BELT":true,"BZZ":true,"CAS":true,"CMC":true,"COVER":true,"CRAIG":true,"DDRT":true,"DOGETH":true,"DPI":true,"GZONE":true,"EDC":true,"ETNA":true,"GLX":true,"SUPE":true,"SPO":true,"XCV":true,"IDIA":true,"GZLR":true,"BMIC":true,"SHAMAN":true,"ALPINE":true,"ZAMZAM":true,"BSW":true,"OBROK":true,"CYFI":true,"CSUSHI":true,"CMKR":true,"CLINK":true,"CAAVE":true,"SHFT":true,"SCRG":true,"UNQT":true,"DEFIL":true,"DFL":true,"BLOCKN":true,"BLOCK":true,"REALY":true,"REAL":true,"MVP":true,"WKD":true,"HPL":true,"SHIELD":true,"LAVAX":true,"UNIX":true,"TOMB":true,"SUSHI":true,"DOGESWAP":true,"KICK":true,"BF":true,"MHC":true,"MCB":true,"CHESS":true,"TONTOKEN":true,"CRU":true,"DMT":true,"EMC2":true,"DEPTH":true,"PTP":true,"MOONEY":true,"LQR":true,"BOOSTO":true,"BOO":true,"TIME":true,"WONDER":true,"BSL":true,"LC":true,"GCOIN":true,"USX":true,"VCG":true,"X2Y2":true,"RANKER":true,"PHCR":true,"SPELLFIRE":true,"MRHB":true,"QUIDD":true,"MOLA":true,"PSTAKE":true,"STARLY":true,"MOVD":true,"DUEL":true,"ZYR":true,"ARKN":true,"MGG":true,"PHAE":true,"CGU":true,"JEWEL":true,"SHIBTC":true,"VOW":true,"ESGC":true,"HDRN":true,"BPTC":true,"BSPARROW":true,"KUNCI":true,"AIMX":true,"SMARTLOX":true,"BRCP":true,"MERCU":true,"ETP":true,"OMGC":true,"OPEN":true,"REM":true,"KNGN":true,"NTX":true,"CALI":true,"SCND":true,"BENT":true,"ROCO":true,"SOURCE":true,"ARCANE":true,"GAN":true,"NVIR":true,"FROYO":true,"TAROT":true,"LUMA":true,"NBS":true,"POOLZ":true,"GOM2":true,"HAMS":true,"JVY":true,"KNG":true,"KOKO":true,"KRT":true,"LHC":true,"LOC":true,"LTX":true,"LUT":true,"MARSC":true,"NCP":true,"NET":true,"ONION":true,"PPOVR":true,"PRPT":true,"SDAO":true,"SLV":true,"SWAP":true,"TBTC":true,"TESLA":true,"TORN":true,"UST":true,"XBC":true,"XXX":true,"YUANG":true,"ALTBULL":true,"ALUX":true,"BOTX":true,"BUILDIN":true,"BUX":true,"CCAKE":true,"CLVA":true,"COC":true,"COIN":true,"CTIC":true,"DINO":true,"DOGEBULL":true,"DRF":true,"FXC":true,"FXT":true,"GBIT":true,"KEYFI":true,"LGBTQ":true,"LOOK":true,"ROI":true,"RSC":true,"SHR":true,"SPKTR":true,"WING":true,"WOW":true,"BCX":true,"BLANK":true,"BNIX":true,"CONT":true,"COPE":true,"CRAVE":true,"DAGO":true,"FFM":true,"GLQ":true,"GPU":true,"CKT":true,"ANN":true,"FROG":true,"JUSTICE":true,"ALIX":true,"GDOGE":true,"MQST":true,"FABRIC":true,"MOOI":true,"CBG":true,"ULTGG":true,"ALTCOIN":true,"ALT":true,"HEARTBOUT":true,"HP":true,"CONDENSATE":true,"RAIN":true,"UNITRADE":true,"TRADE":true,"LIKEC":true,"LIKE":true,"METI":true,"MTS":true,"CENTRA":true,"CTR":true,"OKT":true,"AGLD":true,"APE":true,"GALA":true,"HBAR":true,"DRAGONMA":true,"ZKS":true,"DMS":true,"QRL":true,"GASDAO":true,"YEED":true,"YFI":true,"WIN":true,"VSYS":true,"AGVC":true,"BIX":true,"FTM":true,"FAT":true,"FIRO":true,"GLC":true,"SUR":true,"STK":true,"XLM":true,"HPT":true,"SOLVE":true,"XSC":true,"IDEX":true,"KMD":true,"KCS":true,"LTO":true,"MOF":true,"XMR":true,"MWAT":true,"RDD":true,"PRA":true,"ATOM":true,"EOSDAC":true,"EOSDT":true,"ETC":true,"GOLDMIN":true,"BEYOND":true,"FLUXT":true,"ETNY":true,"PLM":true,"PULI":true,"DVI":true,"ACETH":true,"CNDL":true,"XDAG":true,"DEXA":true,"UMEE":true,"TTN":true,"BIZZ":true,"LINANET":true,"MON":true,"PROM":true,"AKT":true,"ANON":true,"BEE":true,"NYM":true,"TERAR":true,"EYES":true,"MSU":true,"TREEB":true,"EVA":true,"AVINOC":true,"SD":true,"RAZE":true,"GAD":true,"BLUT":true,"MOM":true,"KUR":true,"TFS":true,"TAUR":true,"AWNEX":true,"LOX":true,"FAYRE":true,"AAG":true,"LCMG":true,"VXL":true,"RETH2":true,"ELV":true,"ISA":true,"KPC":true,"ZB":true,"YAM":true,"XYO":true,"FCT":true,"XWC":true,"FTI":true,"WAN":true,"WABI":true,"VIDY":true,"VTHO":true,"VRA":true,"UQC":true,"UNIVRS":true,"TNB":true,"TNT":true,"THR":true,"SYS":true,"SWFTC":true,"GEM":true,"SWRV":true,"GSC":true,"OKB":true,"GXC":true,"SNM":true,"HYDROP":true,"SOL":true,"HYPERS":true,"SAFEX":true,"XNK":true,"RUFF":true,"ICC":true,"ISR":true,"RSR":true,"IQC":true,"KRL":true,"QLC":true,"PST":true,"KSM":true,"SOUL":true,"LATX":true,"ADB":true,"AE":true,"LC4":true,"AION":true,"LBC":true,"AST":true,"ALG":true,"ACAT":true,"LTC":true,"LRC":true,"AOA":true,"GUP":true,"MEC":true,"PEPE":true,"BNB":true,"BCH":true,"MITH":true,"MX":true,"NANO":true,"NAV":true,"BSV":true,"BITM":true,"BTS":true,"BLZ":true,"STG":true,"NAS":true,"NCC":true,"BTM":true,"BASHOS":true,"NXS":true,"COFI":true,"OCEAN":true,"RNT":true,"TRAC":true,"ORN":true,"OXYC":true,"HE":true,"IB":true,"JONES":true,"BOX":true,"CREAM":true,"LBA":true,"MCO":true,"CURI":true,"DSG":true,"YFII":true,"DF":true,"DGTX":true,"DUSK":true,"ETN":true,"ENCRYPG":true,"ENG":true,"ARCONA":true,"NTR":true,"HVE2":true,"APT":true,"BRIGHT":true,"FUS":true,"PXP":true,"CUDOS":true,"BERRY":true,"WEX":true,"GOPX":true,"GLS":true,"XQC":true,"BRIGHTU":true,"LOV":true,"EOSBLACK":true,"REFLECTO":true,"PYE":true,"TRUEBIT":true,"CRANEPAY":true,"CRYPTOPRO":true,"CRAFTCOIN":true,"DESTINY":true,"DISCOVERY":true,"FAN360":true,"RENTBE":true,"WEXCOIN":true,"GLOWSHA":true,"GHOSTCOIN":true,"GOALBON":true,"GOLOSBLOCKCHAIN":true,"PAPUSHA":true,"AIR":true,"BXC":true,"BCOIN":true,"BLACK":true,"CRP":true,"CP":true,"CRAFT":true,"DES":true,"DIS":true,"FAN":true,"GYM":true,"GSX":true,"GHC":true,"GOAL":true,"PRT":true,"AFX":true,"XIDO":true,"DFIS":true,"PEPPER":true,"BONE":true,"SMARTNFT":true,"USDU":true,"EURU":true,"APED":true,"LORDS":true,"MULTI":true,"ANY":true,"BANANA":true,"GAMEFI":true,"ACET":true,"GRLC":true,"GORILLA":true,"ICON":true,"JUV":true,"KARMA":true,"KASSIAHOME":true,"LINKBEAR":true,"MLITE":true,"XPROT":true,"APTCOIN":true,"AIRTOKEN":true,"BITCOINC":true,"BANNER":true,"BTSC":true,"XDATA":true,"GMTT":true,"GMT":true,"PSY":true,"PSB":true,"SHARECHAIN":true,"SSS":true,"TERAWATT":true,"LED":true,"ORO":true,"PLTXYZ":true,"RON":true,"PLT":true,"RISE":true,"STA":true,"PPALPHA":true,"MGLD":true,"FFN":true,"ZIRVE":true,"HEROESC":true,"PCI":true,"GDL":true,"INFO":true,"MASTER":true,"LOOP":true,"GAMEIN":true,"BLOK":true,"RONCOIN":true,"QUARASHI":true,"QUA":true,"PROBIN":true,"BABYB":true,"BRMV":true,"PESOBIT":true,"POKEM":true,"MILLI":true,"TAU":true,"PSILOC":true,"OROCOIN":true,"WZENIQ":true,"BZENIQ":true,"TMED":true,"STARTA":true,"EPIC":true,"TOR":true,"QUASA":true,"VRN":true,"WGC":true,"SFX":true,"NPT":true,"KPOP":true,"WRLGC":true,"INX":true,"KTX":true,"TITANO":true,"SCROOGE":true,"HPX":true,"3FT":true,"WIT":true,"TORCOIN":true,"VERNAM":true,"WEGEN":true,"WITCOIN":true,"ZENIQ":true,"CHAINCADE":true,"TRYC":true,"GOZ":true,"ASTO":true,"CZZ":true,"IMI":true,"AFC":true,"VCF":true,"NAP":true,"GMX":true,"HPB":true,"BOJI":true,"GAMB":true,"BOBC":true,"GWT":true,"UPO":true,"GAMEX":true,"LIST":true,"TLB":true,"TANK":true,"MDAO":true,"SEON":true,"MOOND":true,"NFTI":true,"NYC":true,"HBTC":true,"CMERGE":true,"METAN":true,"NEKO":true,"TECRA":true,"TCR":true,"TPCASH":true,"MILC":true,"TPC":true,"PLAYKEY":true,"PKT":true,"COFFEECOIN":true,"CFC":true,"LIQUI":true,"LIQ":true,"NOSN":true,"NOS":true,"GR":true,"MONKEY":true,"MNY":true,"HMRN":true,"BITROLIUM":true,"BTL":true,"HKN":true,"FOREXCOIN":true,"FOREX":true,"RBIF":true,"NBL":true,"CHEDDA":true,"SOLAR":true,"FEN":true,"MERIDIAN":true,"DINU":true,"METADOGEV2":true,"NUNET":true,"ASTRONAUT":true,"LIFETOKEN":true,"ENDLESS":true,"ARTY":true,"FTB":true,"VENT":true,"GEAR":true,"ANML":true,"MMF":true,"PHBD":true,"LMR":true,"SCREAM":true,"BRWL":true,"AQUAP":true,"AQUA":true,"VISION":true,"HOLY":true,"GYMREW":true,"WFLOW":true,"LDN":true,"QOM":true,"MAGIC":true,"TCANDY":true,"HDAO":true,"INDI":true,"ZECBULL":true,"ZECBEAR":true,"GRTBULL":true,"GRTBEAR":true,"ASDHEDGE":true,"ASDBULL":true,"ASDBEAR":true,"WNDR":true,"ZIL":true,"ZLA":true,"ZSC":true,"ZEL":true,"ZEC":true,"ZAP":true,"YCC":true,"YOYOW":true,"YOU":true,"YEE":true,"XMX":true,"WXT":true,"WINGS":true,"WETH":true,"WGRT":true,"WAXP":true,"WAVES":true,"WAB":true,"IPL":true,"VNT":true,"VIB":true,"VIBE":true,"VIA":true,"VEST":true,"VTC":true,"VRS":true,"XVG":true,"VET":true,"VALORBIT":true,"UTK":true,"USDK":true,"UNI":true,"ZRX":true,"UFOCOIN":true,"UBT":true,"UMA":true,"UGAS":true,"ULTRA":true,"ULT":true,"UBQ":true,"UBEX":true,"UUU":true,"TRUE":true,"TRX":true,"TRIO":true,"TRV":true,"TOPC":true,"TEN":true,"TCT":true,"THX":true,"RUNE":true,"ABYSS":true,"XTZ":true,"LUNA":true,"TERN":true,"PAY":true,"TEMCO":true,"TLOS":true,"TRB":true,"TEL":true,"SNX":true,"SWTH":true,"SXP":true,"RMT":true,"SUPERC":true,"SNC":true,"SUN":true,"SUKU":true,"AAVE":true,"ABBC":true,"ACT":true,"ACTIN":true,"AAC":true,"DATA":true,"ADX":true,"ELF":true,"AERGO":true,"DLT":true,"AIDOC":true,"ABL":true,"AKRO":true,"ALGO":true,"SOC":true,"ME":true,"AMIO":true,"AMPL":true,"ANKR":true,"ANONCOIN":true,"APL":true,"APPC":true,"ANT":true,"STORJ":true,"SBD":true,"STEEM":true,"SNT":true,"XSN":true,"ABT":true,"ARDR":true,"SNET":true,"SSP":true,"SMART":true,"SKY":true,"SKM":true,"SIX":true,"AGI":true,"ARK":true,"SNGLS":true,"ARPA":true,"XAS":true,"SIB":true,"ATP":true,"AUC":true,"SC":true,"REP":true,"SHIFT":true,"AVT":true,"AXS":true,"BAX":true,"BRC":true,"BNT":true,"BAT":true,"BKBT":true,"BEL":true,"SRM":true,"BESTC":true,"SERO":true,"BZNT":true,"BEZ":true,"SENT":true,"BGG":true,"UPP":true,"BTC":true,"SENC":true,"KEY":true,"BCD":true,"BTG":true,"SEELE":true,"KAN":true,"SCRT":true,"BMX":true,"DDD":true,"SAN":true,"SAND":true,"BTT":true,"BUT":true,"SLS":true,"BKK":true,"SALT":true,"BLK":true,"BLOCM":true,"BCDN":true,"BLOC":true,"XRP":true,"RCN":true,"BCPT":true,"BFT":true,"BODHI":true,"BNTY":true,"RING":true,"RISEVISION":true,"BRD":true,"RIF":true,"GBYTE":true,"BCN":true,"CLO":true,"CAPP":true,"ADA":true,"CV":true,"CELR":true,"CELO":true,"REQ":true,"REPO":true,"CEL":true,"CENNZ":true,"RENBTC":true,"LINK":true,"REN":true,"CHESSCOIN":true,"CHR":true,"CND":true,"CVC":true,"CLOAK":true,"RFR":true,"CNNS":true,"CODY":true,"CET":true,"RED":true,"PHB":true,"COING":true,"RVN":true,"RDN":true,"QCX":true,"QKC":true,"QSP":true,"QNT":true,"QTUM":true,"MEET":true,"CHP":true,"CBT":true,"COMP":true,"CSM":true,"QASH":true,"PMA":true,"PRO":true,"CNN":true,"CVNT":true,"PRE":true,"CTXC":true,"CVP":true,"COTI":true,"XCP":true,"POWR":true,"COV":true,"POT":true,"PORTAL":true,"CRPT":true,"PPT":true,"POLY":true,"MATIC":true,"PLBT":true,"DOT":true,"POCC":true,"POA":true,"PNT":true,"PIVX":true,"PVT":true,"CRO":true,"C20":true,"PING":true,"CRV":true,"CMT":true,"CVT":true,"DACC":true,"DASH":true,"DAT":true,"DAC":true,"DCR":true,"DBC":true,"DPY":true,"DENT":true,"DCN":true,"PAXEX":true,"DERO":true,"DGB":true,"DIGIC":true,"PART":true,"TMTG":true,"XDN":true,"DGD":true,"DNT":true,"DMG":true,"DOCK":true,"DOGE":true,"RATING":true,"DRGN":true,"ORBS":true,"DX":true,"EKO":true,"EKT":true,"EDU":true,"EGT":true,"OAX":true,"ELA":true,"ELEC":true,"ONT":true,"EGLD":true,"ELY":true,"OLT":true,"EM":true,"ECOM":true,"NRG":true,"TSL":true,"ENJ":true,"MLN":true,"OMG":true,"EOS":true,"OGN":true,"ESS":true,"OBSR":true,"ETH":true,"FUEL":true,"NXM":true,"NMR":true,"XUC":true,"NULS":true,"EXM":true,"NVC":true,"FTC":true,"FRM":true,"FET":true,"FIL":true,"FLO":true,"FYP":true,"FLMC":true,"FORCEC":true,"FKX":true,"FRONT":true,"FTT":true,"FUNDZ":true,"FUN":true,"FSN":true,"FXP":true,"GAME":true,"GT":true,"GNX":true,"GVT":true,"GTO":true,"GMB":true,"GNO":true,"GO":true,"GRIN":true,"GRS":true,"NLG":true,"HLC":true,"FARM":true,"HSC":true,"XHV":true,"HEDG":true,"HIT":true,"HOT":true,"HQX":true,"ZEN":true,"HT":true,"HXRO":true,"HYDRO":true,"HC":true,"HYN":true,"IHT":true,"ICX":true,"ICOS":true,"RLC":true,"IMPACT":true,"INJ":true,"IIC":true,"IOC":true,"IOST":true,"ITC":true,"MIOTA":true,"IQ":true,"IQN":true,"IRIS":true,"JRT":true,"JAR":true,"JNT":true,"JST":true,"KCASH":true,"KIN":true,"KNC":true,"LAMB":true,"LDC":true,"LEMO":true,"LST":true,"LEO":true,"LET":true,"LTK":true,"LSK":true,"LOOM":true,"LUN":true,"LYM":true,"MFT":true,"MKR":true,"MVL":true,"MXC":true,"MTX":true,"MDS":true,"MEME":true,"MTA":true,"MTL":true,"MET":true,"MEX":true,"MINA":true,"MIX":true,"MOAC":true,"MDA":true,"MONA":true,"MTH":true,"TKN":true,"MORE":true,"MOC":true,"MBL":true,"MTV":true,"NMC":true,"NEX":true,"NEAR":true,"NEBL":true,"NEC":true,"XEM":true,"NEO":true,"NEU":true,"NEWOS":true,"NEW":true,"NEXO":true,"NKN":true}
const runToggle = document.querySelector(".run-button");
var crypto;
var currency;
var gap;
var money;
var fromDate;
var toDate;
var timeRangeDayChecked;
var timeRangeHourChecked;
var timeRangeMinuteChecked;
var moLossPerc;
var difDays; 

// initializes chart
var labels = [];
var data = {
  labels: labels,
  datasets: []
};
var config = {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
        }
      },
      title: {
        display: true,
        text: 'Trading Bot Simulation'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',

        // grid line settings
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
    }
  },
};

// renders the chart
var myChart = new Chart(
  document.querySelector(".chart"),
  config
);

// gets all input data from user and formats it. Also calculate difference in days
function getData () {
    crypto = document.querySelector(".crypto-input").value;
    currency = document.querySelector(".currency-input").value;
    gap = Number(document.querySelector(".gap-input").value);
    money = Number(document.querySelector(".money-input").value);
    fromDate = document.querySelector(".from-date-input").value;
    toDate = document.querySelector(".to-date-input").value;
    timeRangeDayChecked = document.querySelector(".time-range-day-button").checked; 
    timeRangeHourChecked = document.querySelector(".time-range-hour-button").checked;
    timeRangeMinuteChecked = document.querySelector(".time-range-minute-button").checked;
    moLossPerc = Number(document.querySelector(".moloss-input").value);
    //fromDate = new Date(fromDate[0], fromDate[1]-1, fromDate[2]);
    //toDate = new Date(toDate[0], toDate[1]-1, toDate[2]);
    //difDays = (toDate.getTime() - fromDate.getTime())/86400000;
}

function getHistPrice () {
    const toDateTimestamp = Math.floor(toDate.getTime()/1000);
    if (timeRangeDayChecked) {
      return cc.histoDay(crypto, currency, {timestamp: toDate, limit: difDays})
      .then(data => {
        return data;
      })
      .catch(console.error)
      .then(data => {
        let priceList = data.map(obj => { 
          let time = new Date(obj.time*1000);
          let close = obj.close;
          return {"time": time.toLocaleDateString(), "price": close} });
        return priceList})
        .catch(console.error)
    }
    else if (timeRangeHourChecked) {
      var difHours = difDays*24;
      return cc.histoDay(crypto, currency, {timestamp: toDate, limit: difHours})
      .then(data => {
        return data;
      }).then(data => {
        let priceList = data.map(obj => { 
          let time = new Date(obj.time*1000);
          let close = obj.close;
          return {"time": time.toLocaleDateString(), "price": close} });
        return priceList})
        .catch(console.error)
      .catch(console.error);
    }
    else if (timeRangeMinuteChecked) {
      var difMinutes = difDays*24*60;
      return cc.histoDay(crypto, currency, {timestamp: toDate, limit: difMinutes})
      .then(data => {
        return data;
      }).then(data => {
        let priceList = data.map(obj => { 
          let time = new Date(obj.time*1000);
          let close = obj.close;
          return {"time": time.toLocaleDateString(), "price": close} });
        return priceList})
        .catch(console.error)
      .catch(console.error);
    }
};

function checkInputValid() {
  let valid = true;
  if (!crypto) {
    document.querySelector(".crypto-input-check").innerHTML = "Enter a crypto ticker";
    valid = false;
  }
  else {
    if (!(crypto in coinList)) {
      document.querySelector(".crypto-input-check").innerHTML = "Cryto ticker does not exist";
      valid = false
    }
    else {
      document.querySelector(".crypto-input-check").innerHTML = "";
    } 
  }
  if (!currency) {
    document.querySelector(".currency-input-check").innerHTML = "Enter a currency ticker";
    valid = false;
  }
  else {
    document.querySelector(".currency-input-check").innerHTML = "";
  }
  if (!gap) {
    document.querySelector(".gap-input-check").innerHTML = "Enter a number";
    valid = false;
  }
  else {
    document.querySelector(".gap-input-check").innerHTML = "";
  }
  if (!money) {
    document.querySelector(".money-input-check").innerHTML = "Enter a number";
    valid = false;
  }
  else {
    document.querySelector(".money-input-check").innerHTML = "";
  }
  if (!fromDate) {
    document.querySelector(".from-date-input-check").innerHTML = "Enter a date";
    valid = false;
  }
  else {
    fromDate = fromDate.split("-");
    fromDate = new Date(fromDate[0], fromDate[1]-1, fromDate[2]);
    document.querySelector(".from-date-input-check").innerHTML = "";
  }
  if (!toDate) {
    document.querySelector(".to-date-input-check").innerHTML = "Enter a date";
    valid = false;
  }
  else {
    toDate = toDate.split("-");
    toDate = new Date(toDate[0], toDate[1]-1, toDate[2]);
    document.querySelector(".to-date-input-check").innerHTML = "";
  }
  if (toDate && fromDate) {
    difDays = (toDate.getTime() - fromDate.getTime())/86400000
  }
  if (difDays<0){ // ensures end date is later than start date
    let errorText = "Invalid date input";
    document.querySelector(".from-date-input-check").innerHTML = errorText;
    document.querySelector(".to-date-input-check").innerHTML = errorText;
    valid = false;
  }
  else if (toDate && fromDate) {
    document.querySelector(".from-date-input-check").innerHTML = "";
    document.querySelector(".to-date-input-check").innerHTML = "";
  }
  if (!timeRangeDayChecked && !timeRangeHourChecked && !timeRangeMinuteChecked) {
    document.querySelector(".time-range-input-check").innerHTML = "Choose a time range";
    valid = false;
  }
  else {
    document.querySelector(".time-range-input-check").innerHTML = "";
  }
  return valid
}

function runTradingBot() {
  return
}
function getCoinList() {
  return cc.coinList()
      .then(data => {
        return data.Data;
      })
      .catch(console.error)
      .then(data => {
        let coinList = {};
        for (const [key, value] of Object.entries(data)) {
          coinList[`${key}`] = true;
        }
        return coinList})
        .catch(console.error)
}


runToggle.addEventListener('click', async function () {
    //let coinList = await getCoinList();
    //console.log(coinList)
    //document.querySelector("#coinList").innerText = JSON.stringify(coinList);
    getData(); // retrieves input from user
    let validInput = checkInputValid();
    if (!validInput) {return}
    console.log(crypto, currency, gap, money, fromDate, toDate, difDays, timeRangeDayChecked, timeRangeHourChecked, timeRangeMinuteChecked, moLossPerc);
    let timePriceList = await getHistPrice(); // retrieves historical data from cryptocompare
    let timeList = timePriceList.map(data => data.time);
    let priceList = timePriceList.map(data => data.price);
    let initAmt = money/priceList[0];
    let totalValeWithoutBot = priceList.map(price => price*initAmt)
    


    //result = runTradingBot();
    let noBotProfit;
    
    // charts data
    labels = timeList;
    data = {
      labels: labels,
      datasets: [
        {
          label: "Cryptocurrency Price",
          data: priceList,
          borderColor: 'rgb(66, 135, 245)',
          backgroundColor: 'rgb(66, 135, 245, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Total Value Without Trading Bot',
          data: totalValeWithoutBot,
          borderColor: 'rgb(69, 191, 69)',
          backgroundColor: 'rgb(69, 191, 69, 0.5)',
          yAxisID: 'y1',
        }
      ]
    };
    config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        stacked: false,
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            }
          },
          title: {
            display: true,
            text: 'Trading Bot Simulation'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
    
            // grid line settings
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        }
      },
    };
    // deletes old chart and adds a new <canvas> element 
    document.querySelector(".chart").remove();
    document.querySelector(".chart-container").innerHTML = '<canvas class="chart"></canvas>';
    myChart = new Chart(
      document.querySelector(".chart"),
      config
    );
});

// to reset zoom. Basically recreates the chart
document.querySelector(".reset-zoom-button").onclick = () => {
  myChart.resetZoom();
}
    

// ------------- END OF MY CODE --------------- //
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"cryptocompare":1,"node-fetch":2}]},{},[3]);
