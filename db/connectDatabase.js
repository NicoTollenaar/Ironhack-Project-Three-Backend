// require("dotenv").config({ path: "./../../.env" });
const mongoDb = require("./../utils/consts");
console.log("mongoDb: ", mongoDb);

const mongoose = require("mongoose");

async function connectDatabase() {
  try {
    console.log("In connectDatabase, logging mongodb :", mongoDb);
    const connection = await mongoose.connect(mongoDb);
    console.log(
      `Connected to ${connection.connections[0]._connectionString}\nhost: ${connection.connections[0].host}\nport: ${connection.connections[0].port}\nname: ${connection.connections[0].name}`
    );
  } catch (err) {
    console.error("Error connecting to mongo: ", err);
  }
}

connectDatabase();
