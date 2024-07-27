import React, { useState } from 'react';
import { initContract } from '..utils/Contract';
import '../css/Issue.css';

function RevokeCertificateComponent() {
    const [studentAddress, setStudentAddress] = useState('');
    const [showRevocationMessage, setShowRevocationMessage] = useState(false);
    const [revocationMessage, setRevocationMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const revokeCertificate = async () => {
        const startTime = performance.now(); // Start counting execution time

        setIsLoading(true); // Set loading to true at the start of the function
        try {
            const contract = await initContract();
            const isRevoked = await contract.revokeCertificate(studentAddress);;
            if (isRevoked) {
                setRevocationMessage('Revocation successful');
            }
            const endTime = performance.now(); // Stop counting execution time
            const executionTime = endTime - startTime; // Calculate execution time
            console.log('Execution time:', executionTime, 'ms');
        } catch (error) {
            console.error(error);
            setRevocationMessage('Revocation unsuccessful');
        }

        setIsLoading(false); // Set loading to false at the end of the function

        setShowRevocationMessage(true);

        setTimeout(() => {
            setShowRevocationMessage(false);
        }, 5000);
    };

    return (
        <div className='issue-certificate-container'>
            <h1>Revoke Certificate</h1>
            <input
                type="text"
                placeholder="Student Address"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
            />
            <button style={{ marginTop: 10, marginBottom: 10 }} onClick={revokeCertificate}>Revoke Certificate</button>
            {isLoading && <div className="spinner"></div>} {/* Display spinner when isLoading is true */}
            {showRevocationMessage && <p>{revocationMessage}</p>}
        </div>
    );
}

export default RevokeCertificateComponent;