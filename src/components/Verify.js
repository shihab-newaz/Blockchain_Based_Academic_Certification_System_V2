import { ethers } from 'ethers';
import { initContract } from './Contract';

export async function verifyCertificate(studentAddress, employerAddress) {
  try {
    const startTime = performance.now();

    const { contract } = await initContract();
    const isIssued = await contract.verifyCertificate(studentAddress);
    const permission = await contract.isCertificateSharedWith(studentAddress, employerAddress);

    if (!permission) {
      return { error: 'The verifier does not have permission for this certificate' };
    }
    if (!isIssued) {
      console.log('Certificate verification is unsuccessful');
      return { error: 'Verification unsuccessful: Certificate either not issued or already revoked' };
    }

    const certificate = await contract.viewCertificate(studentAddress);
    console.log(certificate);
    // Recover the address of the signer
    const signerAddress = ethers.utils.verifyMessage(certificate.dataHash, certificate.signature);
    const expectedSignerAddress = process.env.REACT_APP_SIGNER_ADDRESS;

    console.log(signerAddress + ' AND ' + expectedSignerAddress);
    if (signerAddress === expectedSignerAddress) {
      console.log('The signature is valid.');
      const endTime = performance.now(); // Stop counting execution time
      const executionTime = endTime - startTime; // Calculate execution time
      console.log('Execution time for verifyCertificate:', executionTime, 'ms');
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
