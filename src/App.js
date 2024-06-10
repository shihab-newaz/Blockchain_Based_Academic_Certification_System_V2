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
            <Link to="/student-address">Student Portal</Link>
          </div>
        </div>
      </nav>

      <div className="content-container">
        <Routes>
          <Route exact path="/" element={<IssueCertificateComponent />} />
          <Route path="/student-address" element={<StudentAddressComponent />} />
          <Route path="/view" element={<ViewCertificateComponent />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
