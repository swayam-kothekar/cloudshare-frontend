import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JSZip from 'jszip';

const FileDownload = () => {
  const [status, setStatus] = useState('');
  const [extractedFiles, setExtractedFiles] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const styles = {
    container: {
      padding: '20px',
      textAlign: 'center',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#66fcf1',
    },
    subtitle: {
      marginBottom: '40px',
      color: '#66fcf1',
    },
    status: {
      color: '#c5c6c7',
      fontSize: '18px',
      margin: '20px 0',
    },
    fileContainer: {
      border: '2px solid #ffffff',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#1f2833',
      display: 'flex',
      flexDirection: 'column',
      minWidth: '500px',
      minHeight: '300px',
      position: 'relative',
    },
    fileList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      flexGrow: 1, // Allow the list to grow and take available space
    },
    fileItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '10px 0',
    },
    fileLink: {
      color: '#45a29e',
      textDecoration: 'none',
      fontSize: '18px',
    },
    downloadButton: {
      backgroundColor: '#45a29e',
      border: 'none',
      color: '#fff',
      padding: '5px 10px',
      textAlign: 'center',
      textDecoration: 'none',
      fontSize: '16px',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    buttonContainer: {
      marginTop: '20px',
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
    },
    button: {
      backgroundColor: '#45a29e',
      border: 'none',
      color: '#fff',
      padding: '10px 20px',
      textAlign: 'center',
      textDecoration: 'none',
      display: 'inline-block',
      fontSize: '16px',
      borderRadius: '5px',
      cursor: 'pointer',
    },
  };
  
  useEffect(() => {
    handleDownload();
  }, [location]);

  const base64ToUint8Array = (base64) => {
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binaryString = atob(base64);
    return new Uint8Array(binaryString.length).map((_, i) => binaryString.charCodeAt(i));
  };

  const decryptFile = async (encryptedBlob, key) => {
    const encryptedArrayBuffer = await encryptedBlob.arrayBuffer();
    const iv = encryptedArrayBuffer.slice(0, 12);
    const data = encryptedArrayBuffer.slice(12);

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      cryptoKey,
      data
    );

    const dv = new DataView(decryptedContent);
    const metadataLength = dv.getUint32(0, true);
    const metadataBuffer = decryptedContent.slice(4, 4 + metadataLength);
    const metadata = JSON.parse(new TextDecoder().decode(metadataBuffer));
    const fileContent = decryptedContent.slice(4 + metadataLength);

    return {
      blob: new Blob([fileContent], { type: metadata.type }),
      fileName: metadata.name
    };
  };

  const extractZip = async (zipBlob) => {
    try {
      const zip = await JSZip.loadAsync(zipBlob); 
      const files = [];

      for (const fileName of Object.keys(zip.files)) {
        const fileData = await zip.files[fileName].async('blob');
        files.push({ name: fileName, file: fileData });
      }

      setExtractedFiles(files); 
    } catch (err) {
      console.error('Failed to extract ZIP file:', err);
      setStatus('Failed to extract ZIP file: ' + err.message);
    }
  };

  const handleDownload = async () => {
    const params = new URLSearchParams(window.location.search);
    const finalUrl = params.get('url');
    const key = params.get('key');
    
    if (!finalUrl) {
      setStatus('No download URL provided');
      return;
    }

    try {
      const url = new URL(finalUrl);
      
      const downloadUrl = url.origin + url.pathname + url.search.split('&encryptionKey=')[0];
      console.log("GetObject Link:"+downloadUrl)
      const encodedKey = key;

      if (!encodedKey) {
        throw new Error('Encryption key not found in URL');
      }

      setStatus('Downloading encrypted file...');
      const response = await axios.get(downloadUrl, {
        responseType: 'blob'
      });

      setStatus('Decrypting file...');
      const decryptionKey = base64ToUint8Array(encodedKey);
      const { blob: decryptedBlob } = await decryptFile(response.data, decryptionKey);

      setStatus('Extracting files...');
      await extractZip(decryptedBlob); 

      setStatus('Files extracted successfully!');
    } catch (err) {
      if (err.response.status === 403){
        console.error('File download or decryption failed:', err.message);
        setStatus('Oops! Download Link Expired or File Deleted');
      }
      else{
        console.error('File download or decryption failed:', err);
        setStatus('File download or decryption failed: ' + err.message);
      }
    }
  };

  const downloadFile = (file) => {
    const url = window.URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadAllFiles = async () => {
    try {
      const zip = new JSZip();
      extractedFiles.forEach(file => {
        zip.file(file.name, file.file);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'files.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
      setStatus('Failed to create ZIP: ' + err.message);
    }
  };


  return (
    <div style={styles.container}>
      <h1>CloudShare</h1>
      <h2>You've Got Files!</h2>
      {extractedFiles.length > 0 && (
        <div style={styles.fileContainer}>
          <ul style={styles.fileList}>
            {extractedFiles.map((file, index) => (
              <li key={index} style={styles.fileItem}>
                {file.name}
                <button
                  style={styles.downloadButton}
                  onClick={() => downloadFile(file)}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
          <div style={styles.buttonContainer}>
            <button 
              style={styles.button}
              onClick={() => navigate('/')}
            >
              Upload More Files
            </button>
            <button 
              style={styles.button}
              onClick={downloadAllFiles}
            >
              Download All
            </button>
          </div>
        </div>
      )}
      {status && <p style={styles.status}>{status}</p>}
    </div>
  );
};

export default FileDownload;

