const { default: axios } = require("axios");
const { ethers } = require("ethers");
const { abi } = require("./../blockchainSources/ChainAccountArtifacts");
const chainAccountContractAddress =
  "0x471184AE3a9632a3a65d846f961b3a4b8A9e416A";
console.log(
  "Websocket provider running, listening for events on blockchain ..."
);

async function main() {
  const ganacheUrl = "http://localhost:7545";
  const webSocketProvider = new ethers.providers.WebSocketProvider(ganacheUrl);

  const chainAccountContract = new ethers.Contract(
    chainAccountContractAddress,
    abi,
    webSocketProvider
  );

  const topic = chainAccountContract.interface.getEventTopic("Transfer");

  try {
    const request = {
      jsonrpc: "2.0",
      method: "eth_getLogs",
      params: {
        fromBlock: "latest",
        address: [chainAccountContractAddress],
        topics: [topic],
      },
    };

    chainAccountContract.on(
      "Transfer",
      async (senderAddress, recipientAddress, amount) => {
        console.log("Event emitted:");
        console.log("sender: ", senderAddress);
        console.log("recipient: ", recipientAddress);
        console.log("amount: ", amount.toString() / 100);

        try {
          const responseFromGanache = await axios.post(ganacheUrl, request);
          console.log(
            "response.data from JSON rpc request get_Logs: ",
            responseFromGanache.data
          );

          const body = {
            senderAddress,
            recipientAddress,
            amount: amount.toString() / 100,
            txHash: responseFromGanache.data.result[0].transactionHash,
          };

          const backendUrl = "http://localhost:4001/blockchain-events";
          const responseFromBackEnd = await axios.post(backendUrl, body);
          console.log(
            "In websocketProvider, logging response from backend (returning body): ",
            responseFromBackEnd.data
          );
        } catch (error) {
          console.log("In websocket file, catch block, logging error: ", error);
        }
      }
    );
  } catch (error) {
    console.log("In websocket file, catch block, logging error: ", error);
  }
}

main();

module.exports = main;

// const filterArray = chainAccountContract.filters.Transfer(
//   sender,
//   recipient,
//   null
// );

// console.log("Filter array: ", filterArray);

// const event = chainAccountContract.interface.getEvent("Transfer");
//   const log = receipt.logs.find((x) => x.topics.indexOf(topic) >= 0);
//   const deployedEvent = chainAccountContract.interface.parseLog(log);
// console.log("event: ", event);
// console.log("topic: ", topic);

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

//   console.log("log: ", log);
//   console.log("deployedEvent: ", deployedEvent);
