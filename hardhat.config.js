/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("hardhat-abigen");

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.REACT_APP_API_KEY}`,
      accounts: [`0x${process.env.REACT_APP_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: process.env.REACT_APP_ETHERSCAN_API_KEY,
  },

  abigen: {
   outDir: "src/abis",   
   inDir: "contracts",       
   includeContracts: ["*"],  
   excludeContracts: [],     
   space: 2,                
   autoCompile: true      
 },

 resolve: {
  fallback: {
    path: false,
    os:false,
    crypto:false,
  },
},

}
