import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import FileUpload from './FileUpload';
import FileDownload from './FileDownload';
import UploadSuccess from './UploadSucess';
import './App.css'; // Make sure to create this file


function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={<FileUpload />} />
            <Route path="/download" element={<FileDownload />} />
            <Route path="/upload-success" element={<UploadSuccess />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;