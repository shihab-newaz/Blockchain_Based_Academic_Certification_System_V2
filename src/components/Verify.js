import { ethers } from 'ethers';
import { initContract } from './Contract';

export async function verifyCertificate(studentAddress) {
  try {
    const { contract } = await initContract();
    const isIssued = await contract.verifyCertificate(studentAddress);

    if (!isIssued) {
      console.log('Certificate verification is unsuccessful');
      return { error: 'Verification unsuccessful: Certificate either not issued or already revoked' };
    }

    const certificateDetails = await contract.viewCertificate(studentAddress);

    const signerAddress = ethers.verifyMessage(certificateDetails.dataHash, certificateDetails.signature);    // Recover the address of the signer
    const expectedSignerAddress = process.env.REACT_APP_SIGNER_ADDRESS;

    console.log(signerAddress + ' AND ' + expectedSignerAddress);
    
    if (signerAddress === expectedSignerAddress) {
      console.log('The signature is valid.');
      return { success: 'Signature Verification successful' };
    } else {
      console.log('The signature is NOT valid.');
      return { error: 'Signature Verification unsuccessful' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'An error occurred during verification.' };
  }
}
