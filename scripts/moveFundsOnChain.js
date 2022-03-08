require("dotenv").config({ path: "./../.env" });
const { ethers } = require("hardhat");
const fs = require("fs");
const { chainAccountContractAddress } = JSON.parse(
  fs.readFileSync("./../config.json")
);

async function moveFundsOnChain(onChainAddress, amount) {
  try {
    //below code works for running on rinkeby with different signer than default signer
    // const alchemyProvider = new ethers.providers.AlchemyProvider(
    //   "rinkeby",
    //   process.env.ALCHEMY_API_KEY
    // );
    // const bankSigner = new ethers.Wallet(
    //   process.env.RINKEBY_PRIVATE_KEY_TWO,
    //   alchemyProvider
    // );

    const accounts = await ethers.provider.listAccounts();
    console.log("Accounts on this network: ", accounts);
    const bankSigner = await ethers.getSigner(0); //using default signer as bank signer
    console.log(`Bank: ${bankSigner.address}`);
    console.log("Depositor address: ", onChainAddress);
    console.log(
      "Contract address (from JSON file): ",
      chainAccountContractAddress
    );

    console.log("\nTransactions being mined, please wait ...");
    const chainAccountContract = await ethers.getContractAt(
      "ChainAccount",
      chainAccountContractAddress
    );

    // when running below code with alchemyProvider on rinkeby connect(bankSigner) to contract

    const name = await chainAccountContract.connect(bankSigner).name();
    const symbol = await chainAccountContract.connect(bankSigner).symbol();
    const decimals = await chainAccountContract.connect(bankSigner).decimals();

    const amountInCents = amount * 10 ** decimals;

    const tx = await chainAccountContract
      .connect(bankSigner)
      .moveFundsOnChain(onChainAddress, amountInCents);
    await tx.wait();

    console.log("tx: ", tx);

    // const txDeleteInternal = await chainAccountContract.deleteInternalBalanceBank(amount);
    // await txDeleteInternal.wait();

    let balanceBank = await chainAccountContract
      .connect(bankSigner)
      .balanceOf(bankSigner.address)
      .then((result) => result.toString())
      .catch((err) => console.log(err));
    let balanceDepositor = await chainAccountContract
      .connect(bankSigner)
      .balanceOf(onChainAddress)
      .then((result) => result.toString())
      .catch((err) => console.log(err));
    //   let totalOutstanding = await chainAccountContract
    //     .totalAmountOnChain()
    //     .then((result) => result.toString())
    //     .catch((err) => console.log(err));

    console.log("Balance bank: ", balanceBank);
    console.log("Balance depositor: ", balanceDepositor);
    //   console.log("Total outstanding: ", totalOutstanding);
    return balanceDepositor / 10 ** decimals;
  } catch (error) {
    console.log("Error in catch block, logging error: ", error);
  }
}

// moveFundsOnChain("0x196da5A01583020a27cfBAdd23b7ea6F21B1675d", 275000)
//   .then(() => process.exit(0))
//   .catch((err) => {
//     console.log(err);
//     process.exit(1);
//   });

module.exports = moveFundsOnChain;
