require("dotenv").config({ path: "./../../.env" });
const router = require("express").Router();
const Transaction = require("./../models/Transaction.model");
const Account = require("./../models/Account.model");
const { ETHAddressBank } = require("./../utils/constants");
let serverSentEvent = {};

router.get("/events", eventHandler);

function eventHandler(request, response, next) {
  serverSentEvent = response;
  const headers = {
    "Content-Type": "text/event-stream",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": process.env.ORIGIN || "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
  };
  response.writeHead(200, headers);
}

router.post("/blockchain-events", blockchainEventHandler);

async function blockchainEventHandler(req, res, next) {
  const start = Date.now();
  console.log("In blockchain event handlder, logging start time:  lapsed: ", start);

  const { senderAddress, recipientAddress, amount, txHash } = req.body;
  
  try {
    const dbTransaction = await Transaction.findOne({ txHash });
    if (
      dbTransaction ||
      recipientAddress === ETHAddressBank ||
      senderAddress === ETHAddressBank
    ) {
      res.json(req.body);
      return;
    } else if (
      !dbTransaction &&
      recipientAddress !== ETHAddressBank &&
      senderAddress !== ETHAddressBank
    ) {
      const dbUpdatedFromAccount = await Account.findOneAndUpdate(
        { address: senderAddress },
        { $inc: { balance: -amount } },
        { new: true }
      ).populate("accountholder");

      const dbUpdatedRecipientAccount = await Account.findOneAndUpdate(
        { address: recipientAddress },
        { $inc: { balance: amount } },
        { new: true }
      ).populate("accountholder");

      console.log(
        "In serversideroute, logging dbUpdatedRecipientAccount and dbUpdatedFromAccount",
        dbUpdatedRecipientAccount,
        dbUpdatedFromAccount
      );

      const fromAccountId = dbUpdatedFromAccount.accountholder;
      const toAccountId = dbUpdatedRecipientAccount.accountholder;

      const dbNewTransaction = await Transaction.create({
        fromAccountId,
        toAccountId,
        amount,
        txHash,
      });
      res.json({ dbUpdatedFromAccount, dbNewTransaction });
      return sendToClient({
        dbUpdatedFromAccount,
        dbUpdatedRecipientAccount,
        dbNewTransaction,
      });
      console.log("In blockchain event handlder, logging time lapsed: ", Date.now() - start);
    }
  } catch (error) {
    console.log(error);
  }
}

function sendToClient(dataObject) {
  return serverSentEvent.write(`data: ${JSON.stringify(dataObject)}\n\n`);
}

function setHeaders(request, response, next) {

  response.header("Content-Type", "text/event-stream");
  response.header("Connection", "keep-alive");
  response.header("Cache-Control", "no-cache");
  response.header("Access-Control-Allow-Origin", process.env.ORIGIN || "http://localhost:3000");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}

module.exports = router;