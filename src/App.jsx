import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Gallery from './components/Gallery';
import Upload from './components/Upload';
import FaceSearch from './components/FaceSearch';
import './app.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              📸 Photo Gallery
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Gallery</Link>
              <Link to="/upload" className="nav-link">Upload</Link>
              <Link to="/face-search" className="nav-link">Face Search</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/face-search" element={<FaceSearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
