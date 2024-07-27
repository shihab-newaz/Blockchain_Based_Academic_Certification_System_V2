import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentAddressComponent() {
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address) {
      navigate(`/view-certificate/${address}`);
    }
  };

  return (
    <div className="address-input-container">
      <h2>Enter Student Address</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter student address"
        />
        <button type="submit">View Certificate</button>
      </form>
    </div>
  );
}

export default StudentAddressComponent;