require("dotenv").config({ path: "../.env" });
const cors = require("cors");
const express = require("express");
const app = express();
const morgan = require("morgan");
require("./db/connectDatabase");
// require("./scripts/WebsocketEventListener");

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

app.get("/", (req, res, next) => {
  res.json({ message: "this will be the entry page for demo users" });
});

app.get("/", (req, res) => {
  res.send("All good here!");
});

const authRoutes = require("./routes/authRoutes.js");
app.use("/", authRoutes);

const accountRoutes = require("./routes/accountRoutes");
app.use("/", accountRoutes);

app.listen(process.env.PORT_SERVER, () => {
  console.log(
    `Express server running, listening on PORT ${process.env.PORT_SERVER} ...`
  );
});
