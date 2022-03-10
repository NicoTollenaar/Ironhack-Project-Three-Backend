require("dotenv").config({ path: "./../../.env" });

const mongoDb =
  process.env.MONG0DB_REMOTE_URI || "mongodb://localhost/chainAccount";
const ganacheUrl = "http://localhost:7545";
const contractAddressOnGanache = "0x471184AE3a9632a3a65d846f961b3a4b8A9e416A";
const contractAddressOnRinkeby = "0x511103EE939859971B00F240c7865e1885EbC825";
const alchemyRinkebyUrl =
  "https://eth-rinkeby.alchemyapi.io/v2/7eJSSFxEImk4KkiEgIqx92i5r29HLEUK";

const websocketConnectionAlchemyRinkeby =
  "wss://eth-rinkeby.alchemyapi.io/v2/7eJSSFxEImk4KkiEgIqx92i5r29HLEUK";

const privateKeyBank = process.env.PRIVATE_KEY_BANK_GANACHE_RINKEBY || process.env.RINKEBY_PRIVATE_KEY_ZERO;

const ETHAddressBank = "0x03F04fDa3B6E6FA1783A5EDB810155e5F4dD5461";
const backendUrlLocalHost = "http://localhost:4001";
const backendUrlHeroku = "https://chainaccount-api.herokuapp.com";

module.exports = {
  providerUrl: alchemyRinkebyUrl,
  chainAccountContractAddress: contractAddressOnRinkeby,
  mongoDb,
  ETHAddressBank,
  privateKeyBank,
  backendUrlConstant: backendUrlHeroku,
  websocketConnectionAlchemyRinkeby,
};
