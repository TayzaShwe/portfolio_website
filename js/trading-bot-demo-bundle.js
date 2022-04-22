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

const runToggle = document.querySelector(".run-button");
var crypto;
var currency;
var gap;
var money;
var fromDate;
var toDate;
var timeRangeDayChecked;
var timeRangeHourChecked;
var timeRangeDayChecked;
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
    fromDate = document.querySelector(".from-date-input").value.split('-');
    toDate = document.querySelector(".to-date-input").value.split('-');
    timeRangeDayChecked = document.querySelector(".time-range-day-button").checked; 
    timeRangeHourChecked = document.querySelector(".time-range-hour-button").checked;
    timeRangeMinuteChecked = document.querySelector(".time-range-minute-button").checked;
    moLossPerc = Number(document.querySelector(".moloss-input").value);
    fromDate = new Date(fromDate[0], fromDate[1]-1, fromDate[2]);
    toDate = new Date(toDate[0], toDate[1]-1, toDate[2]);
    difDays = (toDate.getTime() - fromDate.getTime())/86400000;
}

async function getHistPrice () {
    const toDateTimestamp = Math.floor(toDate.getTime()/1000);
    if (timeRangeDayChecked) {
      return cc.histoDay(crypto, currency, {timestamp: toDate, limit: difDays})
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

function runTradingBot() {
  return
}


runToggle.addEventListener('click', async function () {
    getData(); // retrieves input from user
    if (difDays<0){ // ensures end date is later than start date
      let errorText = "Invalid date input";
      document.querySelector(".from-date-input-check").innerHTML = errorText;
      document.querySelector(".to-date-input-check").innerHTML = errorText;
      return;
    }
    else {
        document.querySelector(".from-date-input-check").innerHTML = "";
        document.querySelector(".to-date-input-check").innerHTML = "";
    }
    console.log(crypto, currency, gap, money, fromDate, toDate, difDays, timeRangeDayChecked, timeRangeHourChecked, timeRangeMinuteChecked, moLossPerc);
    let timePriceList = await getHistPrice(); // retrieves historical data from cryptocompare
    console.log(timePriceList);
    let timeList = timePriceList.map(data => data.time);
    let priceList = timePriceList.map(data => data.price);
    let initAmt = money/priceList[0];
    let totalValeWithoutBot = priceList.map(price => price*initAmt)
    console.log(timeList, priceList);
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
