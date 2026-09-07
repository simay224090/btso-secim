import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { KayitMasasi } from './components/KayitMasasi';
import { YemekOrganizasyonu } from './components/YemekOrganizasyonu';

function App() {
  const [daraltildi, setDaraltildi] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
        {/* Açılır / Kapanır Sidebar */}
        <Sidebar daraltildi={daraltildi} setDaraltildi={setDaraltildi} />
        
        {/* Menü kapandığında genişleyen ve içeriği tam ortalayan ana alan */}
        <div className="flex-1 overflow-auto transition-all duration-300">
          <Routes>
            <Route path="/" element={<KayitMasasi />} />
            <Route path="/kayit" element={<KayitMasasi />} />
            <Route path="/yemek" element={<YemekOrganizasyonu />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;