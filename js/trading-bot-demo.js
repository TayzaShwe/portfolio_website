const runToggle = document.querySelector(".run-button");
global.fetch = require('node-fetch');
const cc = require('cryptocompare'); 
cc.setApiKey('76a059bd9813c0c3e678799f86f22cf562bc1f27ac993640c300212678377184'); // your api key
var crypto;
var currency;
var gap;
var money;
var fromDate;
var toDate;
var timeRange;
var moLossPerc;
var difDays; 

// gets all input data from user and formats it. Also calculate difference in days
function getData () {
    crypto = document.querySelector(".crypto-input").value;
    currency = document.querySelector(".currency-input").value;
    gap = Number(document.querySelector(".gap-input").value);
    money = Number(document.querySelector(".money-input").value);
    fromDate = document.querySelector(".from-date-input").value.split('-');
    toDate = document.querySelector(".to-date-input").value.split('-');
    timeRange = document.querySelector(".time-range-input").value;
    moLossPerc = Number(document.querySelector(".moloss-input").value);
    const fromDateObj = new Date(fromDate[0], fromDate[1]-1, fromDate[2]);
    const toDateObj = new Date(toDate[0], toDate[1]-1, toDate[2]);
    difDays = toDateObj.getTime() - fromDateObj.getTime();
}

function getHistPrice () {
    switch (timeRange) {
        case 'DAY':
            cc.histoDay(crypto, currency, toTs=toDate.time(), limit=difDays).then(dataArr =>
                { return dataArr.map(data => data.close);
                } ).catch(console.log("error retrieving historical price data"));
        case 'HOUR': 
            cc.histoHour(crypto, currency, toTs=toDate.time(), limit=difDays).then(dataArr =>
                { return dataArr.map(data => data.close);
                } ).catch(console.log("error retrieving historical price data")); 
        case 'MINUTE':
            cc.histoMinute(crypto, currency, toTs=toDate.time(), limit=difDays).then(dataArr =>
                { return dataArr.map(data => data.close);
                } ).catch(console.log("error retrieving historical price data")); 
    }
};



runToggle.addEventListener("click", () => {
    getData();
    const priceList = getHistPrice();
    console.log(priceList)
    console.log(productId, gap, money, fromDate, toDate, timeRange, moLossPerc)
})

function mainProgram () {
    return
}