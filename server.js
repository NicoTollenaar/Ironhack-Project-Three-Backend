require("dotenv").config({ path: "./../.env" });
const cors = require("cors");
const express = require("express");
const app = express();
const morgan = require("morgan");
require("./db/connectDatabase");
const PORT = process.env.PORT || 4001;

// app.use(
//   cors({
//     credentials: true,
//     origin:
//       process.env.ORIGIN || "http://localhost:3000",
//   })
// );


app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.static("./public"));

const authRoutes = require("./routes/authRoutes.js");
app.use(
  "/",   
  cors({
    origin: ["https://chainaccount.netlify.app"],
  }), 
  authRoutes
);

const accountRoutes = require("./routes/accountRoutes");
app.use(
  "/",
  cors({
    origin: ["https://chainaccount.netlify.app"],
  }),  
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
