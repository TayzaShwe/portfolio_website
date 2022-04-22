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
var labels = [1, 2, 3, 4, 5];
var data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: [10, 11, 23, 54, 13],
      borderColor: 'rgb(66, 135, 245)',
      backgroundColor: 'rgb(203, 219, 245)',
      yAxisID: 'y',
    },
    {
      label: 'Dataset 2',
      data: [12,45,23,43,54],
      borderColor: 'rgb(66, 135, 245)',
      backgroundColor: 'rgb(203, 219, 245)',
      yAxisID: 'y1',
    }
  ]
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
    var dateLabels = timeList;
    var priceData = {
      labels: dateLabels,
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
      data: priceData,
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
    var newChart = new Chart(
      document.querySelector(".chart"),
      config
    );
    
    
    /*
    date = new Date(2021, 04, 05);

    cc.histoDay('BTC', 'USD', {toTs: (Math.floor(date.getTime()/1000)), limit: 30})
    .then(data => {
      var arr = data.map(obj => obj.close)
      console.log(arr)
    })
    .catch(console.error)

    cc.priceHistorical('BTC', ['USD', 'EUR'], new Date('2017-01-01'))
    .then(prices => {
      console.log(prices)
    })
    .catch(console.error)


    cc.price('BTC', 'USD')
    .then(prices => {
        console.log(prices);
    })
    .catch(console.error)
    */
    });
    

// ------------- END OF MY CODE --------------- //