/*-----------------------------------------------------------------------------
Chat bot for BSE india. Using microsoft azure bot service.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var bse = require('./bseHelper.js');
var mongoUtil = require('./mongoUtil.js');

const chatbot = "bot";
const chatuser = "user";

mongoUtil.connectToMongo();

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

// var tableName = 'botdata';
// var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, 'DefaultEndpointsProtocol=https;AccountName=bsechatbotaeb2;AccountKey=uEGvOdze4TVeqrMU3U0VkHvOGcz/KIfH/+7BAM1Kfzhx8kMhDmmvOxSDOivV/Sj4igUy8LWbcY0s/+zU8s+LUA==;');
// var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// var bot = new builder.UniversalBot(connector);
// bot.set('storage', tableStorage);


var inMemoryStorage = new builder.MemoryBotStorage();

//bot.set(inMemoryStorage);


// bot.on('conversationUpdate', function (activity) {
//     if (activity.membersAdded) {
//         activity.membersAdded.forEach((identity) => {
//             console.log("activity",activity);
//             console.log("identity",identity);
//             if (identity.id === activity.address.bot.id) {
//                 console.log("I am Here");
//                 bot.send('Hi there!');
//                 // var reply = new builder.activity()
//                 //     .address(activity.address)
//                 //     .text('Hi there!');

//             }
//         });
//     }
// });



// This is a bot that uses multiple dialogs to prompt users for input.
var bot = new builder.UniversalBot(connector, [
    function (session) {
        var msg = `Hello! Welcome to BSE India. I am here to help you.`;
        session.send(msg);
        mongoUtil.insertMessageJson(msg, chatbot, session);
        session.beginDialog('askForHelpTopic');
    },
    function (session, results) {
        session.privateConversationData.helpTopic = results.response;
        mongoUtil.insertMessageJson(results.response, chatuser, session);
        if (results.response == "Stock Information") {
            session.beginDialog('askForSecurityNameCodeId');
        } else if (results.response == "FAQs") {
            session.beginDialog('openFAQPage');
        } else {
            session.beginDialog('askForHelpTopic');
        }
    },
    function (session, results) {
        session.privateConversationData.companyName = results.response;
        mongoUtil.insertMessageJson(results.response, chatuser, session);
        session.beginDialog('showCompanyList');
    },
    function (session, results) {
        session.privateConversationData.fullCompanyName = results.response;
        mongoUtil.insertMessageJson(results.response, chatuser, session);
        session.beginDialog('askForQueryAboutCompany');
    },
    function (session, results) {
        session.privateConversationData.userQuery = results.response;
        mongoUtil.insertMessageJson(results.response, chatuser, session);
        var message = `You are querying about: ${session.privateConversationData.fullCompanyName} <br/>For : ${session.privateConversationData.userQuery}`;
        session.send(message);
        mongoUtil.insertMessageJson(message, chatbot, session);
        setTimeout(() => {
            session.beginDialog('askForAnythingElse');
        }, 3000);
    },
    function (session, results) {
        session.privateConversationData.userQuery = results.response;
        mongoUtil.insertMessageJson(results.response, chatuser, session);
        // Process request
        if (results.response == "Yes") {
            session.beginDialog('askForQueryAboutCompany');
        } else if (results.response == "No") {
            session.send("Ok, Have a nice Day.");
            session.endDialog();
            session.endConversation();
        } else {
            session.send("Bye, Have a nice Day.");
            session.endDialog();
            session.endConversation();
            // session.beginDialog('askForHelpTopic');
        }
    }
]).set('storage', inMemoryStorage) // Register in-memory storage 

// ====DIALOGS====================================================================================
// ===========DIALOGS=============================================================================
// ===================DIALOGS=====================================================================
// ===========================DIALOGS=============================================================


bot.dialog('askForAnythingElse', [
    function (session) {
        var msg = new builder.Message(session);
        var message = "Is there anything else you would like to know ?";
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .text(message)
                .buttons([
                    builder.CardAction.imBack(session, "Yes", "Yes"),
                    builder.CardAction.imBack(session, "No", "No")
                ])
        ]);
        mongoUtil.insertMessageJson(message, chatbot, session);
        builder.Prompts.text(session, msg);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
])


bot.dialog('askForHelpTopic', [
    function (session) {
        var msg = new builder.Message(session);
        var message = "Please select from either of the below options to assist you further.";
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .text(message)
                .buttons([
                    builder.CardAction.imBack(session, "Stock Information", "Stock Information"),
                    builder.CardAction.imBack(session, "FAQs", "FAQs")
                ])
        ]);
        mongoUtil.insertMessageJson(message, chatbot, session);
        builder.Prompts.text(session, msg);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
])

// // Dialog to ask for a date and time
// bot.dialog('askForSelect', [
//     function (session) {
//         var msg = new builder.Message(session);
//         msg.attachmentLayout(builder.AttachmentLayout.carousel)
//         msg.attachments([
//             new builder.HeroCard(session)
//                 .text("Please select from either of the below options to assist you further.")
//                 .buttons([
//                     builder.CardAction.imBack(session, "Stock Information", "Stock Information"),
//                     builder.CardAction.imBack(session, "FAQs", "FAQs")
//                 ])
//         ]);
//         builder.Prompts.text(session, msg);
//     },
//     function (session, results) {
//         session.dialogData.helpTopic = results.response;
//         if (results.response == "Stock Information") {
//             session.beginDialog('askForCompanyName');
//         } else if (results.response == "FAQs") {
//             session.beginDialog('openFAQPage');
//         } else {
//             session.beginDialog('askForSelect');
//         }
//     }
// ]);



// Dialog to askForSecurityNameCodeId
bot.dialog('askForSecurityNameCodeId', [
    function (session) {
        var message = "Please enter the Security Name / Code / ID you wish to know more about.";
        mongoUtil.insertMessageJson(message, chatbot, session);
        builder.Prompts.text(session, message);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);


// Dialog to showCompanyList
bot.dialog('showCompanyList', [
    function (session) {
        var companies = bse.apiForGetCompanyByName(session.privateConversationData.companyName);
        var companiesList = [];
        for (var companyName in companies) {
            var cardAction = builder.CardAction.imBack(session, companies[companyName], companies[companyName])
            companiesList.push(cardAction);
        }
        var msg = new builder.Message(session);
        var message = `There are more than one stocks which start with ${session.privateConversationData.companyName}. Please select the one you wish to know more about.`;
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .text(message)
                .buttons(companiesList)
        ]);
        mongoUtil.insertMessageJson(message, chatbot, session);
        builder.Prompts.text(session, msg);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);


// Dialog to askForQueryAboutCompany
bot.dialog('askForQueryAboutCompany', [
    function (session) {
        var queryTypes = bse.getQueryTypes();
        var queriesList = [];
        for (var queryName in queryTypes) {
            var cardAction = builder.CardAction.imBack(session, queryTypes[queryName], queryTypes[queryName])
            queriesList.push(cardAction);
        }
        var msg = new builder.Message(session);
        var message = "Please select from one of the below options for " + session.privateConversationData.fullCompanyName;
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .text(message)
                .buttons(queriesList)
        ]);
        mongoUtil.insertMessageJson(message, chatbot, session);
        builder.Prompts.text(session, msg);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);


// Dialog to openFAQPage
bot.dialog('openFAQPage', [
    function (session) {
        session.send("Ok I am redirecting you to our FAQ page.");
        session.endDialog();
    }
]);

// Dialog to other
bot.dialog('other', [
    function (session) {
        builder.Prompts.text(session, "Please provide your query.");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);


// ====Global Triggers====================================================================================
// ===========Global Triggers=============================================================================
// ===================Global Triggers=====================================================================
// ===========================Global Triggers=============================================================

// The dialog stack is cleared and this dialog is invoked when the user enters 'help'.
bot.dialog('help', function (session, args, next) {
    session.endDialog("I am a bot and believes in Go With The Flow, and expected the same from your side.");
})
    .triggerAction({
        matches: /^help$/i,
        onSelectAction: (session, args, next) => {
            // Add the help dialog to the dialog stack 
            // (override the default behavior of replacing the stack)
            session.beginDialog(args.action, args);
        }
    });