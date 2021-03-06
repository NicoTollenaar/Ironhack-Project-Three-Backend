require("dotenv").config({ path: "./../../.env" });

const MONG0DB_REMOTE_URI= "mongodb+srv://NicoTollenaar:hat8gwp_YDG_emh0nzg@cluster0.te0qr.mongodb.net/Ironhack-Project-Three-NT-Database?retryWrites=true&w=majority";

const mongoDb =
  process.env.MONG0DB_REMOTE_URI || "mongodb://localhost/chainAccount";
  // const mongoDbRemote = "mongodb+srv://NicoTollenaar:hat8gwp_YDG_emh0nzg@cluster0.te0qr.mongodb.net/Ironhack-Project-Three-NT-Database?retryWrites=true&w=majority";
const ganacheUrl = "http://localhost:7545";
const contractAddressOnGanache = "0x471184AE3a9632a3a65d846f961b3a4b8A9e416A";
const contractAddressOnRinkeby = "0x511103EE939859971B00F240c7865e1885EbC825";
const alchemyRinkebyUrl =
  "https://eth-rinkeby.alchemyapi.io/v2/7eJSSFxEImk4KkiEgIqx92i5r29HLEUK";


const websocketConnectionAlchemyRinkeby =
  "wss://eth-rinkeby.alchemyapi.io/v2/7eJSSFxEImk4KkiEgIqx92i5r29HLEUK";

const privateKeyBank = process.env.PRIVATE_KEY_BANK_GANACHE_RINKEBY || process.env.RINKEBY_PRIVATE_KEY_ZERO;

const ETHAddressBank = "0x03F04fDa3B6E6FA1783A5EDB810155e5F4dD5461";
const backendUrlConstant = process.env.CHAINACCOUNT_API || "http://localhost:4001";

const providerUrl = process.env.ALCHEMY_RINKEBY_URL || ganacheUrl;

const chainAccountContractAddress = process.env.CONTRACT_ADDRESS_ON_RINKEBY || contractAddressOnGanache;

const wssProviderUri = process.env.WSS_ALCHEMY_RINKEBY || "ws://localhost:7545";

const network = process.env.NETWORK || "ganache";

module.exports = {
  providerUrl,
  chainAccountContractAddress,
  mongoDb,
  ETHAddressBank,
  privateKeyBank,
  backendUrlConstant,
  wssProviderUri,
  network,
};