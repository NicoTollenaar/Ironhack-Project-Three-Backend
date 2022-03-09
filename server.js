require("dotenv").config({ path: "../.env" });
const cors = require("cors");
const express = require("express");
const app = express();
const morgan = require("morgan");
require("./db/connectDatabase");

app.use(
  cors({
    credentials: true,
    origin:
      process.env.ORIGIN || `http://localhost:${process.env.PORT_REACT_APP}`,
  })
);

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.static("./public"));

const authRoutes = require("./routes/authRoutes.js");
app.use("/", authRoutes);

const accountRoutes = require("./routes/accountRoutes");
app.use("/", accountRoutes);

const serverSideEventRoutes = require("./routes/serverSideEventRoutes");
app.use("/", serverSideEventRoutes);

app.listen(process.env.PORT_SERVER, () => {
  console.log(
    `Express server running, listening on PORT ${process.env.PORT_SERVER} ...`
  );
});
