// import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUpload from './FileUpload';
import FileDownload from './FileDownload';
// import UploadSuccess from './UploadSuccess';
import './App.css';
import LandingPage from './LandingPage';

const App: React.FC = () => {
  
  return (
    <Router>
      <div>
        <main>
          <Routes>
          <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/download" element={<FileDownload />} />
            {/* <Route path="/upload-success" element={<UploadSuccess />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;