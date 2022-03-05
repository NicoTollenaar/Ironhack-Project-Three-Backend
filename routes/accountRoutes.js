const router = require("express").Router();
const Accountholder = require("../models/Accountholder.model");
const Account = require("../models/Account.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.post("/accounts", isAuthenticated, async (req, res, next) => {
  try {
    const name = req.body.query;
    console.log(
      "in account route post name, logging name (req.body.query) :",
      name
    );
    const dbUser = await Accountholder.findOne({ firstName: name })
      .populate("offChainAccount")
      .populate("onChainAccount");
    console.log("In accountroute, logging dbUser :", dbUser);
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

router.post("/transfer", isAuthenticated, async (req, res, next) => {
  try {
    const {
      fromAccountId,
      transferAmount,
      recipientAccountType,
      recipientAccountAddress,
    } = req.body;
    console.log("in account route post name, logging req.body:", req.body);
    const dbFromAccount = await Account.findById(fromAccountId);
    if (transferAmount > dbFromAccount.balance) {
      return res
        .status(400)
        .json({ errorMessage: "Blocked by server: insufficient funds!" });
    }
    const dbUpdatedFromAccount = await Account.findByIdAndUpdate(
      fromAccountId,
      { $inc: { balance: -transferAmount } },
      { new: true }
    );
    const dbUpdatedRecipientAccount = await Account.findOneAndUpdate(
      { address: recipientAccountAddress },
      { $inc: { balance: transferAmount } },
      { new: true }
    );
    console.log(
      "In accountroute transfer logging updated account:",
      dbUpdatedFromAccount,
      dbUpdatedRecipientAccount
    );
    if (dbUpdatedFromAccount && dbUpdatedRecipientAccount) {
      res.json({
        newFromAccount: dbUpdatedFromAccount,
        newRecipientAccount: dbUpdatedRecipientAccount,
      });
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
});

module.exports = router;
