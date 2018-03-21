var MongoClient = require('mongodb').MongoClient;

var _db;
var _db_bsedata;
var _collection;
// For Storing Security details
var _scripsNamesDB;
var _scripsCodesDB;
var _scripsIDsDB;

var uri = "mongodb+srv://akshayetw:akshay123@cluster0-ehznp.mongodb.net/test";

module.exports = {

    connectToMongo: function (isConnect) {
        MongoClient.connect(uri, function (err, client) {
            if (err) throw err;
            _db = client.db("chatbot");
            _collection = _db.collection("messages");
            if (isConnect) {
                console.log("CONNECTED");
                _db_bsedata = client.db("bsedata");
                console.log("CONNECTED BSE DATA");
                isConnect();
            }
        });
    },

    insertMessageJson: function (message, message_from, session) {
        var collection;
        if (_db) {
            collection = _db.collection("messages");
        } else {
            console.log("MONGO-UTIL EXCEPTION : DB UNDEFINED.");
        }

        var convId = session.message.address.conversation.id;
        var timestamp = session.message.timestamp;
        var jsonObj = {};
        jsonObj.message_from = message_from;
        jsonObj.message = message;
        jsonObj.created_on = timestamp;
        jsonObj.sessionId = convId;
        // if (collection) {
        //     collection.insertOne(jsonObj, function (err, res) {
        //         if (res)
        //             console.log("Inserted ");
        //         else
        //             console.log("Error While Inserting ", err);
        //     });
        // } else {
        //     console.log("MONGO-UTIL EXCEPTION : COLLECTION UNDEFINED.");
        // }

    },

    getScrips: function (scripIdNameEtc, callback) {
        console.log("User Query :: " + scripIdNameEtc);
        var resultObj = [];
        var collection;
        //Creating query
        var query = {};
        query = getQueryObj(scripIdNameEtc);
        console.log("QUERY : " + JSON.stringify(query));
        if (_db_bsedata) {
            collection = _db_bsedata.collection("scrips");
        } else {
            console.log("MONGO-UTIL EXCEPTION : DB UNDEFINED.");
        }
        if (collection) {
            var filterObj = {};
            filterObj._id = 0;
            filterObj.ScripID = 1;
            collection.find(query, { _id: 0, ScripName: 1 }).toArray(function (err, result) {
                if (err) {
                    console.log("ERROR : ", err);
                    return;
                }
                else {
                    console.log("result : ", result);
                    for (var i in result) {
                        resultObj.push(result[i].ScripName);
                    }
                    callback(resultObj);
                    console.log("RESULT : ", resultObj);
                }
            });
        } else {
            console.log("MONGO-UTIL EXCEPTION : COLLECTION UNDEFINED.");
        }
    },

    getScripsData: function () {
        console.log("Fetching Scrips Names");
        var query = {};
        var scripNamesDB = [];
        var scripCodesDB = [];
        var scripIdsDB = [];
        if (_db_bsedata) {
            collection = _db_bsedata.collection("scrips");
        } else {
            console.log("MONGO-UTIL EXCEPTION : DB UNDEFINED.");
        }
        if (collection) {
            var filterObj = {};
            filterObj._id = 0;
            filterObj.ScripID = 1;
            collection.find(query, { _id: 0, ScripName: 1 }).toArray(function (err, result) {
                if (err) {
                    console.log("ERROR : ", err);
                    return;
                }
                else {
                    for (var i in result) {
                        scripNamesDB.push(result[i].ScripName);
                        scripCodesDB.push(result[i].ScripCode);
                        scripIdsDB.push(result[i].ScripID);
                    }
                    // _scripsNamesDB = [];
                    // _scripsIDsDB = [];
                    // _scripsCodesDB = [];
                    _scripsNamesDB = scripNamesDB;
                    _scripsIDsDB = scripIdsDB;
                    _scripsCodesDB = scripCodesDB;
                    //  console.log(_scripsDB);
                }
            });
        } else {
            console.log("MONGO-UTIL EXCEPTION : COLLECTION UNDEFINED.");
        }
    },

    scripNamesDB: function () {
        return _scripsNamesDB;
    },

    scripCodesDB: function () {
        return _scripsCodesDB;
    },

    scripIDsDB: function () {
        return _scripsIDsDB;
    },

    getDb: function () {
        return _db;
    },

    getCollection: function () {
        return _collection;
    }
};


function getQueryObj(scripIdNameEtc) {
    var query = {};
    var queryInList = {};
    // var likeArray = [];
    // for (var q in scripIdNameEtc) {
    //     var value = "^" + scripIdNameEtc[q];
    //     //var regEx = /^value/;
    //     var regEx = new RegExp(value);
    //     likeArray.push(regEx);
    //     queryInList.$in = likeArray;
    // }
    queryInList.$in = scripIdNameEtc;
    var queryScripID = {};
    queryScripID.ScripID = queryInList;
    var queryScripCode = {};
    queryScripCode.ScripCode = queryInList;
    var queryScripName = {};
    queryScripName.ScripName = queryInList;
    var queryOr = [];
    queryOr.push(queryScripID);
    queryOr.push(queryScripCode);
    queryOr.push(queryScripName);
    query.$or = queryOr;
    return query;
}