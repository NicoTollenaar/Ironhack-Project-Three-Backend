const router = require("express").Router();
const Accountholder = require("../models/Accountholder.model");
const Account = require("../models/Account.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const moveFundsOnChain = require("./../../scripts/moveFundsOnChain");

router.post("/accounts", isAuthenticated, async (req, res, next) => {
  try {
    const name = req.body.query;
    const dbUser = await Accountholder.findOne({ firstName: name })
      .populate("offChainAccount")
      .populate("onChainAccount");
    if (dbUser) {
      res.json(dbUser);
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Message from server: something went wrong" });
  }
});

router.post(
  "/transfer/from-off-chain-account",
  isAuthenticated,
  async (req, res, next) => {
    let dbAccountRecipientBeforeTransfer, dbUpdatedRecipientAccount;
    try {
      const {
        fromAccountId,
        transferAmount,
        recipientAccountType,
        recipientAccountAddress,
      } = req.body;
      if (
        !fromAccountId ||
        !transferAmount ||
        !recipientAccountType ||
        !recipientAccountAddress
      ) {
        return res.status(400).json({
          errorMessage: "Failure notice from server: all fields required",
        });
      }
      const dbFromAccount = await Account.findById(fromAccountId);
      if (transferAmount > dbFromAccount.balance) {
        return res
          .status(400)
          .json({ errorMessage: "Blocked by server: insufficient funds!" });
      }

      if (recipientAccountType === "on-chain") {
        dbAccountRecipientBeforeTransfer = await Account.findOne({
          address: recipientAccountAddress,
        });
        newBalanceRecipient = await moveFundsOnChain(
          recipientAccountAddress,
          transferAmount
        );

        console.log(
          "In transfer route, logging newBalanceRecipient: ",
          newBalanceRecipient
        );
        console.log(
          "In transfer route, logging dbAccountRecipientBeforeTransfer.balance (and plus transferamount): ",
          dbAccountRecipientBeforeTransfer.balance,
          transferAmount,
          Number(dbAccountRecipientBeforeTransfer.balance) + transferAmount
        );

        if (
          Number(dbAccountRecipientBeforeTransfer.balance) +
            Number(transferAmount) ===
          newBalanceRecipient
        ) {
          dbUpdatedRecipientAccount = await Account.findOneAndUpdate(
            { address: recipientAccountAddress },
            { balance: newBalanceRecipient },
            { new: true }
          );
        } else {
          throw new Error(
            "Error message from server: blockchain and database out of sync"
          );
        }
      } else {
        dbUpdatedRecipientAccount = await Account.findOneAndUpdate(
          { address: recipientAccountAddress },
          { $inc: { balance: transferAmount } },
          { new: true }
        );
      }

      const dbUpdatedFromAccount = await Account.findByIdAndUpdate(
        fromAccountId,
        { $inc: { balance: -transferAmount } },
        { new: true }
      );

      if (dbUpdatedFromAccount && dbUpdatedRecipientAccount) {
        res.json(dbUpdatedFromAccount);
      } else {
        throw new Error("Updating accounts failed, transfer reverted");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errorMessage:
          "Message from server: something went wrong, transfer failed",
      });
    }
  }
);

router.post(
  "/transfer/from-on-chain-account",
  isAuthenticated,
  async (req, res, next) => {
    console.log("Arrived in transfer/from-on-chain-account");
    let dbAccountRecipientBeforeTransfer,
      dbUpdatedRecipientAccount,
      dbUpdatedFromAccount;
    try {
      const {
        fromAccountId,
        transferAmount,
        recipientAccountType,
        recipientAccountAddress,
        newBalanceTransferorFrontend,
        newBalanceRecipientFrontend,
      } = req.body;
      if (
        !fromAccountId ||
        !transferAmount ||
        !recipientAccountType ||
        !recipientAccountAddress ||
        newBalanceTransferorFrontend === undefined ||
        newBalanceRecipientFrontend === undefined
      ) {
        return res.status(400).json({
          errorMessage: "Failure notice from server: all fields required",
        });
      }
      const dbFromAccount = await Account.findById(fromAccountId);
      if (transferAmount > dbFromAccount.balance) {
        return res
          .status(400)
          .json({ errorMessage: "Blocked by server: insufficient funds!" });
      }

      console.log("In transfer from on-chain route, logging:");
      console.log(
        "newBalanceTransferorFrontend:",
        newBalanceTransferorFrontend
      );
      console.log("dbFromAccount.balance:", dbFromAccount.balance);
      console.log("Number(transferAmount):", Number(transferAmount));
      console.log(
        "Number(dbFromAccount.balance) - Number(transferAmount):",
        Number(dbFromAccount.balance) - Number(transferAmount)
      );

      if (
        newBalanceTransferorFrontend ===
        Number(dbFromAccount.balance) - Number(transferAmount)
      ) {
        dbUpdatedFromAccount = await Account.findByIdAndUpdate(
          fromAccountId,
          {
            balance: newBalanceTransferorFrontend,
          },
          { new: true }
        );
      } else {
        console.log(
          "In THIS transfer from on-chain route, error: database and blockchain not in sync"
        );
        return res.status(500).json({
          errorMessage:
            "In transfer from on-chain route, error: database and blockchain not in sync",
        });
      }

      if (recipientAccountType === "on-chain") {
        dbAccountRecipientBeforeTransfer = await Account.findOne({
          address: recipientAccountAddress,
        });

        console.log(
          "In transfer route, logging dbAccountRecipientBeforeTransfer.balance (and plus transferamount): ",
          dbAccountRecipientBeforeTransfer.balance,
          transferAmount,
          Number(dbAccountRecipientBeforeTransfer.balance) +
            Number(transferAmount)
        );

        if (
          Number(dbAccountRecipientBeforeTransfer.balance) +
            Number(transferAmount) ===
          newBalanceRecipientFrontend
        ) {
          dbUpdatedRecipientAccount = await Account.findOneAndUpdate(
            { address: recipientAccountAddress },
            { balance: newBalanceRecipientFrontend },
            { new: true }
          );
        } else {
          throw new Error(
            "Error message from server: blockchain and database out of sync"
          );
        }
      } else {
        dbUpdatedRecipientAccount = await Account.findOneAndUpdate(
          { address: recipientAccountAddress },
          { $inc: { balance: transferAmount } },
          { new: true }
        );
      }

      if (dbUpdatedFromAccount && dbUpdatedRecipientAccount) {
        res.json(dbUpdatedFromAccount);
      } else {
        throw new Error("Updating accounts failed, transfer reverted");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errorMessage:
          "Message from server: something went wrong, transfer failed",
      });
    }
  }
);

router.post("/move-on-chain", isAuthenticated, async (req, res, next) => {
  console.log("Just arrived in move-ON-chain route, passed middleware");

  let dbUpdatedFromAccount;
  let dbUpdatedRecipientAccount;
  try {
    const {
      fromAccountId,
      transferAmount,
      recipientAccountType,
      recipientAccountAddress,
    } = req.body;
    if (
      !fromAccountId ||
      !transferAmount ||
      !recipientAccountType ||
      !recipientAccountAddress
    ) {
      console.log("Error in move-ON-chain route: inadequate info");
      return res.status(400).json({
        errorMessage: "Failure notice from server: inadequate information",
      });
    }

    const dbFromAccountBeforeTransfer = await Account.findById(fromAccountId);
    if (transferAmount > dbFromAccountBeforeTransfer.balance) {
      console.log("Error in move-ON-chain route: inadequate funds");
      return res
        .status(500)
        .json({ errorMessage: "Blocked by server: insufficient funds!" });
    }

    dbRecipientAccountBeforeTransfer = await Account.findOne({
      address: recipientAccountAddress,
    });

    const newOnChainBalance = await moveFundsOnChain(
      recipientAccountAddress,
      transferAmount
    );

    console.log("In move-On-chain route, logging following balances:");
    console.log(
      "In move-On-chain route, logging newOnChainBalance: ",
      newOnChainBalance
    );
    console.log(
      "In move-On-chain route, logging dbRecipientAccountBeforeTransfer.balance (and plus transferamount): ",
      dbRecipientAccountBeforeTransfer.balance,
      transferAmount,
      Number(dbRecipientAccountBeforeTransfer.balance + transferAmount)
    );

    if (
      Number(dbRecipientAccountBeforeTransfer.balance + transferAmount) !==
      newOnChainBalance
    ) {
      console.log(
        "Error in move-ON-chain route: blockchain and database out of sync"
      );
      return res.status(400).json({
        errorMessage:
          "Failure notice from server: blockchain and database out of sync",
      });
    }

    dbUpdatedFromAccount = await Account.findByIdAndUpdate(
      fromAccountId,
      { $inc: { balance: -transferAmount } },
      { new: true }
    );
    dbUpdatedRecipientAccount = await Account.findOneAndUpdate(
      { address: recipientAccountAddress },
      { balance: newOnChainBalance },
      { new: true }
    );
    if (dbUpdatedFromAccount && dbUpdatedRecipientAccount) {
      res.json({ dbUpdatedFromAccount, dbUpdatedRecipientAccount });
    } else {
      console.log("Error in move-ON-chain route: updating database failed");
      throw new Error("Server error: updating accounts failed");
    }
  } catch (error) {
    console.log(
      "Error in move-ON-chain route, catch block, logging error: ",
      error
    );
    res.status(500).json({
      errorMessage:
        "Message from server: something went wrong, transfer failed",
    });
  }
});

router.post("/move-off-chain", isAuthenticated, async (req, res, next) => {
  console.log("Just arrived in move-off-chain route, passed middleware");
  let dbUpdatedFromAccount;
  let dbUpdatedRecipientAccount;
  try {
    const {
      fromAccountId,
      newFromAccountBalance,
      transferAmount,
      recipientAccountType,
      recipientAccountAddress,
    } = req.body;

    console.log("In move-off-chain route, logging req.body: ", req.body);
    console.log(
      "In move-off-chain route, logging properties req.body: ",
      fromAccountId,
      newFromAccountBalance,
      transferAmount,
      recipientAccountType,
      recipientAccountAddress
    );

    if (
      !fromAccountId ||
      newFromAccountBalance === undefined ||
      transferAmount === undefined ||
      !recipientAccountType ||
      !recipientAccountAddress
    ) {
      console.log("Error in move-off chain route: inadequate info");
      return res.status(400).json({
        errorMessage: "Failure notice from server: inadequate information",
      });
    }
    const dbFromAccountBeforeTransfer = await Account.findById(fromAccountId);
    if (transferAmount > dbFromAccountBeforeTransfer.balance) {
      console.log("Error in move-off chain route: inadequate funds");
      return res
        .status(500)
        .json({ errorMessage: "Blocked by server: insufficient funds!" });
    }

    if (
      dbFromAccountBeforeTransfer.balance - transferAmount !==
      newFromAccountBalance
    ) {
      console.log("Error in move-off chain route: out of sync");
      return res
        .status(400)
        .json({ errorMessage: "Error: blockchain and database out of sync!" });
    }
    dbUpdatedFromAccount = await Account.findByIdAndUpdate(
      fromAccountId,
      { balance: newFromAccountBalance },
      { new: true }
    );
    dbUpdatedRecipientAccount = await Account.findOneAndUpdate(
      { address: recipientAccountAddress },
      { $inc: { balance: transferAmount } },
      { new: true }
    );
    const dbUpdatedAccountholder = await Accountholder.find({
      $or: [
        { offChainAccount: fromAccountId },
        { onChainAccount: fromAccountId },
      ],
    })
      .populate("offChainAccount")
      .populate("onChainAccount");
    if (
      dbUpdatedFromAccount &&
      dbUpdatedRecipientAccount &&
      dbUpdatedAccountholder
    ) {
      res.json({ dbUpdatedFromAccount, dbUpdatedRecipientAccount });
    } else {
      console.log(
        "Error in move-off chain route: something went wrong with database operations"
      );
      throw new Error(
        "Server error: updating accounts failed or balances not in sync"
      );
    }
  } catch (error) {
    console.log(
      "In move off chain route, in catch block, logging error: ",
      error
    );
    res.status(500).json({
      errorMessage:
        "Message from server: something went wrong, transfer failed",
    });
  }
});

module.exports = router;
