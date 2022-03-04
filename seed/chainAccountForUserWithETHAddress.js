require("../db/connectDatabase");
const mongoose = require("mongoose");
const Accountholder = require("../models/Accountholder.model");
const Account = require("../models/Account.model");

async function createNewOnChainAccount(firstNameAccountholder, ETHAddress) {
  try {
    const dbAccountholder = await Accountholder.findOne({
      name: firstNameAccountholder,
    });
    const dbNewAccount = await Account.create({
      address: ETHAddress,
      accountType: "on-chain",
      accountholder: dbAccountholder._id,
    });
    // const dbUpdatedAccountholder = await Accountholder.findByIdAndUpdate(
    //   dbAccountholder._id,
    //   { onChainAccount: dbNewAccount._id },
    //   { new: true }
    // ).populate("onChainAccount");
    // console.log("Done!");
    // console.log("Accountholder with new on-chain account is:");
    // console.log(dbUpdatedAccountholder);
    mongoose.connection.close();
    return dbNewAccount;
  } catch (error) {
    console.log(error);
  }
}

module.exports = createNewOnChainAccount;

// createNewOnChainAccount(process.argv[2], process.argv[3]);
