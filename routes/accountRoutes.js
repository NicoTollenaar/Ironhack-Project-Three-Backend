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

router.get("/transfer/:accountId", isAuthenticated, async (req, res, next) => {
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

module.exports = router;
