import React, { useState } from 'react';
import API_CONFIG from '../config';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch(API_CONFIG.API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Photos uploaded successfully!');
        setFiles([]);
        setUploadProgress(100);
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Upload failed: Network error');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="upload">
      <div className="upload-container">
        <h1>Upload Photos</h1>
        
        <div 
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="upload-icon">📤</div>
          <p>Drag & drop photos here or click to browse</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        {files.length > 0 && (
          <div className="file-list">
            <h3>Selected Files ({files.length})</h3>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <button 
                  className="remove-btn"
                  onClick={() => removeFile(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button 
          className="upload-btn"
          onClick={uploadFiles}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} Photos`}
        </button>
      </div>
    </div>
  );
};

export default Upload;