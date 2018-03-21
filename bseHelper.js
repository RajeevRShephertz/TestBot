
var companyNames;
var mongoUtil = require('./mongoUtil.js');

module.exports = {

    apiForGetCompanyByName: function (reqStr, onDone) {
        var companiesList = [];
        //var isFound = false;
        var userStringArray = reqStr.split(' ');
        console.log("userStringArray : ", userStringArray);
        var scripsIDsArray = mongoUtil.scripIDsDB();
        var scripsCodesArray = mongoUtil.scripCodesDB();
        var scripsNamesArray = mongoUtil.scripNamesDB();
        //console.log("scripsNamesArray : " + scripsNamesArray);
        for (var i in userStringArray) {
            var singleStr = userStringArray[i];
            console.log("SINGLE STRING : " + singleStr);
            if (!isNaN(singleStr)) {
                console.log("NUMBER FOUND IN STRING : " + singleStr);
                var companyCode = searchLocalDB(singleStr, scripsCodesArray);
                if (companyCode) {
                    console.log("SECURITY CODE FOUND IN DB : " + companyCode);
                    companiesList.push(companyCode);
                }
            }else{
                var companyID = searchLocalDB(singleStr, scripsIDsArray);
                if (companyID) {
                    console.log("SECURITY ID FOUND IN DB : " + companyID);
                    companiesList.push(companyID);
                }
                var companyName = searchLocalDB(singleStr, scripsNamesArray);
                if (companyName) {
                    console.log("SECURITY NAME FOUND IN DB : " + companyName);
                    companiesList.push(companyName);
                }
            }
        }
        // console.log("QUERY FOUND IN USER MESSAGE : " + companiesList);
        if(companiesList.length > 0){
            mongoUtil.getScrips(companiesList, function (result) {
                companyNames = result;
                if (onDone)
                    onDone(result);
            });
        }else{
            onDone(companiesList);
        }
    },

    getCompanyNames: function () {
        if (companyNames)
            return companyNames;
        else
            return null;
    },

    getQueryTypes: function () {
        var queryTypes = [];
        queryTypes.push("Current Price");
        queryTypes.push("Results");
        queryTypes.push("News");
        queryTypes.push("Price Band");
        queryTypes.push("Last 52 weeks high/low");
        queryTypes.push("Corporate Action");

        return queryTypes;
    },

    apiTwo: function (a, b) {
        return a + b;
    }
}

function searchLocalDB(valueToSearch, arrayFromSearch) {
    var result;
    for (var j in arrayFromSearch) {
        var valueInArray = arrayFromSearch[j];
        if (isNaN(valueToSearch)) {
            valueToSearch = valueToSearch.toLowerCase();
            valueInArray = valueInArray.toLowerCase()
        } else {
            valueToSearch = parseInt(valueToSearch);
        }
        var regEx = new RegExp("^" +valueToSearch);
        if (regEx.test(valueInArray)) {
            console.log("Search : " + valueToSearch);
            console.log("DB : " + valueInArray);
            result = arrayFromSearch[j];
            break;
        }
    }
    return result;
}


