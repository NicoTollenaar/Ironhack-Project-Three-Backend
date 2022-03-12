require("dotenv").config({ path: "./../../.env" });
const router = require("express").Router();
const Transaction = require("./../models/Transaction.model");
const Account = require("./../models/Account.model");
const { ETHAddressBank } = require("./../utils/constants");
let serverSentEvent = {};

router.get("/events", setHeaders, eventHandler);

function eventHandler(request, response, next) {

  response.header("Access-Control-Allow-Origin", process.env.ORIGIN || "http://localhost:3000");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  const headers = {
    "Content-Type": "text/event-stream",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": process.env.ORIGIN || "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
  };
  response.writeHead(200, headers);
  console.log("EVENT HANDLER CALLED, response.getHeaders(): ", response.getHeaders());
  serverSentEvent = response;
}

function setHeaders (request, response, next) {
  response.header("Access-Control-Allow-Origin", process.env.ORIGIN || "http://localhost:3000");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  const headers = {
    "Content-Type": "text/event-stream",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": process.env.ORIGIN || "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
  };
  response.writeHead(200, headers);
  console.log("MIDDLEWARE SETHEADERS, response.getHeaders(): ", response.getHeaders());
  next();
}

router.post("/blockchain-events", blockchainEventHandler);

async function blockchainEventHandler(req, res, next) {
  const { senderAddress, recipientAddress, amount, txHash } = req.body;
  console.log(
    "In blockchainhandler, logging recipientAddress: req.body :",
    req.body
  );
  console.log(
    "In blockchainhandler, logging ETHAddressBank: ",
    ETHAddressBank, (recipientAddress === ETHAddressBank)
  );
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
      await res.json({ dbUpdatedFromAccount, dbNewTransaction });
      return sendToClient({
        dbUpdatedFromAccount,
        dbUpdatedRecipientAccount,
        dbNewTransaction,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

function sendToClient(dataObject) {
  console.log("in SEND TO CLIENT, logging serverSentEvent.getHeaders(): ", serverSentEvent.getHeaders());
  serverSentEvent.write(`data: ${JSON.stringify(dataObject)}\n\n`);
}

module.exports = router;
