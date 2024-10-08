import { Button } from "./components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import axios from "axios";
import JSZip from "jszip";
import { Upload } from "lucide-react";
import { Card, CardContent } from "./components/ui/card";
// import QRCode from 'react-qr-code';
// import QRCode from 'qrcode.react';
import { QRCode } from 'react-qrcode-logo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Label } from "./components/ui/label";
import { Navbar } from "./components/Navbar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "./components/ui/input";

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [downloadLink, setDownloadLink] = useState<string>("");
  const [buttonText, setButtonText] = useState("Copy Link");
  const [expiryTime, setExpiryTime] = useState<string>("86400");
  const [downloadLimit, setDownloadLimit] = useState<string>("1000");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customShortUrl, setCustomShortUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const uint8ArrayToBase64 = (arr: Uint8Array): string => {
    return btoa(String.fromCharCode(...arr))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const encryptFile = async (
    file: File | Blob
  ): Promise<{ encryptedFile: Blob; key: Uint8Array }> => {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const fileArrayBuffer = await file.arrayBuffer();

    const metadata = JSON.stringify({
      name: file instanceof File ? file.name : "archive.zip",
      type: file.type || "application/zip",
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
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadStatus("Zipping files...");
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        zip.file(file.name, file);
      }
      const zipFile = await zip.generateAsync({ type: "blob" });

      setUploadStatus("Encrypting zip file...");
      const { encryptedFile, key } = await encryptFile(zipFile);

      const { data } = await axios.post<{ uploadUrl: string; keyName: string }>(
        // "http://localhost:3000/generate-upload-url",
        "https://3cau1u2h61.execute-api.us-east-1.amazonaws.com/dev-test/generate-upload-url",
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
      
      const { data: downloadData } = await axios.post<{ downloadUrl: string }>(
        // "http://localhost:3000/generate-download-url",
        "https://3cau1u2h61.execute-api.us-east-1.amazonaws.com/dev-test/generate-download-url",
        {
          keyName: keyName,
          expiry: parseInt(expiryTime, 10),
        }
      );
      
      await axios.post("https://3cau1u2h61.execute-api.us-east-1.amazonaws.com/dev-test/tag-file", {
        keyName: keyName,
        downloadLimit: downloadLimit
      });

      console.log(downloadData);

      const downloadUrl = `https://cloudshare.swayam.tech/download?url=${encodeURIComponent(
      // const downloadUrl = `http://localhost:5173/download?url=${encodeURIComponent(
        downloadData.downloadUrl
      )}&key=${keyBase64}`;

      const {data: shortUrlData} = await axios.post("https://3cau1u2h61.execute-api.us-east-1.amazonaws.com/dev-test/generate-short-url", {
        longUrl: downloadUrl,
        shortUrl: customShortUrl || crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), ''),
      });

      setDownloadLink(shortUrlData.shortenedUrl);
    } catch (err) {
      console.error("File upload failed:", err);
      setUploadStatus(
        `File upload failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };


  const copyLinkToClipboard = () => {
    if (downloadLink) {
      navigator.clipboard
        .writeText(downloadLink)
        .then(() => {
          setUploadStatus("Link copied to clipboard!");
          setButtonText("Link Copied!");
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
          setUploadStatus("Failed to copy link.");
        });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 flex flex-col">
  {/* <header className="p-6 flex justify-between items-center bg-gray-800 bg-opacity-50 backdrop-blur-sm">
    <div className="flex items-center space-x-3">
      <Cloud className="h-10 w-10 text-pink-400" />
      <span className="text-2xl font-bold text-pink-400">CloudShare</span>
    </div>
  </header> */}
  <Navbar />

  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg
      className="absolute bottom-0 left-0 w-full"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path
        fill="rgba(219, 39, 119, 0.05)"
        fillOpacity="1"
        d="M0,32L48,80C96,128,192,224,288,229.3C384,235,480,149,576,128C672,107,768,149,864,154.7C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
    </svg>
  </div>

  <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10">
    <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
      {downloadLink
        ? "Your files are ready to share!"
        : "Share Fearlessly, Secure by Nature"}
    </h1>
    <p className="text-xl mb-12 text-gray-300 max-w-2xl text-center">
      {downloadLink
        ? "Your files have been securely uploaded and are now ready to be shared. Use the link below to share your files safely."
        : "A secure file sharing platform, enabling you to share files anywhere, anytime with uncompromising privacy."}
    </p>

    <Card className="w-full max-w-4xl bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
      <CardContent className="p-8">
        {downloadLink ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-gray-700 bg-opacity-50 p-3 rounded-xl">
              <input
                type="text"
                value={downloadLink}
                readOnly
                className="flex-grow bg-transparent text-gray-300 focus:outline-none"
              />
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  copyLinkToClipboard();
                }}
                className="flex-1 bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-300"
              >
                {buttonText}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition-colors duration-300">
                    Show QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>QR Code for Download Link</DialogTitle>
                    <DialogDescription>
                      Scan this QR code to access the download link.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center py-4">
                    <QRCode value={downloadLink} size={256} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-pink-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                End-to-end encrypted
              </span>
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-pink-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure file storage
              </span>
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-pink-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Timed file deletion
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-6">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <div
              className="w-full h-64 border-2 border-dashed border-pink-500 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-700/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange({
                  target: { files: e.dataTransfer.files },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              <div className="text-center">
                {files && files.length > 0 ? (
                  <p className="text-gray-300 text-lg">
                    {files.length} file{files.length > 1 ? "s" : ""} selected
                  </p>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-pink-500" />
                    <p className="mt-2 text-sm text-gray-300">
                      Drag and drop files here or click to select
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300 text-lg">Delete after:</Label>
              <Select value={expiryTime} onValueChange={setExpiryTime}>
                <SelectTrigger className="w-2/4 bg-gray-700 bg-opacity-50 border-gray-600">
                  <SelectValue placeholder="Delete file after" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 Minute</SelectItem>
                  <SelectItem value="300">5 Minutes</SelectItem>
                  <SelectItem value="3600">1 Hour</SelectItem>
                  <SelectItem value="86400">24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Label className="text-gray-300 text-lg">Download limit:</Label>
              <Select defaultValue={downloadLimit} onValueChange={setDownloadLimit}>
                <SelectTrigger className="w-2/4 bg-gray-700 bg-opacity-50 border-gray-600">
                  <SelectValue placeholder="Set download limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Download</SelectItem>
                  <SelectItem value="5">5 Downloads</SelectItem>
                  <SelectItem value="10">10 Downloads</SelectItem>
                  <SelectItem value="20">20 Downloads</SelectItem>
                  <SelectItem value="50">50 Downloads</SelectItem>
                  <SelectItem value="100">100 Downloads</SelectItem>
                  <SelectItem value="500">500 Downloads</SelectItem>
                  <SelectItem value="1000">1000 Downloads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Label className="text-gray-300 text-lg" htmlFor="customShortUrl">
                Custom Short URL (optional):{" "}
              </Label>
              <Input
                id="customShortUrl"
                placeholder="Enter custom short URL (e.g. my-files)"
                value={customShortUrl}
                onChange={(e) => setCustomShortUrl(e.target.value)}
                className="w-2/4 bg-gray-700 bg-opacity-50 border-gray-600"
              />
            </div>
            {uploadStatus && <p>{uploadStatus}</p>}
            <Button
              onClick={zipAndEncryptFiles}
              className="w-full text-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-300"
              disabled={!files || files.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Files"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  </main>
</div>
  );
};

export default FileUpload;
