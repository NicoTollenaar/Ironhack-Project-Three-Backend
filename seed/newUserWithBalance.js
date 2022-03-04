require("../db/connectDatabase");
const mongoose = require("mongoose");
const Accountholder = require("../models/Accountholder.model");
const Account = require("../models/Account.model");
const { faker } = require("@faker-js/faker");
const createNewOnChainAccount = require("./chainAccountForUserWithETHAddress");

async function createNewUserWithBalance(
  fakeName,
  fakeOffChainBalance,
  ETHAddress
) {
  try {
    const dbNewAccountholder = await Accountholder.create({
      firstName: fakeName,
    });
    const fakeIBANNumber = faker.finance.iban(true);
    console.log("In generate new user, logging fake IBAN :", fakeIBANNumber);
    // const newBankAccountNumber = await getNewBankAccountNumber();
    const dbOffChainAccountNewUser = await Account.create({
      accountholder: dbNewAccountholder._id,
      accountType: "off-chain",
      address: fakeIBANNumber,
      balance: fakeOffChainBalance,
    });
    const dbOnChainAccountNewUser = await Account.create({
      accountholder: dbNewAccountholder._id,
      accountType: "on-chain",
      address: ETHAddress,
      balance: 0,
    });
    const dbUpdatedNewUser = await Accountholder.findByIdAndUpdate(
      dbNewAccountholder._id,
      {
        offChainAccount: dbOffChainAccountNewUser._id,
        onChainAccount: dbOnChainAccountNewUser._id,
      },
      { new: true }
    )
      .populate("offChainAccount")
      .populate("onChainAccount");
    console.log("Done!");
    console.log("New Accountholder with off-chain account is: ");
    console.log(dbUpdatedNewUser);
    mongoose.connection.close();
  } catch (error) {
    console.log(error);
  }
}

//fakerjs used instead

// async function getNewBankAccountNumber() {
//   try {
//     const dbAccount = await OffChainAccount.findOne().sort({ number: -1 });
//     console.log("dbAccount: ", dbAccount);
//     if (dbAccount) {
//       return Number(dbAccount.number) + 1;
//     } else {
//       return 1;
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

createNewUserWithBalance(process.argv[2], process.argv[3], process.argv[4]);
