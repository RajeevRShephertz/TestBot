
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
        return resultCompanies;

    },

    apiTwo: function (a, b) {
        return a + b;
    }
}

