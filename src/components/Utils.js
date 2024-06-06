import { ethers } from 'ethers';

export const generateStudentCredentials = (generatedAddresses, setStudentAddress, setGeneratedAddresses) => {
  let newAddress, newPrivateKey;
  do {
    const wallet = ethers.Wallet.createRandom();
    newAddress = wallet.address;
    newPrivateKey = wallet.privateKey;
  } while (generatedAddresses.includes(newAddress));

  setStudentAddress(newAddress);
  setGeneratedAddresses([...generatedAddresses, newAddress]);
};