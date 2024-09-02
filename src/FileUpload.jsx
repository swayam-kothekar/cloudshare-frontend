import React, { useState } from "react";
import axios from "axios";
import JSZip from "jszip";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [expiryTime, setExpiryTime] = useState(60 * 60 * 24);

  document.addEventListener("DOMContentLoaded", () => {
    const interBubble = document.querySelector(".interactive");
    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;

    const move = () => {
      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;
      interBubble.style.transform = `translate(${Math.round(
        curX
      )}px, ${Math.round(curY)}px)`;
      requestAnimationFrame(move);
    };

    window.addEventListener("mousemove", (event) => {
      tgX = event.clientX;
      tgY = event.clientY;
    });

    move();
  });

  const styles = {
    container: {
      padding: "20px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0",
    },
    logo: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#66fcf1",
    },
    mainContent: {
      marginTop: "40px",
      textAlign: "center",
    },
    subtitle: {
      marginBottom: "40px",
      color: "#66fcf1",
    },
    contentContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "40px",
      marginTop: "40px",
    },
    uploadBox: {
      border: "5px dashed #45a29e",
      borderRadius: "20px",
      padding: "30px",
      width: "600px",
      minHeight: "300px",
      textAlign: "center",
      boxSizing: "border-box",
      fontSize: "18px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    inputContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
    input: {
      fontSize: "18px",
      backgroundColor: "transparent",
      border: "none",
      width: "250px",
      marginBottom: "30px",
      textAlign: "center",
    },
    button: {
      margin: "10px 0",
      padding: "15px 30px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#1779aa",
      color: "white",
      cursor: "pointer",
      fontSize: "16px",
    },
    infoBox: {
      maxWidth: "400px",
      textAlign: "left",
      color: "#c5c6c7",
    },
    infoBoxHeading: {
      color: "#66fcf1",
    },
    expiryContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: "30px",
    },
    expiryLabel: {
      fontSize: "18px",
      marginRight: "10px",
    },
    expirySelect: {
      fontSize: "18px",
      backgroundColor: "transparent",
      border: "1px solid",
      borderRadius: "5px",
      padding: "5px",
    },
    expiryOption: {
      backgroundColor: "black"
    }
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const uint8ArrayToBase64 = (arr) => {
    return btoa(String.fromCharCode(...arr))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const encryptFile = async (file) => {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const fileArrayBuffer = await file.arrayBuffer();

    const metadata = JSON.stringify({
      name: file.name,
      type: file.type,
    });
    const metadataBuffer = new TextEncoder().encode(metadata);

    const combinedBuffer = new Uint8Array(
      metadataBuffer.length + 4 + fileArrayBuffer.byteLength
    );
    const dv = new DataView(combinedBuffer.buffer);
    dv.setUint32(0, metadataBuffer.length, true);
    combinedBuffer.set(metadataBuffer, 4);
    combinedBuffer.set(
      new Uint8Array(fileArrayBuffer),
      metadataBuffer.length + 4
    );

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      combinedBuffer
    );

    const exportedKey = await window.crypto.subtle.exportKey("raw", key);
    const finalKey = new Uint8Array(exportedKey);

    return {
      encryptedFile: new Blob([iv, encryptedContent]),
      key: finalKey,
    };
  };

  const zipAndEncryptFiles = async () => {
    if (files.length === 0) return;

    try {
      setUploadStatus("Zipping files...");
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        zip.file(file.name, file);
      }
      const zipFile = await zip.generateAsync({ type: "blob" });

      setUploadStatus("Encrypting zip file...");
      const { encryptedFile, key } = await encryptFile(zipFile);

      const { data } = await axios.post(
        "https://m1tjgmlky5.execute-api.us-east-1.amazonaws.com/dev/generate-upload-url",
        {
          fileType: "application/octet-stream",
        }
      );

      const { uploadUrl, keyName } = data;

      setUploadStatus("Uploading encrypted zip file...");
      await axios.put(uploadUrl, encryptedFile, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      setUploadStatus("Files encrypted and uploaded successfully!");

      const keyBase64 = uint8ArrayToBase64(key);

      console.log(expiryTime);

      const { data: downloadData } = await axios.post(
        "https://m1tjgmlky5.execute-api.us-east-1.amazonaws.com/dev/generate-download-url",
        {
          keyName: keyName,
          expiry: expiryTime,
        }
      );

      console.log(downloadData);

      const downloadUrl = `https://swayamkothekar.me/download?url=${encodeURIComponent(
        downloadData.downloadUrl
      )}&key=${keyBase64}`;
      setDownloadLink(downloadUrl);
    } catch (err) {
      console.error("File upload failed:", err);
      setUploadStatus("File upload failed: " + err.message);
    }
  };

  const copyLinkToClipboard = () => {
    if (downloadLink) {
      navigator.clipboard
        .writeText(downloadLink)
        .then(() => {
          setUploadStatus("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
          setUploadStatus("Failed to copy link.");
        });
    }
  };

  return (
    <div>
      <div class="card">
        <svg
          viewBox="0 0 100% 100%"
          xmlns="http://www.w3.org/2000/svg"
          class="noise"
        >
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="6"
              stitchTiles="stitch"
            />
          </filter>

          <rect
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            filter="url(#noiseFilter)"
          />
        </svg>
        <div class="content">
          <main style={styles.mainContent}>
            <h1>CloudShare</h1>
            <h2>Share Fearlessly, Secure by Nature.</h2>
            <p style={styles.subtitle}>
              A secure file sharing platform, enabling you to share files
              anywhere, anytime.
            </p>

            <div style={styles.contentContainer}>
              <div style={styles.uploadBox}>
                <div style={styles.inputContainer}>
                  <input
                    style={styles.input}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                  />

                  <div style={styles.expiryContainer}>
                    <label style={styles.expiryLabel}>Delete file after:</label>
                    <select
                      style={styles.expirySelect}
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
                    >
                      <option style={styles.expiryOption} value={60 * 1}>1 Minute</option>
                      <option style={styles.expiryOption} value={60 * 5}>5 Minutes</option>
                      <option style={styles.expiryOption}  value={60 * 60}>1 Hour</option>
                      <option style={styles.expiryOption} value={60 * 60 * 24}>24 Hours</option>
                    </select>
                  </div>

                  <button
                    style={styles.button}
                    onClick={zipAndEncryptFiles}
                    disabled={files.length === 0}
                  >
                    Upload Files
                  </button>
                </div>

                {uploadStatus && <p>{uploadStatus}</p>}
                {downloadLink && (
                  <div>
                    <button
                      style={styles.button}
                      onClick={copyLinkToClipboard}
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>

              <aside style={styles.infoBox}>
                <h2 style={styles.infoBoxHeading}>
                  Seamless, secure file sharing with peace of mind and privacy.
                </h2>
                <p>
                  CloudShare leverages advanced end-to-end encryption to
                  rigorously protect your files during transfer and storage.
                  Secure sharing links include the necessary decryption
                  information, ensuring that only intended recipients can access
                  your files.
                </p>
              </aside>
            </div>
          </main>
        </div>
      </div>
      <div class="gradient-bg">
        <svg
          viewBox="0 0 100vw 100vw"
          xmlns="http://www.w3.org/2000/svg"
          class="noiseBg"
        >
          <filter id="noiseFilterBg">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.6"
              stitchTiles="stitch"
            />
          </filter>

          <rect
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            filter="url(#noiseFilterBg)"
          />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="svgBlur">
          <defs>
            <filter id="goo">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="10"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div class="gradients-container">
          <div class="g1"></div>
          <div class="g2"></div>
          <div class="g3"></div>
          <div class="g4"></div>
          <div class="g5"></div>
          <div class="interactive"></div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
