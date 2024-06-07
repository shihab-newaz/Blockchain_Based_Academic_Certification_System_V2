import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import IssueCertificateComponent from './components/Issue';
import ViewCertificateComponent from './components/View';
import ShareCertificateComponent from './components/share';
import StudentAddressComponent from './components/StudentAddress';
// import RevokeCertificateComponent from './components/Revoke';
// import UpdateCertificateComponent from './components/Update';
// import UnShareCertificateComponent from './components/unshare';
import './css/App.css';

function App() {
  return (
    <div>
      <nav className="navbar">
        <Link to="/"> Issue</Link>
        <Link to="/share">Share</Link>
        <Link to="/student-address">Student Portal</Link>
        {/* <Link to="/view">Viewer Portal</Link> */}
        {/* <Link to="/revoke"> Revoke</Link> */}
        {/* <Link to="/update">Update</Link> */}
        {/* <Link to="/unshare">Unshare</Link> */}
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
        <Routes>
          <Route exact path="/" element={<IssueCertificateComponent />} />
          <Route path="/share" element={<ShareCertificateComponent />} />
          <Route path="/student-address" element={<StudentAddressComponent />} />
          <Route path="/view" element={<ViewCertificateComponent />} />
          {/* <Route path="/revoke" element={<RevokeCertificateComponent />} />
          <Route path="/update" element={<UpdateCertificateComponent />} />
          <Route path="/unshare" element={<UnShareCertificateComponent />} /> */}
        </Routes>
      </div>
    </div>

  );
}

export default App;




