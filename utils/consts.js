require("dotenv").config({ path: "./../../.env" });

const mongoDb =
  process.env.MONG0DB_REMOTE_URI || "mongodb://localhost/chainAccount";

module.exports = mongoDb;
