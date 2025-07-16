const API_CONFIG = {
  // Production URL from Google Cloud Run
  PRODUCTION_URL: 'https://photo-gallery-backend-938933379226.asia-southeast1.run.app',
  
  // Development URL
  DEVELOPMENT_URL: 'http://localhost:3001',
  
  // Get base URL based on environment
  get BASE_URL() {
    // Check for custom environment variable (useful for Vercel)
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // Check if running in development
    if (process.env.NODE_ENV === 'development' || 
        (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
      return this.DEVELOPMENT_URL;
    }
    
    // Default to production URL
    return this.PRODUCTION_URL;
  },
  
  // API endpoints
  get API_ENDPOINTS() {
    return {
      PHOTOS: `${this.BASE_URL}/api/photos`,
      UPLOAD: `${this.BASE_URL}/api/upload`,
      FACE_SEARCH: `${this.BASE_URL}/api/face-search`,
      PHOTO_DOWNLOAD: (id) => `${this.BASE_URL}/api/photos/${id}/download`,
      PHOTO_DELETE: (id) => `${this.BASE_URL}/api/photos/${id}`,
      UPLOADS: (filename) => `${this.BASE_URL}/uploads/${filename}`
    };
  }
};

export default API_CONFIG;