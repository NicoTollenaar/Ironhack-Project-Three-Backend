const { default: axios } = require("axios");
const { ethers } = require("ethers");
const { abi } = require("./../blockchainSources/ChainAccountArtifacts");
const chainAccountContractAddress =
  "0x471184AE3a9632a3a65d846f961b3a4b8A9e416A";
console.log("Websocket listener file executed");

async function main() {
  const webSocketProvider = new ethers.providers.WebSocketProvider(
    "http://localhost:7545"
  );

  const chainAccountContract = new ethers.Contract(
    chainAccountContractAddress,
    abi,
    webSocketProvider
  );

  const event = chainAccountContract.interface.getEvent("Transfer");
  const topic = chainAccountContract.interface.getEventTopic("Transfer");
  //   const log = receipt.logs.find((x) => x.topics.indexOf(topic) >= 0);
  //   const deployedEvent = chainAccountContract.interface.parseLog(log);
  console.log("event: ", event);
  console.log("topic: ", topic);

  const url = "http://localhost:7545";
  const request = {
    jsonrpc: "2.0",
    method: "eth_getLogs",
    params: {
      fromBlock: "latest",
      address: [chainAccountContractAddress],
      topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      ],
    },
  };

  chainAccountContract.on("Transfer", async (sender, recipient, amount) => {
    console.log("Event emitted:");
    console.log("sender: ", sender);
    console.log("recipient: ", recipient);
    console.log("amount: ", amount.toString() / 100);

    const filterArray = chainAccountContract.filters.Transfer(
      sender,
      recipient,
      null
    );

    console.log("Filter array: ", filterArray);

    const response = await axios.post(url, request);
    console.log(
      "response.data from JSON rpc request get_Logs: ",
      response.data
    );
  });

  //   chainAccountContract.on("Transfer", (sender, recipient, amount) => {
  //     console.log(`logging output of "Transfer" listener
  //     on chainContract, sender, recipient and amount: \n${sender}\n${recipient}\n${amount}`);
  //   const filterArray = chainAccountContract.filters.Transfer(
  //     sender,
  //     recipient,
  //     null
  //   );
  //     console.log("Filter array: ", filterArray);
  //   });

  console.log("event: ", event);
  console.log("topic: ", topic);
  //   console.log("log: ", log);
  //   console.log("deployedEvent: ", deployedEvent);
}

main();

//   .then(() => process.exit(0))
//   .catch((err) => {
//     console.log(err);
//     process.exit(1);
//   });

module.exports = main;
