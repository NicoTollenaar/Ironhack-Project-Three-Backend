const axios = require("axios").default;
const { ethers } = require("ethers");
const { abi } = require("./../blockchainSources/ChainAccountArtifacts");
const {
  providerUrl,
  chainAccountContractAddress,
  websocketConnectionAlchemyRinkeby,
  ETHAddressBank
} = require("../utils/constants");
const wss = require("./../server");
const writeToDatabase = require("./writeBlockChainEventToDatabase");

console.log(
  "Websocket provider running, listening for events on blockchain ..."
);

let client = {};

wss.on("connection", function(connection, request){
  client = connection;
  console.log("Client websocket connection established");
  const intervalId = setInterval(()=>{
    client.send("ping");
  }, 28000);
  // client.on("message", function(message){
  //   if (message.toString() === "pong") {
  //     console.log(message.toString());
  //   }
  // });
});

async function WebSocketEventListener() {

  const start = Date.now();
  console.log("In websocketeventlistener, logging start time:", start); 

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

          // below is code to get previous block (in case transaction is not on "latest", but makes it very slow causing timeout by Heroku)

          const response = await axios.post(providerUrl, {
            jsonrpc: "2.0",
            id: "0",
            method: "eth_blockNumber",
          });
      
          const blockNumber = response.data.result;
      
          const previousBlock = `0x${(Number(blockNumber) - 5).toString(16)}`;

      //  **********

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

          const newBalanceSender = await chainAccountContract.balanceOf(senderAddress);
          const newBalanceRecipient = await chainAccountContract.balanceOf(recipientAddress);

          const data = {
            senderAddress,
            recipientAddress,
            newBalanceSender: Number(newBalanceSender / 100),
            newBalanceRecipient: Number(newBalanceRecipient / 100),
            amount: amount.toString() / 100,
            txHash: lastTransaction.transactionHash,
          };

          if (
            recipientAddress !== ETHAddressBank &&
            senderAddress !== ETHAddressBank 
          ) {
          const updatedDatabaseInfo = await writeToDatabase(data);
          
            if (client.readyState === 1) {
              client.send(JSON.stringify(updatedDatabaseInfo));
            } else {
              throw new Error("websocket connection failed, could not send data")
            }
          
        }
          console.log("In writeToDatabase, logging time lapsed: ", Date.now() - start);

        } catch (error) {
          console.log("In websocket file, catch block 1, logging error: ", error);
        }
      }
    );
  } catch (error) {
    console.log("In websocket file, catch block 2, logging error: ", error );
  }
}

WebSocketEventListener();

module.exports = WebSocketEventListener;

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
