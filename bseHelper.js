
var companyNames;

module.exports = {
   

    apiForGetCompanyByName: function (companyName) {
        var resultCompanies = [];
        resultCompanies.push("Hdfc Life");
        resultCompanies.push("Hdfc Ergo");
        resultCompanies.push("Hdfc Alpha");
        resultCompanies.push("Hdfc Beta");
        resultCompanies.push("Hdfc Gaama");

        //     // resultCompanies.push("Tata Whiskey");
        //     // resultCompanies.push("Tata Seirra");
        //     // resultCompanies.push("Tata Rum");
        //     // resultCompanies.push("Tata Beer");

        //     // var companies = [];

        //     // for (var t in resultCompanies) {
        //     //     if (resultCompanies[t].toUpperCase().indexOf(companyName.toUpperCase()) > -1)
        //     //         companies.push(resultCompanies[t]);
        //     // }

        companyNames = resultCompanies;
        if(companyName === "akshay"){
            companyNames = null;
        }
        return companyNames;
    },

    getCompanyNames: function () {
        if(companyNames)
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

