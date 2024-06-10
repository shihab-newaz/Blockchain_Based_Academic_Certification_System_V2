import React from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { toPng } from 'html-to-image';

function StudentAddressComponent() {
  const navigate = useNavigate();
  const [studentAddress, setStudentAddress] = React.useState('');
  const [qrUrl, setQrUrl] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = `/view?studentAddress=${studentAddress}`;
    navigate(url);
  };

  const generateQRCode = () => {
    const url = `${window.location.origin}/view?studentAddress=${studentAddress}`;
    setQrUrl(url);
  };

  const downloadQRCode = () => {
    const qrCodeElement = document.getElementById('qrCodeElement');
    toPng(qrCodeElement)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Error generating QR code image:', error);
      });
  };

  return (
    <div>
      <h2>Enter Student Address</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value)}
          placeholder="Enter student address"
        />
        <button type="submit" style={{ marginRight: '10px' }}>View Certificate</button>
        <button type="button" onClick={generateQRCode}>Generate QR Code</button>
      </form>

      {qrUrl && (
        <div>
          <h3>Scan QR Code to View Certificate</h3>
          <div id="qrCodeElement">
            <QRCode value={qrUrl} />
          </div>
          <button onClick={downloadQRCode}>Download QR Code</button>
        </div>
      )}
    </div>
  );
}

export default StudentAddressComponent;
