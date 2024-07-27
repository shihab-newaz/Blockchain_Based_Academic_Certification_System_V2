import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/View.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_LARAVEL_URL || 'http://localhost:8000',
});

function ViewCertificateComponent() {
  const { studentAddress } = useParams();
  const [certificateDetails, setCertificateDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (fetchedRef.current) return;
      fetchedRef.current = true;

      try {
        setLoadingStatus('Fetching certificate data...');
        console.log('Fetching certificate for address:', studentAddress);
        const response = await api.get(`/api/view-certificate/${studentAddress}`);
        console.log('API response:', response.data);

        if (response.data.success) {
          setLoadingStatus('Processing certificate details...');
          const { certificateDetails } = response.data;
          console.log('Certificate details:', certificateDetails);
          setCertificateDetails(certificateDetails);
        } else {
          console.error('API returned success: false');
          setError('Failed to fetch certificate details: ' + (response.data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error fetching certificate:', error);
        setError(error.response?.data?.message || error.message || 'An error occurred while fetching the certificate');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [studentAddress]);

  const handleVerification = async () => {
    try {
      setIsVerifying(true);
      setVerificationResult(null);
      const response = await api.get(`/api/verify-certificate/${studentAddress}`);
      setVerificationResult(response.data);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({ 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during verification'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return <div className="loading-container">{loadingStatus}</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  if (!certificateDetails) {
    return <div className="no-data-container">No certificate details found for address: {studentAddress}</div>;
  }

  return (
    <div className="view-container">
      <div className="certificate-details">
        <h2>Certificate Details</h2>
        <p><strong>Student Name:</strong> {certificateDetails.studentName || 'N/A'}</p>
        <p><strong>Roll Number:</strong> {certificateDetails.roll || 'N/A'}</p>
        <p><strong>Degree Name:</strong> {certificateDetails.degreeName || 'N/A'}</p>
        <p><strong>Subject:</strong> {certificateDetails.subject || 'N/A'}</p>
        <p><strong>Issue Date:</strong> {certificateDetails.issueTimestamp ? new Date(certificateDetails.issueTimestamp * 1000).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Expiry:</strong> {certificateDetails.expiration ? `${certificateDetails.expiration} days from issue date` : 'N/A'}</p>
      </div>
      <div className="verification-section">
        <button onClick={handleVerification} disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Verify Certificate'}
        </button>
        {verificationResult && (
          <div className={`verification-result ${verificationResult.success ? 'success' : 'error'}`}>
            {verificationResult.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewCertificateComponent;