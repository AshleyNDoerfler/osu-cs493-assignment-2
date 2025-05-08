const { MongoClient, ObjectID } = require('mongodb')
require('dotenv').config();


const mongoHost = process.env.MONGO_HOST || "localhost";
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER || "suser"
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME || "storedb";

const mongoURL =
  `mongodb://${mongoUser}:${mongoPassword}@` +
  `${mongoHost}:${mongoPort}/${mongoDBName}`;

let db;
  
async function connect_to_DB(){
    const client = new MongoClient(mongoURL);
    await client.connect();
    db = client.db(mongoDBName);
}

function getDB(){
    if(!db){
        throw new Error("There is no database connected");
    }
    else{
        return db;
    }
}

function getCollection(name){
    return getDB().collection(name);
}

module.exports = {
    ObjectID,
    connect_to_DB,
    getDB,
    getCollection
};