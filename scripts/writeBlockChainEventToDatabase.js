require("dotenv").config({ path: "./../../.env" });
const Transaction = require("./../models/Transaction.model");
const Account = require("./../models/Account.model");

async function writeToDatabase(data) {
     
    const { senderAddress, recipientAddress, newBalanceSender,
        newBalanceRecipient, amount, txHash } = data;
    
    try {
      const dbTransaction = await Transaction.findOne({ txHash });
      if (dbTransaction) {
        return;
      }
        const dbUpdatedFromAccount = await Account.findOneAndUpdate(
          { address: senderAddress },
          { balance: newBalanceSender },
          { new: true }
        ).populate("accountholder");
  
        const dbUpdatedRecipientAccount = await Account.findOneAndUpdate(
          { address: recipientAddress },
          { balance: newBalanceRecipient },
          { new: true }
        ).populate("accountholder");
  
        const fromAccountId = dbUpdatedFromAccount._id;
        const toAccountId = dbUpdatedRecipientAccount._id;
        console.log("Write to database, loggin fromAccountId and toAccountId: ", fromAccountId, toAccountId);
  
        const dbNewTransaction = await Transaction.create({
          fromAccountId,
          toAccountId,
          amount,
          txHash,
        });
        return ({
          dbUpdatedFromAccount,
          dbUpdatedRecipientAccount,
          dbNewTransaction: [dbNewTransaction]
        });
        
    } catch (error) {
      console.log(error);
      return res.status(500).json({errorMessage: "Message from server (serverside route): in catch block, something went wrong"});
    }
  }

  module.exports = writeToDatabase;
  