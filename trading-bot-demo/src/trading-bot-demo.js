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

import { coinList } from "extra-data.js";

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