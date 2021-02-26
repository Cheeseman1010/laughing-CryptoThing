function getAndSetAllCurrencies() {
    let currencyString = '';

    let elements = document.getElementsByClassName("CurrencyDropDown");
    for (let i=0; i < elements.length; i++) {
        elements[i].innerHTML = '<option value="loading...">loading...</options>';
    }

    const url = "https://api.coinpaprika.com/v1/coins";
    fetch(url)
        .then(function(response) {
            return response.json();
        }).then(function(json) {
            console.log("success - coins");
            for (let i=0; i < 99; i++) { //There's just way too many results, and I don't want all of them.
                currencyString += '<option value="';
                currencyString += json[i].id;
                currencyString += '">' + json[i].symbol + '</option>'
            }
            
            let elements = document.getElementsByClassName("CurrencyDropDown");
            for (let i=0; i < elements.length; i++) {
                elements[i].innerHTML = currencyString;
            }
        });
}

async function callV1CoinsWithProvidedId(id) {
    let url = "https://api.coinpaprika.com/v1/coins/" + id;
    let data = await fetch(url)
        .then(function(response) {
            return response.json();
        });
    return data;
}

async function callV1MarketDataLastDayWithProvidedId(id, type) {
    let url = "https://api.coinpaprika.com/v1/coins/" + id + "/ohlcv/latest/?quote=" + type;
    let data = await fetch(url)
        .then(function(response) {
            return response.json();
        });
    return data;
}

async function callV1MarketDataLatestWithProvidedId(id, type) {
    let url = "https://api.coinpaprika.com/v1/coins/" + id + "/ohlcv/today/?quote=" + type;
    let data = await fetch(url)
        .then(function(response) {
            return response.json();
        });
    return data;
}

async function quickCompare() {
    //get drop down values
    let currency1Id = document.getElementById("QuickCompareFirst").value;
    let currency2Id = document.getElementById("QuickCompareSecond").value;
    console.log("Currency1Id:"+currency1Id+" Currency2Id:"+currency2Id);

    let currency1Data = await callV1CoinsWithProvidedId(currency1Id);
    let currency1Name = currency1Data.name;

    let currency2Data = await callV1CoinsWithProvidedId(currency2Id);
    let currency2Name = currency2Data.name;

    let json1 = await callV1MarketDataLastDayWithProvidedId(currency1Id, "USD");

    let json2 = await callV1MarketDataLastDayWithProvidedId(currency2Id, "USD");

    let resultsCode = "";
    resultsCode += '<div class="quickCompareItem"><h3>' + currency1Name + '</h3>';
    resultsCode += '<h4>' + currency1Id + '</h4>';
    resultsCode += '<p>Stats for last full day:</p>';
    resultsCode += '<ul><li>Open: ' + getTextColor(json1[0].open, json2[0].open) + json1[0].open + ' USD</span></li>';
    resultsCode += '<li>High: ' + getTextColor(json1[0].high, json2[0].high) + json1[0].high + ' USD</span></li>';
    resultsCode += '<li>Low: ' + getTextColor(json1[0].low, json2[0].low) + json1[0].low + ' USD</span></li>';
    resultsCode += '<li>Close: ' + getTextColor(json1[0].close, json2[0].close) + json1[0].close + ' USD</span></li>';
    resultsCode += '</ul></div>';
    resultsCode += '<div class="quickCompareItem"><h3>' + currency2Name + '</h3>';
    resultsCode += '<h4>' + currency2Id + '</h4>';
    resultsCode += '<p>Stats for last full day:</p>';
    resultsCode += '<ul><li>Open: ' + getTextColor(json2[0].open, json1[0].open) + json2[0].open + ' USD</span></li>';
    resultsCode += '<li>High: ' + getTextColor(json2[0].high, json1[0].high) + json2[0].high + ' USD</span></li>';
    resultsCode += '<li>Low: ' + getTextColor(json2[0].low, json1[0].low) + json2[0].low + ' USD</span></li>';
    resultsCode += '<li>Close: ' + getTextColor(json2[0].close, json1[0].close) + json2[0].close + ' USD</span></li>';
    resultsCode += '</ul></div>';
    // insert thing about how many currency2's make up 1 currency1.

    document.getElementById("QuickCompareResults").innerHTML = resultsCode;
}

function getTextColor(first, second) {
    if (isFirstGreaterThanSecond(first, second) == first) return '<span class="green">';
    if (isFirstGreaterThanSecond(first, second) == second) return '<span class="red">';
    if (isFirstGreaterThanSecond(first, second) == 0) return '<span class="yellow">';
}

function isFirstGreaterThanSecond(first, second) {
    if (first > second) return first;
    if (first < second) return second;
    if (first == second) return 0;
}

function figureOutIfWereUsingUSDorBTC(options) {
    if (options.includes("UseBTCInsteadOfUSD")) return "btc";
    return "usd";
}

function areWeUsingLastDayOptions(options) {
    if (options.find(element => element.includes("Last"))) return true;
    return false;
}

function areWeUsingTodayOptions(options) {
    if (options.find(element => element.includes("Today"))) return true;
    return false;
}

async function deepCompare() {
    //Get values of dynamic drop downs
    let ids = getValuesOfDeepDropDowns();
    //Get applied options
    let options = getValuesOfDeepOptions();
    //Run APIs (for each id)
    let currencyData = [];
    let lastDayJson = [];
    let todayJson = [];
    let currencyType = figureOutIfWereUsingUSDorBTC(options);
    let lastDayBool = areWeUsingLastDayOptions(options);
    let todayBool = areWeUsingTodayOptions(options);

    for (let i=0; i < ids.length; i++) {
        currencyData.push(await callV1CoinsWithProvidedId(ids[i]));
        if (lastDayBool) lastDayJson.push(await callV1MarketDataLastDayWithProvidedId(ids[i], currencyType));
        if (todayBool) todayJson.push(await callV1MarketDataLatestWithProvidedId(ids[i], currencyType));
    }

    //Return results
    
    let resultsCode = "";
    for (let i=0; i < ids.length; i++) {
        resultsCode += '<div class="deepCompareItem"><h3>' + currencyData[i].name + '</h3>';
        resultsCode += '<h4>' + ids[i] + '</h4>';

        if (lastDayBool) {
            resultsCode += '<p>Stats for last full day:</p>';
            resultsCode += '<ul>';
            if (options.includes("LastOpen")) resultsCode += '<li>Open: ' + lastDayJson[i][0].open + ' ' + currencyType + '</li>';
            if (options.includes("LastHigh")) resultsCode += '<li>High: ' + lastDayJson[i][0].high + ' ' + currencyType + '</li>';
            if (options.includes("LastLow")) resultsCode += '<li>Low: ' + lastDayJson[i][0].low + ' ' + currencyType + '</li>';
            if (options.includes("LastClose")) resultsCode += '<li>Close: ' + lastDayJson[i][0].close + ' ' + currencyType + '</li>';
            resultsCode += '</ul><br>';
        }

        if (todayBool) {
            resultsCode += '<p>Stats for today:</p>';
            resultsCode += '<ul>';
            if (options.includes("TodayOpen")) resultsCode += '<li>Open: ' + todayJson[i][0].open + ' ' + currencyType + '</li>';
            if (options.includes("TodayHigh")) resultsCode += '<li>High: ' + todayJson[i][0].high + ' ' + currencyType + '</li>';
            if (options.includes("TodayLow")) resultsCode += '<li>Low: ' + todayJson[i][0].low + ' ' + currencyType + '</li>';
            if (options.includes("TodayClose")) resultsCode += '<li>Close: ' + todayJson[i][0].close + ' ' + currencyType + '</li>';
            resultsCode += '</ul><br>';
        }
        resultsCode += '</div>';
    }

    document.getElementById("DeepCompareResults").innerHTML = resultsCode;
}

function getValuesOfDeepDropDowns() {
    let drops = document.getElementsByClassName("DeepCompareDropDown");
    let values = [];
    for (let i=0; i < drops.length; i++) {
        values.push(drops[i].children[0].value);
    }
    return values;
}

function getValuesOfDeepOptions() {
    let drops = document.getElementsByClassName("DeepCompareOption");
    let values = [];
    for (let i=0; i < drops.length; i++) {
        if (drops[i].children[0].checked) values.push(drops[i].children[0].id);
    }
    return values;
}

function addNewDropDown() {
    let newDrop = document.createElement("div");
    newDrop.className = "DeepCompareDropDown";
    newDrop.innerHTML = document.getElementById("BaseDropDown").innerHTML;
    document.getElementById("DeepCompareDropDownsBox").appendChild(newDrop);
}

function removeDropDown() {
    let parentDrop = document.getElementById("DeepCompareDropDownsBox");
    if (parentDrop.children.length > 1) {
        //delete
        parentDrop.removeChild(parentDrop.children[parentDrop.children.length - 1]);
    }
    else {
        //return an error message?
        console.log("you can't delete the last drop down silly goose");
    }
}

document.getElementById("QuickCompareButton").addEventListener("click", quickCompare);
document.getElementById("DeepCompareSubmit").addEventListener("click", deepCompare);
document.getElementById("DeepCompareAdd").addEventListener("click", addNewDropDown);
document.getElementById("DeepCompareRemove").addEventListener("click", removeDropDown);
document.addEventListener('DOMContentLoaded', getAndSetAllCurrencies, false);