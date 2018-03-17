var MongoClient = require('mongodb').MongoClient;

var _db;
var _collection;

var uri = "mongodb+srv://akshayetw:akshay123@cluster0-ehznp.mongodb.net/test";

module.exports = {

    connectToMongo: function () {
        MongoClient.connect(uri, function (err, client) {
            if (err) throw err;
            _db = client.db("chatbot");
           // _collection = _db.collection("messages");
            console.log("CONNECTED");
        });
    },

    insertMessageJson: function (message, message_from, session) {
    //var db = mongoUtil.getDb();
    //var collection = mongoUtil.getCollection();
    const collection = _db.collection("messages");
    var convId = session.message.address.conversation.id;
    var timestamp = session.message.timestamp;
    var jsonObj = {};
    jsonObj.message_from = message_from;
    jsonObj.message = message;
    jsonObj.created_on = timestamp;
    jsonObj.sentiment = "Positive";
    jsonObj.app_id = 1;
    jsonObj.browserId = "asdasa78a77at7asf7a6sfa67";
    jsonObj.sessionId = convId;
    collection.insertOne(jsonObj, function (err, res) {
        if (res)
            console.log("Inserted ");
        else
            console.log("Error While Inserting ", err);
    });
    },

    getDb: function () {
        return _db;
    },

    getCollection: function () {
        return _collection;
    }
};