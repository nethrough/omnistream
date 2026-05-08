import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:imdbId" element={<Watch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
