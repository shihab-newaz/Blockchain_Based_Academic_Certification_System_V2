/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("hardhat-abigen");

//require("@nomicfoundation/hardhat-toolbox");
const { REACT_APP_SEED_PHRASE } = process.env;


module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337,
      showAccounts: true,
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
