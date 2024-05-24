# Microservice System with PubSub Architecture

This project demonstrates a microservice system with PubSub architecture using Express.js, MongoDB Atlas, and Redis.

## Prerequisites

Before running the services, ensure that you have the following:

- Node.js installed on your machine
- MongoDB Atlas account and connection URL
- Redis server running on your machine or accessible via URL

## Getting Started

1. Clone the repository:
git clone <repository-url>


3. Create a `.env` file 
MONGO_URL=<your-mongodb-atlas-url>
REDIS_URL=<your-redis-url> || redis://localhost:6379
Copy codeReplace `<your-mongodb-atlas-url>` with your actual MongoDB Atlas connection URL and `<your-redis-url>` with the URL of your Redis server.

4. Start the Redis server if it's not already running.

5. Run the receiver service:
node receiver.js

6. Run the listener service:
node listener.js

The receiver service will be running on `http://localhost:3006`, and the listener service will be subscribed to the `data` channel in Redis.

## Usage

To test the microservice system:

1. Send a POST request to `http://localhost:3006/receiver` with the following JSON payload:
```json
{
  "user": "John Doe",
  "class": "Mathematics",
  "age": 25,
  "email": "john@example.com"
}

The receiver service will save the data to MongoDB Atlas and publish it to the data channel in Redis.
The listener service will receive the data from the data channel, process it, and save the modified data to the processed_data collection in MongoDB Atlas.
You can check the MongoDB Atlas collections to verify that the data has been saved and processed correctly.

