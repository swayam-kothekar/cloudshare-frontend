import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
// import { Progress } from "@/components/ui/progress"

type FileWithPreview = File & {
  preview: string;
};

const Component: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => 
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      )
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (file: FileWithPreview) => {
    setFiles(prevFiles => prevFiles.filter(f => f !== file));
    URL.revokeObjectURL(file.preview);
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <div {...getRootProps()} className="text-center p-4 cursor-pointer">
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-1 text-sm text-gray-600">
          {isDragActive
            ? "Drop the files here ..."
            : "Drag 'n' drop files here, or click to select files"}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li key={file.name} className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <div className="flex items-center space-x-2">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-10 w-10 object-cover rounded"
                  onLoad={() => URL.revokeObjectURL(file.preview)}
                />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* <Progress value={33} className="w-24" /> */}
                <button
                  onClick={() => removeFile(file)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Component;