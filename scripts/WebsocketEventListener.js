const axios = require("axios").default;
const { ethers } = require("ethers");
const { abi } = require("./../blockchainSources/ChainAccountArtifacts");
const {
  providerUrl,
  chainAccountContractAddress,
  backendUrlConstant,
  websocketConnectionAlchemyRinkeby,
} = require("../utils/constants");
console.log(
  "Websocket provider running, listening for events on blockchain ..."
);

async function main() {
  // http also works instead of websocketconnection

  const webSocketProvider = new ethers.providers.WebSocketProvider(
    websocketConnectionAlchemyRinkeby
  );

  const chainAccountContract = new ethers.Contract(
    chainAccountContractAddress,
    abi,
    webSocketProvider
  );

  const topic = chainAccountContract.interface.getEventTopic("Transfer");

  try {
    // request body below works for standard ethereum json rpc request to ganache. This does not seem to work on rinkeby using Alchemy provider.

    // const request = {
    //   jsonrpc: "2.0",
    //   method: "eth_getLogs",
    //   params: {
    //     fromBlock: "latest",
    //     address: [chainAccountContractAddress],
    //     topics: [topic],
    //   },
    // };

    // TRYING FOR ALCHEMY/RINKEBY:

    

    chainAccountContract.on(
      "Transfer",
      async (senderAddress, recipientAddress, amount) => {
        console.log("Event emitted:");
        console.log("sender: ", senderAddress);
        console.log("recipient: ", recipientAddress);
        console.log("amount: ", amount.toString() / 100);
        console.log("topic: ", topic);

        try {

          const response = await axios.post(providerUrl, {
            jsonrpc: "2.0",
            id: "0",
            method: "eth_blockNumber",
          });
      
          const blockNumber = response.data.result;
      
          console.log("response.data, block number: ", response.data, blockNumber);
      
          const previousBlock = `0x${(Number(blockNumber) - 1).toString(16)}`;
      
          console.log("previous block: ", previousBlock, typeof previousBlock);
      
          const request = {
            jsonrpc: "2.0",
            id: "0",
            method: "eth_getLogs",
            params: [
              {
                fromBlock: previousBlock,
                address: "0x511103EE939859971B00F240c7865e1885EbC825",
                topics: [
                  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                ],
              },
            ],
          };

          const responseFromProvider = await axios.post(providerUrl, request);
          console.log(
            "axios response.data from blockchain provider, get_Logs (with txHash): ",
            responseFromProvider.data
          );

          const lastTransaction = responseFromProvider.data.result.slice(-1)[0];

          const body = {
            senderAddress,
            recipientAddress,
            amount: amount.toString() / 100,
            txHash: lastTransaction.transactionHash,
          };

          const backendUrl = `${backendUrlConstant}/blockchain-events`;
          const responseFromBackEnd = await axios.post(backendUrl, body);
          console.log(
            "In websocketProvider, logging response from backend (returning body): ",
            responseFromBackEnd.data
          );
        } catch (error) {
          console.log("In websocket file, catch block, logging error: ", error.response);
        }
      }
    );
  } catch (error) {
    console.log("In websocket file, catch block, logging error: ", error.response);
  }
}

main();

module.exports = main;

// this works on postman

// {
//   "jsonrpc": "2.0",
//   "id": 0,
//   "method": "alchemy_getAssetTransfers",
//   "params": [
//       {
//           "fromBlock": "0x9d3981",
//           "contractAddresses": [
//               "0x511103EE939859971B00F240c7865e1885EbC825"
//           ],
//           "category": [
//               "token",
//               "erc20"
//           ]
//       }
//   ]
// }

// AND THIS TOO:

// {
//   "jsonrpc": "2.0",
//   "id": 0,
//   "method": "eth_getLogs",
//   "params": [
//       {
//           "fromBlock": "0x9d3981",
//           "address": "0x511103EE939859971B00F240c7865e1885EbC825",
//           "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
//       }
//   ]
// }

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
