import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaginaVenta from './pages/PaginaVenta';
import PaginaFactura from './pages/PaginaFactura';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaginaVenta />} />
        <Route path="/factura/:id" element={<PaginaFactura />} />
      </Routes>
    </Router>
  );
}

export default App;