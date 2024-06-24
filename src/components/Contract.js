import { ethers } from 'ethers';

export function initContract() {
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
  const QUICKNODE_URL = process.env.REACT_APP_API_URL;
  
  const PROVIDER = new ethers.providers.JsonRpcProvider(QUICKNODE_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, PROVIDER);
  const CONTRACT_ABI = require('../abis/CertificateContract.json');
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return { contract, signer };
}
