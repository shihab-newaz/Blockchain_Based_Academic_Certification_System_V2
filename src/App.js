import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import IssueCertificateComponent from './components/Issue';
import RevokeCertificateComponent from './components/Revoke';
import ViewCertificateComponent from './components/View';
import ShareCertificateComponent from './components/share';
import VerifyCertificateComponent from './components/Verify';
import UpdateCertificateComponent from './components/Update';
import ViewAllCertificateComponent from './components/viewAll';
import UnShareCertificateComponent from './components/unshare';
import TamperCertificateComponent from './components/tamper';
import './css/App.css';


let Redirect = false; // Set to true after redirection

function App() {
  const pathname = useLocation().pathname; // Use the useLocation hook inside the App function

  // Update the flag when visiting the `/view` route
  useEffect(() => {
    if (pathname === '/view') {
      Redirect = false;
    } else if (pathname === '/') {
      Redirect = true;
    }
  }, [pathname]);

  // Handle issue certificate and redirect to view certificate page
  const handleIssueCertificate = async () => {
    try {
      IssueCertificateComponent(); // Issue the certificate
      Router.push('/view'); // Redirect to the view certificate page
      Redirect = true; // Update the flag after redirection
    } catch (error) {
      console.error('Error issuing certificate:', error);
      alert('Failed to issue certificate');
    }
  };


  return (
    <div>
      <nav className="navbar">
        <Link to="/"> Issue</Link>
        <Link to="/update">Update</Link>
        <Link to="/revoke"> Revoke</Link>
        <Link to="/view">Viewer Portal</Link>
        <Link to="/share">Share</Link>
        <Link to="/unshare">Unshare</Link>
        {/* <Link to="/verify">Verify</Link>
        <Link to="/viewAll">View All</Link>
        <Link to="/tamper">Tamper</Link> */}


      </nav>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Routes>
          <Route exact path="/" element={<IssueCertificateComponent issueCertificateComponentAndRedirect={handleIssueCertificate} />} />
          <Route path="/view" element={<ViewCertificateComponent />} />
          <Route path="/share" element={<ShareCertificateComponent />} />
          <Route path="/verify" element={< VerifyCertificateComponent />} />
          <Route path="/revoke" element={<RevokeCertificateComponent />} />
          <Route path="/update" element={<UpdateCertificateComponent />} />
          <Route path="/viewAll" element={<ViewAllCertificateComponent />} />
          <Route path="/unshare" element={<UnShareCertificateComponent />} />
          <Route path="/tamper" element={<TamperCertificateComponent />} />
        </Routes>
      </div>
    </div>

  );
}

export default App;




