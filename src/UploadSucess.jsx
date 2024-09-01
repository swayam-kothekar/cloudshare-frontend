import React from 'react';
import {  Shield, Cloud } from 'lucide-react';

const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
  },
  primaryButton: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    border: '1px solid #10b981',
    color: '#10b981',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '0.5rem',
    padding: '2rem',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: '1rem',
  },
  link: {
    backgroundColor: '#0d9488',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '0.25rem',
    wordBreak: 'break-all',
    marginBottom: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  infoGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  expiry: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    marginTop: '1rem',
  },
  wavyLines: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '30%',
    zIndex: -1,
    opacity: 0.2,
  },
};

const FastFileUploadComplete = () => {
  return (
    <>
      {/* <header style={styles.header}>
        <div style={styles.logo}>
          <Cloud size={24} />
          FastFile
        </div>
        <div style={styles.buttons}>
          <button style={{...styles.button, ...styles.secondaryButton}}>Send More Files</button>
          <button style={{...styles.button, ...styles.secondaryButton}}>Log in</button>
          <button style={{...styles.button, ...styles.primaryButton}}>Get Started</button>
        </div>
      </header> */}
      <main style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Upload complete! Your file is ready to share!</h1>
          <p style={styles.subtitle}>You can now share it using the link provided</p>
          <div style={styles.link}>
            https://fastfile.myamaan.tech/download/Untitled%20document.pdf.encrypted?key=%7B
          </div>
          <div style={styles.buttonGroup}>
            <button style={{...styles.button, ...styles.secondaryButton, flex: 1}}>Copy URL to Clipboard</button>
            <button style={{...styles.button, ...styles.secondaryButton, flex: 1}}>Show QR Code</button>
          </div>
          <div style={styles.infoGroup}>
            <div style={styles.infoItem}>
              <Shield size={20} />
              Ciphered
            </div>
            <div style={styles.infoItem}>
              <Cloud size={20} />
              Transmitted
            </div>
          </div>
          <p style={styles.expiry}>Expires in 24 hours</p>
        </div>
      </main>
      </>
  );
};

export default FastFileUploadComplete;