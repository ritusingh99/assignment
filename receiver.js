const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const mongoUrl = process.env.MONGO_URL;
const redisUrl = process.env.REDIS_URL;

let mongoClient;
let redisClient;

async function startServer() {
  try {
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    console.log("Connected to MongoDB");

    redisClient = createClient({ url: redisUrl });
    await redisClient.connect();
    console.log("Connected to Redis");

    app.listen(3006, () => {
      console.log("Receiver service listening on port 3006");
    });
  } catch (error) {
    console.error("Error connecting to MongoDB or Redis:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log("Disconnected from MongoDB");
    }
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      console.log("Disconnected from Redis");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error disconnecting from MongoDB or Redis:", error);
    process.exit(1);
  }
});

app.post(
  "/receiver",
  [
    body("user").isString().withMessage("User must be a string"),
    body("class").isString().withMessage("Class must be a string"),
    body("age")
      .isInt({ min: 0 })
      .withMessage("Age must be a non-negative integer"),
    body("email").isEmail().withMessage("Email must be a valid email address"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, class: className, age, email } = req.body;

      const db = mongoClient.db("mydb");
      const collection = db.collection("data2");

      const data = {
        id: uuidv4(),
        user,
        class: className,
        age,
        email,
        inserted_at: new Date(),
      };

      console.log("coming till here");

      await collection.insertOne(data);
      await redisClient.publish("data2", JSON.stringify(data));

      res.status(201).json({ message: "Data saved and published" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// docker build -t ritusingh11/receiver-service:v1 -f Dockerfile.receiver .
// docker push ritusingh11/receiver-service:v1

// docker build -t your-docker-username/listener-service:v1 -f Dockerfile.listener .
// docker push your-docker-username/listener-service:v1

// docker run -d --name receiver-service -p 3006:3006 -e MONGO_URL="mongodb+srv://anshul:anshul012@cluster0.murthvg.mongodb.net/iot?retryWrites=true&w=majority&appName=Cluster0" -e REDIS_URL="redis://localhost:6379" ritusingh11/receiver-service:v1
