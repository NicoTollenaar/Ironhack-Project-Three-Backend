require("dotenv").config({ path: "./../.env" });
const { ethers } = require("ethers");
const fs = require("fs");
const { abi } = require("./../blockchainSources/ChainAccountArtifacts");
const {
  chainAccountContractAddress,
  network,
  providerUrl,
  privateKeyBank,
} = require("../utils/constants");

async function moveFundsOnChain(onChainAddress, amount) {

  let provider;

  if (network === "rinkeby") {
    provider = new ethers.providers.AlchemyProvider(
      network,
      process.env.ALCHEMY_API_KEY
    );
  } else if (network === "ganache") {
    provider = ethers.getDefaultProvider(providerUrl);
  } else {
    throw new Error("Network undefined, could not establish a provider");
  }

  console.log("In move funds on chain, logging network and providerUrl: ", network, providerUrl);
  console.log("In move funds on chain, logging provider: ", provider);

  const bankSigner = new ethers.Wallet(privateKeyBank, provider);

  console.log("In move funds on chain, logging bankSigner: ", bankSigner);


  try {
    const accounts = await provider.listAccounts();
    // const bankSigner = provider.getSigner(0); //using default signer as bank signer

  console.log("In move funds on chain, logging accounts: ", accounts);


    console.log("\nTransactions being mined, please wait ...");
    const chainAccountContract = new ethers.Contract(
      chainAccountContractAddress,
      abi,
      provider
    );

  console.log("In move funds on chain, logging chainAccountContract: ", chainAccountContract);


    const name = await chainAccountContract.connect(bankSigner).name();
    const symbol = await chainAccountContract.connect(bankSigner).symbol();
    const decimals = await chainAccountContract.connect(bankSigner).decimals();

    const amountInCents = amount * 10 ** decimals;

    const tx = await chainAccountContract
      .connect(bankSigner)
      .moveFundsOnChain(onChainAddress, amountInCents);
    await tx.wait();

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

    return {
      newOnChainBalance: balanceDepositor / 10 ** decimals,
      txHash: tx.hash,
    };
  } catch (error) {
    console.log("Error in catch block, logging error: ", error);
  }
}

module.exports = moveFundsOnChain;

// Alternatives to remember:

//below code works for running on rinkeby with different signer than default signer
// const alchemyProvider = new ethers.providers.AlchemyProvider(
//   "rinkeby",
//   process.env.ALCHEMY_API_KEY
// );
// const bankSigner = new ethers.Wallet(
//   process.env.RINKEBY_PRIVATE_KEY_TWO,
//   alchemyProvider
// );

// moveFundsOnChain("0x196da5A01583020a27cfBAdd23b7ea6F21B1675d", 275000)
//   .then(() => process.exit(0))
//   .catch((err) => {
//     console.log(err);
//     process.exit(1);
//   });

//   let totalOutstanding = await chainAccountContract
//     .totalAmountOnChain()
//     .then((result) => result.toString())
//     .catch((err) => console.log(err));

// const txDeleteInternal = await chainAccountContract.deleteInternalBalanceBank(amount);
// await txDeleteInternal.wait();
