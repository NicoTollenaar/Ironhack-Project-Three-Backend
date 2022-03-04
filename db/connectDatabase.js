require("dotenv").config();
const mongoose = require("mongoose");

// line below somehow not working, temporarily hardcode mongoDb into mongoose.connect(), fix later
const mongoDb = process.env.MONGODB_REMOTE_URL || process.env.MONG0DB_LOCAL_URL;

async function connectDatabase() {
  try {
    console.log("In connectDatabase, logging mongodb :", mongoDb);
    const connection = await mongoose.connect(
      "mongodb://localhost/chainAccount"
    );
    console.log(
      `Connected to ${connection.connections[0]._connectionString}\nhost: ${connection.connections[0].host}\nport: ${connection.connections[0].port}\nname: ${connection.connections[0].name}`
    );
  } catch (err) {
    console.error("Error connecting to mongo: ", err);
  }
}

connectDatabase();
