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

const authRoutes = require("./routes/authRoutes.js");
app.use("/", authRoutes);

const accountRoutes = require("./routes/accountRoutes");
app.use("/", accountRoutes);

app.get("/events", eventHandler);

let serverSentResponse = {};

async function eventHandler(request, response) {
  const headers = {
    "Content-Type": "text/event-stream",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
  };
  response.writeHead(200, headers);
  serverSentResponse = response;
}

// const blockchainEventHandler = require("./sse/blockchainEventHandler");
app.post("/blockchain-events", blockchainEventHandler);

async function blockchainEventHandler(req, res, next) {
  console.log("In blockchainEventHandler, logging req.body: ", req.body);
  await res.json(req.body);
  return sendToClient(req.body);
}

function sendToClient(object) {
  serverSentResponse.write(`data: ${JSON.stringify(object)}\n\n`);
}

app.listen(process.env.PORT_SERVER, () => {
  console.log(
    `Express server running, listening on PORT ${process.env.PORT_SERVER} ...`
  );
});
