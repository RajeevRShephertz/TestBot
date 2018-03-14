/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var bse = require('./bseHelper.js');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: '33774495-08e0-4665-bcd2-ba2657c579c7',
    appPassword: 'g94oUQWiu6(?Y&Cl',
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, 'DefaultEndpointsProtocol=https;AccountName=bsechatbotaeb2;AccountKey=uEGvOdze4TVeqrMU3U0VkHvOGcz/KIfH/+7BAM1Kfzhx8kMhDmmvOxSDOivV/Sj4igUy8LWbcY0s/+zU8s+LUA==;');
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// var bot = new builder.UniversalBot(connector);
// bot.set('storage', tableStorage);


var inMemoryStorage = new builder.MemoryBotStorage();

// This is a dinner reservation bot that uses multiple dialogs to prompt users for input.
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.beginDialog('askForHelpTopic');
    },
    function (session, results) {
        session.dialogData.helpTopic = results.response;
        if (results.response == "Company") {
            session.beginDialog('askForCompanyName');
        } else if (results.response == "FAQ") {
            session.beginDialog('openFAQPage');
        } else if (results.response == "Other") {
            session.beginDialog('other');
        } else {
            session.beginDialog('askForSelect');
        }
    },
    function (session, results) {
        session.dialogData.companyName = results.response;
        session.beginDialog('showCompanyList');
    },
    function (session, results) {
        session.dialogData.fullCompanyName = results.response;
        session.beginDialog('askForQueryAboutCompany');
        // Process request and display reservation details
        // session.send(`Reservation confirmed. Reservation details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
        // session.endDialog();
    },
    function (session, results) {
        session.dialogData.userQuery = results.response;
        // Process request
         session.send(`You are querying about: ${session.dialogData.fullCompanyName} <br/>For : ${session.dialogData.userQuery}`);
         session.endDialog();
    }
]).set('storage', inMemoryStorage) // Register in-memory storage 

// ====DIALOGS==============================
// ===========DIALOGS=======================
// ===================DIALOGS===============
// ===========================DIALOGS=======



bot.dialog('askForHelpTopic', [
    function (session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .text("Hello, welcome to BSE. How may I assist you today?")
                .buttons([
                    builder.CardAction.imBack(session, "Company", "Company"),
                    builder.CardAction.imBack(session, "FAQ", "FAQ"),
                    builder.CardAction.imBack(session, "Other", "Other")
                ])
        ]);
        builder.Prompts.text(session, msg);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

// Dialog to ask for a date and time
bot.dialog('askForSelect', [
    function (session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .text("Please select from below list.")
                .buttons([
                    builder.CardAction.imBack(session, "Company", "Company"),
                    builder.CardAction.imBack(session, "FAQ", "FAQ"),
                    builder.CardAction.imBack(session, "Other", "Other")
                ])
        ]);
        builder.Prompts.text(session, msg);
    },
    function (session, results) {
        session.dialogData.helpTopic = results.response;
        if (results.response.toLower() == "company") {
            session.beginDialog('askForCompanyName');
        } else if (results.response.toLower() == "faq") {
            session.beginDialog('openFAQPage');
        } else if (results.response.toLower() == "other") {
            session.beginDialog('other');
        } else {
            session.beginDialog('askForSelect');
        }
    }
]);



// Dialog to ask for number of people in the party
bot.dialog('askForCompanyName', [
    function (session) {
        builder.Prompts.text(session, "Please provide company name.");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

// Dialog to ask for number of people in the party
bot.dialog('openFAQPage', [
    function (session) {
        session.send("Ok I am redirecting you to our FAQ page.");
        session.endDialog();
    }
]);

// Dialog to ask for number of people in the party
bot.dialog('other', [
    function (session) {
        builder.Prompts.text(session, "Please provide your query.");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);


// Dialog to ask for the reservation name.
bot.dialog('showCompanyList', [
    function (session) {
        var companies = bse.apiForGetCompanyByName(session.dialogData.companyName);
        console.log(companies);
        var companiesList = [];
        for(var companyName in companies){
            var cardAction = builder.CardAction.imBack(session, companies[companyName], companies[companyName])
            companiesList.push(cardAction);
        }
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .text("Please select from below list")
                .buttons(companiesList)
        ]);
        builder.Prompts.text(session, msg);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);


// Dialog to askForQueryAboutCompany
bot.dialog('askForQueryAboutCompany', [
    function (session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .text("What you want to query about " + session.dialogData.fullCompanyName)
                .buttons([
                    builder.CardAction.imBack(session, "GetQuote", "GetQuote"),
                    builder.CardAction.imBack(session, "Results", "Results"),
                    builder.CardAction.imBack(session, "News", "News")
                ])
        ]);
        builder.Prompts.text(session, msg);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);
