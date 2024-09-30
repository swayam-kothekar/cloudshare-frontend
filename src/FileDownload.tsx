import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import JSZip from "jszip";
import { Button } from "./components/ui/button";
import { Cloud, Download, File, UploadCloud } from "lucide-react";
import { Card, CardContent } from "./components/ui/card";
import { QRCode } from "react-qrcode-logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface ExtractedFile {
  name: string;
  file: Blob;
}

interface DecryptedFile {
  blob: Blob;
  fileName: string;
}

const FileDownload: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [downloadLink, setDownloadLink] = useState<string>("");
  const [buttonText, setButtonText] = useState("Copy Link");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    handleDownload();
  }, [location]);

  useEffect(() => {
    setDownloadLink(window.location.href);
  }, []);

  const base64ToUint8Array = (base64: string): Uint8Array => {
    base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const binaryString = atob(base64);
    return new Uint8Array(binaryString.length).map((_, i) =>
      binaryString.charCodeAt(i)
    );
  };

  const decryptFile = async (
    encryptedBlob: Blob,
    key: Uint8Array
  ): Promise<DecryptedFile> => {
    const encryptedArrayBuffer = await encryptedBlob.arrayBuffer();
    const iv = encryptedArrayBuffer.slice(0, 12);
    const data = encryptedArrayBuffer.slice(12);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
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
      fileName: metadata.name,
    };
  };

  const extractZip = async (zipBlob: Blob): Promise<void> => {
    try {
      const zip = await JSZip.loadAsync(zipBlob);
      const files: ExtractedFile[] = [];

      for (const fileName of Object.keys(zip.files)) {
        const fileData = await zip.files[fileName].async("blob");
        files.push({ name: fileName, file: fileData });
      }

      setExtractedFiles(files);
    } catch (err) {
      console.error("Failed to extract ZIP file:", err);
      setStatus(
        `Failed to extract ZIP file: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const handleDownload = async (): Promise<void> => {
    const params = new URLSearchParams(window.location.search);
    const finalUrl = params.get("url");
    const key = params.get("key");

    if (!finalUrl) {
      setStatus("No download URL provided");
      return;
    }

    try {
      const url = new URL(finalUrl);

      const downloadUrl =
        url.origin + url.pathname + url.search.split("&encryptionKey=")[0];
      console.log("GetObject Link:" + downloadUrl);
      const encodedKey = key;

      if (!encodedKey) {
        throw new Error("Encryption key not found in URL");
      }

      setStatus("Loading Files...");
      const response = await axios.get<Blob>(downloadUrl, {
        responseType: "blob",
      });

      setStatus("Decrypting file...");
      const decryptionKey = base64ToUint8Array(encodedKey);
      const { blob: decryptedBlob } = await decryptFile(
        response.data,
        decryptionKey
      );

      setStatus("Extracting files...");
      await extractZip(decryptedBlob);

      setStatus("Files extracted successfully!");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        console.error("File download or decryption failed:", err.message);
        setStatus("Oops! Download Link Expired or File Deleted");
      } else {
        console.error("File download or decryption failed:", err);
        setStatus(
          `File download or decryption failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  };

  const downloadFile = (file: ExtractedFile): void => {
    const url = window.URL.createObjectURL(file.file);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadAllFiles = async (): Promise<void> => {
    try {
      const zip = new JSZip();
      extractedFiles.forEach((file) => {
        zip.file(file.name, file.file);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "files.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to create ZIP:", err);
      setStatus(
        `Failed to create ZIP: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(downloadLink)
      .then(() => {
        setButtonText("Link Copied!");
        setTimeout(() => setButtonText("Copy Link"), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        setButtonText("Failed to copy");
        setTimeout(() => setButtonText("Copy Link"), 2000);
      });
  };

  return (
  //   <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 flex flex-col">
  //     <header className="p-6 flex justify-between items-center bg-gray-800 bg-opacity-50 backdrop-blur-sm">
  //       <div className="flex items-center space-x-3">
  //         <Cloud className="h-10 w-10 text-teal-400" />
  //         <span className="text-2xl font-bold text-teal-400">CloudShare</span>
  //       </div>
  //     </header>

  //     <div className="absolute inset-0 overflow-hidden pointer-events-none">
  //       <svg
  //         className="absolute bottom-0 left-0 w-full"
  //         viewBox="0 0 1440 320"
  //         preserveAspectRatio="none"
  //       >
  //         <path
  //           fill="rgba(16, 185, 129, 0.05)"
  //           fillOpacity="1"
  //           d="M0,32L48,80C96,128,192,224,288,229.3C384,235,480,149,576,128C672,107,768,149,864,154.7C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
  //         ></path>
  //       </svg>
  //     </div>

  //     <main className="flex-grow flex items-center justify-center p-6 relative">
  //       <Card className="w-full max-w-6xl bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
  //         <CardContent className="p-10">
  //           <div className="flex flex-col md:flex-row gap-10">
  //           <div className="w-full max-w-xl mx-auto">
  //   <h2 className="text-3xl font-semibold mb-6 text-teal-300">
  //     Your Files
  //   </h2>
  //   {extractedFiles.length > 0 && (
  //     <div className="space-y-4">
  //       <ul className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
  //         {extractedFiles.map((file, index) => (
  //           <li
  //             key={index}
  //             className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-4 rounded-xl hover:bg-opacity-70 transition-all duration-200 cursor-pointer group w-full"
  //             onClick={() => downloadFile(file)}
  //           >
  //             <span className="flex truncate mr-3 text-gray-300 group-hover:text-white transition-colors duration-200">
  //             <File  className="mr-2 h-5 w-5" />
  //               {file.name}
  //             </span>
  //             <Download className="h-5 w-5 flex-shrink-0 text-teal-500 group-hover:text-teal-400 transition-colors duration-200" />
  //           </li>
  //         ))}
  //       </ul>
  //       <Button
  //         onClick={downloadAllFiles}
  //         className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 text-lg flex items-center justify-center"
  //       >
  //         <Download className="mr-2 h-5 w-5" /> Download All
  //       </Button>
  //     </div>
  //   )}
  //   {status && (
  //     <p className="text-teal-400 mt-6 text-center">{status}</p>
  //   )}
  // </div>

  //             <div className="w-full border-t md:border-l md:border-t-0 md:w-1/2 space-y-6  pt-6 md:pt-0 md:pl-10">
  //               <h1 className="text-5xl font-bold mb-2 text-teal-400">
  //                 You've Got Files!
  //               </h1>
  //               <p className="text-2xl mb-4 text-gray-300">
  //                 Your secure files are ready for download.
  //               </p>
  //               <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl shadow-inner">
  //                 <h3 className="text-xl font-semibold mb-3 text-teal-300">
  //                   End-to-End Encryption
  //                 </h3>
  //                 <p className="text-gray-300">
  //                   Our state-of-the-art encryption ensures your files remain
  //                   private and secure throughout the entire transfer process.
  //                 </p>
  //               </div>

  //               <div className="space-y-4">
  //                 <h2 className="text-2xl font-semibold text-teal-300">
  //                   Share Again
  //                 </h2>
  //                 <div className="flex items-center space-x-2 bg-gray-700 bg-opacity-50 p-3 rounded-xl">
  //                   <input
  //                     type="text"
  //                     value={window.location.href}
  //                     readOnly
  //                     className="flex-grow bg-transparent border-none focus:outline-none text-gray-300"
  //                   />
  //                 </div>
  //                 <div className="flex space-x-4">
  //                   <Button
  //                     onClick={copyLinkToClipboard}
  //                     className="flex-1 bg-teal-500 hover:bg-teal-600"
  //                   >
  //                     {buttonText}
  //                   </Button>
  //                   <Dialog>
  //                     <DialogTrigger asChild>
  //                       <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
  //                         Show QR Code
  //                       </Button>
  //                     </DialogTrigger>
  //                     <DialogContent className="sm:max-w-md">
  //                       <DialogHeader>
  //                         <DialogTitle>QR Code for Download Link</DialogTitle>
  //                         <DialogDescription>
  //                           Scan this QR code to access the download link.
  //                         </DialogDescription>
  //                       </DialogHeader>
  //                       <div className="flex justify-center py-4">
  //                         <QRCode value={downloadLink} size={256} />
  //                       </div>
  //                     </DialogContent>
  //                   </Dialog>
  //                 </div>
  //               </div>

  //               <Button
  //                 variant="outline"
  //                 onClick={() => navigate("/upload")}
  //                 className="bg-teal-500 hover:bg-teal-600 text-white w-full py-3 text-lg"
  //               >
  //                 <UploadCloud className="mr-2 h-5 w-5" /> Upload More Files
  //               </Button>
  //             </div>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </main>
  //   </div>

<div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 flex flex-col">
      <header className="p-6 flex justify-between items-center bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Cloud className="h-10 w-10 text-pink-400" />
          <span className="text-2xl font-bold text-pink-400">CloudShare</span>
        </div>
      </header>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="rgba(219, 39, 119, 0.05)"
            fillOpacity="1"
            d="M0,32L48,80C96,128,192,224,288,229.3C384,235,480,149,576,128C672,107,768,149,864,154.7C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <main className="flex-grow flex items-center justify-center p-6 relative">
        <Card className="w-full max-w-6xl bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="p-10">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-full max-w-xl mx-auto">
                <h2 className="text-3xl font-semibold mb-6 text-pink-300">Your Files</h2>
                {extractedFiles.length > 0 && (
                  <div className="space-y-4">
                    <ul className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                      {extractedFiles.map((file, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-4 rounded-xl hover:bg-opacity-70 transition-all duration-200 cursor-pointer group w-full"
                          onClick={() => downloadFile(file)}
                        >
                          <span className="flex truncate mr-3 text-gray-300 group-hover:text-white transition-colors duration-200">
                            <File className="mr-2 h-5 w-5" />
                            {file.name}
                          </span>
                          <Download className="h-5 w-5 flex-shrink-0 text-pink-500 group-hover:text-pink-400 transition-colors duration-200" />
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={downloadAllFiles}
                      className="w-full py-4 text-lg flex items-center justify-center"
                    >
                      <Download className="mr-2 h-5 w-5" /> Download All
                    </Button>
                  </div>
                )}
                {status && <p className="text-pink-400 mt-6 text-center">{status}</p>}
              </div>

              <div className="w-full border-t md:border-l md:border-t-0 md:w-1/2 space-y-6 pt-6 md:pt-0 md:pl-10">
                <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  You've Got Files!
                </h1>
                <p className="text-2xl mb-4 font-semibold text-blue-300">Your secure files are ready for download.</p>
                <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl shadow-inner">
                  <h3 className="text-xl font-semibold mb-3 text-blue-300">End-to-End Encryption</h3>
                  <p className="text-gray-300">
                    Our state-of-the-art encryption ensures your files remain private and secure throughout the entire transfer process.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-blue-300">Share Again</h2>
                  <div className="flex items-center space-x-2 bg-gray-700 bg-opacity-50 p-3 rounded-xl">
                    <input
                      type="text"
                      value={window.location.href}
                      readOnly
                      className="flex-grow bg-transparent border-none focus:outline-none text-gray-300"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      onClick={copyLinkToClipboard} 
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
                          <DialogDescription>Scan this QR code to access the download link.</DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center py-4">
                          <QRCode value={downloadLink} size={256} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate("/upload")}
                  className="bg-purple-500 hover:bg-purple-600 text-white w-full py-3 text-lg"
                >
                  <UploadCloud className="mr-2 h-5 w-5" /> Upload More Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
);
};

export default FileDownload;
