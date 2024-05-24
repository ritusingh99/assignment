const { MongoClient } = require("mongodb");
const { createClient } = require("redis");
require("dotenv").config();

const mongoUrl = process.env.MONGO_URL;
const redisUrl = process.env.REDIS_URL;
const mongoClient = new MongoClient(mongoUrl);
const redisClient = createClient({ url: redisUrl });

async function processMessage(message) {
  try {
    const data = JSON.parse(message);
    // add the key modified data -- >
    await mongoClient.connect();
    const db = mongoClient.db("mydb");
    const collection = db.collection("processed_data");

    data.modified_at = new Date();

    await collection.insertOne(data);
    console.log("Data saved to processed_data collection");
  } catch (error) {
    console.error("Error processing message:", error);
  } finally {
    await mongoClient.close();
  }
}

async function main() {
  try {
    await redisClient.connect();
    await redisClient.subscribe("data2", (data) => {
      processMessage(data);
    });
    console.log('Listener service subscribed to "data" channel');
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
