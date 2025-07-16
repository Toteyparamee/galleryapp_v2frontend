import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import API_CONFIG from '../config';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(API_CONFIG.API_ENDPOINTS.PHOTOS);
      const data = await response.json();
      setPhotos(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  };

  const downloadPhoto = async (photoId, filename) => {
    try {
      const response = await fetch(API_CONFIG.API_ENDPOINTS.PHOTO_DOWNLOAD(photoId));
      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  const deletePhotos = async (photoIds) => {
    try {
      const deletePromises = photoIds.map(id => 
        fetch(API_CONFIG.API_ENDPOINTS.PHOTO_DELETE(id), { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      // Remove photos from state
      setPhotos(photos.filter(photo => !photoIds.includes(photo.id)));
      setSelectedPhotos(new Set());
      setIsSelectionMode(false);
      setShowDeleteConfirm(false);
      
      alert(`${photoIds.length} photo(s) deleted successfully!`);
    } catch (error) {
      console.error('Error deleting photos:', error);
      alert('Failed to delete photos');
    }
  };

  const togglePhotoSelection = (photoId) => {
    if (!isSelectionMode) return;
    
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const selectAllPhotos = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)));
    }
  };

  const startSelection = () => {
    setIsSelectionMode(true);
    setSelectedPhotos(new Set());
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedPhotos(new Set());
  };

  const confirmDelete = () => {
    if (selectedPhotos.size === 0) {
      alert('Please select photos to delete');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const openModal = (photo) => {
    if (isSelectionMode) {
      togglePhotoSelection(photo.id);
      return;
    }
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading photos...</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h1>My Photo Gallery</h1>
        <p>{photos.length} photos</p>
        
        <div className="gallery-actions">
          {!isSelectionMode ? (
            <button className="action-btn delete-mode-btn" onClick={startSelection}>
              🗑️ Delete Photos
            </button>
          ) : (
            <div className="selection-controls">
              <button className="action-btn select-all-btn" onClick={selectAllPhotos}>
                {selectedPhotos.size === photos.length ? '❌ Deselect All' : '✅ Select All'}
              </button>
              <button 
                className="action-btn confirm-delete-btn" 
                onClick={confirmDelete}
                disabled={selectedPhotos.size === 0}
              >
                🗑️ Delete ({selectedPhotos.size})
              </button>
              <button className="action-btn cancel-btn" onClick={cancelSelection}>
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="photo-grid">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className={`photo-item ${isSelectionMode ? 'selection-mode' : ''} ${selectedPhotos.has(photo.id) ? 'selected' : ''}`}
            onClick={() => openModal(photo)}
          >
            {isSelectionMode && (
              <div className="selection-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedPhotos.has(photo.id)}
                  onChange={() => togglePhotoSelection(photo.id)}
                />
              </div>
            )}
            <img 
              src={API_CONFIG.API_ENDPOINTS.UPLOADS(photo.filename)} 
              alt={photo.original_name}
              className="photo-thumbnail"
            />
            {!isSelectionMode && (
              <div className="photo-overlay">
                <button 
                  className="download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadPhoto(photo.id, photo.original_name);
                  }}
                >
                  ⬇️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <img 
              src={API_CONFIG.API_ENDPOINTS.UPLOADS(selectedPhoto.filename)} 
              alt={selectedPhoto.original_name}
              className="modal-image"
            />
            <div className="modal-footer">
              <h3>{selectedPhoto.original_name}</h3>
              <button 
                className="download-btn-large"
                onClick={() => downloadPhoto(selectedPhoto.id, selectedPhoto.original_name)}
              >
                📥 Download Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal delete-confirm-modal" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content delete-confirm-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-header">
              <h2>⚠️ Confirm Delete</h2>
              <span className="close" onClick={() => setShowDeleteConfirm(false)}>&times;</span>
            </div>
            
            <div className="delete-confirm-body">
              <p>Are you sure you want to delete <strong>{selectedPhotos.size}</strong> photo(s)?</p>
              <p className="warning-text">This action cannot be undone!</p>
              
              <div className="selected-photos-preview">
                {Array.from(selectedPhotos).slice(0, 6).map(photoId => {
                  const photo = photos.find(p => p.id === photoId);
                  return photo ? (
                    <img 
                      key={photo.id}
                      src={API_CONFIG.API_ENDPOINTS.UPLOADS(photo.filename)} 
                      alt={photo.original_name}
                      className="preview-thumbnail"
                    />
                  ) : null;
                })}
                {selectedPhotos.size > 6 && (
                  <div className="more-photos">+{selectedPhotos.size - 6} more</div>
                )}
              </div>
            </div>
            
            <div className="delete-confirm-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ❌ Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => deletePhotos(Array.from(selectedPhotos))}
              >
                🗑️ Delete {selectedPhotos.size} Photo(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;