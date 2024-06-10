// Setting up Alchemy
require('dotenv').config();
const { Network, Alchemy } = require("alchemy-sdk");


// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: process.env.REACT_APP_API_KEY,
  network: Network.ETH_SEPOLIA, 
};

const alchemy = new Alchemy(settings);

async function main() {
  const latestBlock = await alchemy.core.getBlockNumber();
  console.log("The latest block number is", latestBlock);
}

main();

