import { ethers } from 'ethers';

export async function initContract() {
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
  const API_URL = process.env.REACT_APP_INFURA_API_URL;

  // For browser interactions
  const provider = new ethers.BrowserProvider(window.ethereum);

  // For JSON-RPC interactions
  const PROVIDER = new ethers.JsonRpcProvider(API_URL);

  // Create wallet and signer
  const signer = new ethers.Wallet(PRIVATE_KEY, PROVIDER);

  // Load ABI
  const CONTRACT_ABI = require('../abis/CertificateContract.json');

  // Create contract instance
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return { contract, signer };
}