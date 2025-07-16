import React, { useState, useRef, useEffect } from 'react';
import API_CONFIG from '../config';

const FaceSearch = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState('camera'); // 'camera' or 'upload'

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Cannot access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const captureAndSearch = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setSearching(true);
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // แปลง Canvas เป็น Blob แล้วส่งไป FormData
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas');
        setSearching(false);
        return;
      }

      const formData = new FormData();
      formData.append('face', blob, 'face.jpg');
      
      try {
        const response = await fetch(API_CONFIG.API_ENDPOINTS.FACE_SEARCH, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const results = await response.json();
          setSearchResults(Array.isArray(results) ? results : []);
        } else {
          const errorData = await response.json();
          alert(`Face search failed: ${errorData.message || 'Unknown error'}`);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching faces:', error);
        alert('Face search failed: Network error');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ตรวจสอบว่าเป็นไฟล์รูปภาพ
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSearching(true);
    
    const formData = new FormData();
    formData.append('face', file);
    
    try {
      const response = await fetch(API_CONFIG.API_ENDPOINTS.FACE_SEARCH, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(Array.isArray(results) ? results : []);
      } else {
        const errorData = await response.json();
        alert(`Face search failed: ${errorData.message || 'Unknown error'}`);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching faces:', error);
      alert('Face search failed: Network error');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const downloadPhoto = async (photoId, filename) => {
    try {
      const response = await fetch(API_CONFIG.API_ENDPOINTS.PHOTO_DOWNLOAD(photoId));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading photo:', error);
      alert('Failed to download photo');
    }
  };

  const deletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(API_CONFIG.API_ENDPOINTS.PHOTO_DELETE(photoId), {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh search results
        await captureAndSearch();
        alert('Photo deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete photo: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo: Network error');
    }
  };

  return (
    <div className="face-search">
      <div className="search-container">
        <h1>Face Search</h1>
        <p>Search for similar faces in your photo gallery using webcam or upload an image</p>
        
        {/* Search Mode Toggle */}
        <div className="search-mode-toggle">
          <button 
            className={`mode-btn ${searchMode === 'camera' ? 'active' : ''}`}
            onClick={() => setSearchMode('camera')}
          >
            📹 Camera Search
          </button>
          <button 
            className={`mode-btn ${searchMode === 'upload' ? 'active' : ''}`}
            onClick={() => setSearchMode('upload')}
          >
            📁 Upload Image
          </button>
        </div>

        {/* Camera Search Section */}
        {searchMode === 'camera' && (
          <div className="camera-section">
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-video"
              />
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="camera-controls">
              {!isStreaming ? (
                <button className="camera-btn start" onClick={startCamera}>
                  📹 Start Camera
                </button>
              ) : (
                <>
                  <button className="camera-btn stop" onClick={stopCamera}>
                    ⏹️ Stop Camera
                  </button>
                  <button 
                    className="camera-btn capture" 
                    onClick={captureAndSearch}
                    disabled={searching}
                  >
                    {searching ? '🔍 Searching...' : '🔍 Search Faces'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Upload Image Section */}
        {searchMode === 'upload' && (
          <div className="upload-section">
            <div className="upload-container-face">
              <div className="upload-icon">📤</div>
              <h3>Upload an Image to Search</h3>
              <p>Select a photo containing the face you want to search for</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              
              <button 
                className="upload-btn-face" 
                onClick={triggerFileUpload}
                disabled={searching}
              >
                {searching ? '🔍 Searching...' : '📁 Choose Image'}
              </button>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="search-results">
            <h2>Search Results ({searchResults.length} photos found)</h2>
            <div className="results-grid">
              {searchResults.map((photo) => (
                <div key={photo.id} className="result-item">
                  <img 
                    src={API_CONFIG.API_ENDPOINTS.UPLOADS(photo.filename)} 
                    alt={photo.original_name}
                    className="result-image"
                  />
                  <div className="result-overlay">
                    <button 
                      className="download-btn"
                      onClick={() => downloadPhoto(photo.id, photo.original_name)}
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceSearch;