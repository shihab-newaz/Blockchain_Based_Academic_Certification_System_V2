/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("hardhat-abigen");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    polygon_amoy: {
      url: process.env.REACT_APP_INFURA_API_URL,
      accounts: [
        process.env.REACT_APP_PRIVATE_KEY,
      ],
    },
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
