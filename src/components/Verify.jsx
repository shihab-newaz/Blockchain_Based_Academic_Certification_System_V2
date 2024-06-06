import React, { useState } from 'react';
import { ethers } from 'ethers';
import '../css/View.css';
import { initContract } from './Contract';

function VerifyCertificateComponent() {
    const [studentAddress, setStudentAddress] = useState('');
    const [signatureVerification, setSignatureVerification] = useState('');
    const [verificationMessage, setVerificationMessage] = useState('');
    const [employerAddress, setEmployerAddress] = useState('');

    
    const verifyCertificate = async () => {
        try {
            const startTime = performance.now();
     
            const {contract} = await initContract();
            const isIssued = await contract.verifyCertificate(studentAddress);
            const permission = await contract.isCertificateSharedWith(studentAddress, employerAddress);

            if (!permission) {
                setVerificationMessage({ error: 'The verifier does not have permission for this certificate' });
                return;
            }
            if (!isIssued) {
                console.log('Certificate verification is unsuccessful');
                setVerificationMessage('Verification unsuccessful: Certificate either not issued or already revoked');
                return;
            }

            const certificate = await contract.viewCertificate(studentAddress);
            console.log(certificate);
            // Recover the address of the signer
            const signerAddress = ethers.utils.verifyMessage(certificate.dataHash, certificate.signature);
            const expectedSignerAddress = process.env.REACT_APP_SIGNER_ADDRESS;

            console.log(signerAddress + ' AND ' + expectedSignerAddress);
            if (signerAddress === expectedSignerAddress) {
                console.log('The signature is valid.');
                setSignatureVerification('Signature Verification successful');
            } else {
                console.log('The signature is NOT valid.');
                setSignatureVerification('Signature Verification unsuccessful');
            }

            const endTime = performance.now(); // Stop counting execution time
            const executionTime = endTime - startTime; // Calculate execution time
            console.log('Execution time for verifyCertificate:', executionTime, 'ms');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='verify-certificate-container'>
            <h1>Verify Certificate</h1>
            <input
                type="text"
                placeholder="Student Address"  style={{ marginBottom: '10px' }}
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
            />
            <input
                style={{ marginBottom: '10px' }}
                type="text"
                placeholder="Verifier Address"
                onChange={(e) => setEmployerAddress(e.target.value)}
            />
            <button onClick={verifyCertificate} 
                style={{
                    backgroundColor: '#4caf50', color: 'white', padding: '10px 15px', border: 'none',
                    borderRadius: '5px', marginBottom: '10px', cursor: 'pointer'
                }}>
                Verify
            </button>
            <p>{signatureVerification}</p>
            <p>{verificationMessage}</p>
        </div>
    );
}

export default VerifyCertificateComponent;
