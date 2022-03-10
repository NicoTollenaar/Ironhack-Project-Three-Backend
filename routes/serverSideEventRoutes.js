const router = require("express").Router();
const Transaction = require("./../models/Transaction.model");
const Account = require("./../models/Account.model");
let serverSentEvent = {};
const ETHAddressBank = "0x03F04fDa3B6E6FA1783A5EDB810155e5F4dD5461";

router.get("/events", eventHandler);

async function eventHandler(request, response) {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
  };
  response.writeHead(200, headers);
  serverSentEvent = response;
}

router.post("/blockchain-events", blockchainEventHandler);

async function blockchainEventHandler(req, res, next) {
  const { senderAddress, recipientAddress, amount, txHash } = req.body;
  console.log(
    "In blockchainhandler, logging recipientAddress: ",
    recipientAddress
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
  serverSentEvent.write(`data: ${JSON.stringify(dataObject)}\n\n`);
}

module.exports = router;
