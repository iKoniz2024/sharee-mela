const { MongoClient, ServerApiVersion } = require("mongodb");
const { setupIndexes } = require("../utils/setupIndexes");
const { warmUpCache } = require("../utils/cache");

const dbUser = encodeURIComponent(process.env.DB_USER || "");
const dbPass = encodeURIComponent(process.env.DB_PASS || "");

const uri = `mongodb://${dbUser}:${dbPass}@cluster0-shard-00-00.bb41v.mongodb.net:27017,cluster0-shard-00-01.bb41v.mongodb.net:27017,cluster0-shard-00-02.bb41v.mongodb.net:27017/?authSource=admin&replicaSet=atlas-imfz1t-shard-0&tls=true`;

const client = new MongoClient(uri, {
    maxPoolSize: 50,
    minPoolSize: 10,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    },
});

let db;
let connectPromise = null;
let indexesInitialized = false;

async function connectDB() {
    if (db) return db;

    if (!connectPromise) {
        connectPromise = (async () => {
            await client.connect();
            db = client.db("ShareeMelaShop");
            console.log("MongoDB Connected");
            return db;
        })();
    }

    db = await connectPromise;

    if (!indexesInitialized) {
        indexesInitialized = true;
        setupIndexes(db).catch(err => console.error("Index setup error:", err));
        warmUpCache(db).catch(err => console.error("Startup warmup failed:", err));
    }

    return db;
}

function getDB() {
    return db;
}

module.exports = { connectDB, getDB, client };

