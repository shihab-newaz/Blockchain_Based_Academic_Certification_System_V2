import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import IssueCertificateComponent from './components/Issue';
import ViewCertificateComponent from './components/View';
import StudentAddressComponent from './components/StudentAddress';
import './css/App.css';

function App() {
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-center">
            <Link to="/">Issue Certificate</Link>
            <Link to="/view-certificate">View Certificate</Link>
          </div>
        </div>
      </nav>

      <div className="content-container">
        <Routes>
          <Route exact path="/" element={<IssueCertificateComponent />} />
          <Route path="/view-certificate" element={<StudentAddressComponent />} />
          <Route path="/view-certificate/:studentAddress" element={<ViewCertificateComponent />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;