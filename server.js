require("dotenv").config({ path: "./../.env" });
const cors = require("cors");
const express = require("express");
const app = express();
const morgan = require("morgan");
require("./db/connectDatabase");
const PORT = process.env.PORT || 4001;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
next();
});


app.use(
  cors({
    credentials: true,
    origin:
      process.env.ORIGIN || "http://localhost:3000",
    allowheaders: ["Origin, X-Requested-With, Content-Type, Accept", "Authorization" ],
  })
);

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.static("./public"));

const authRoutes = require("./routes/authRoutes.js");
app.use(
  "/", 
  authRoutes
);

const accountRoutes = require("./routes/accountRoutes");
app.use(
  "/",
  accountRoutes);

const serverSideEventRoutes = require("./routes/serverSideEventRoutes");
app.use("/", serverSideEventRoutes);

app.listen(PORT, (err) => {
  console.log(
    `Express server running, listening on PORT ${PORT} ...`
  );
  if (err) { 
    console.log("ERROR IN EXPRESS SERVER");
    throw err;
  }
});
