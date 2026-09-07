import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Utensils, ChevronLeft, ChevronRight } from 'lucide-react';

export const Sidebar = ({ daraltildi, setDaraltildi }) => {
  const location = useLocation();

  return (
    <aside
      className={`hidden lg:flex lg:flex-col bg-slate-900 text-white min-h-screen p-4 justify-between transition-all duration-300 ease-in-out shrink-0 z-30 ${
        daraltildi ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo ve Daralt/Aç Butonu */}
        <div className="flex items-center justify-between mb-8 mt-2 px-1">
          {!daraltildi && (
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">BTSO SEÇİM</h1>
              <p className="text-slate-400 text-xs mt-1 font-medium">Operasyon Paneli</p>
            </div>
          )}

          <button
            onClick={() => setDaraltildi(!daraltildi)}
            className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              daraltildi ? 'mx-auto' : ''
            }`}
            title={daraltildi ? "Menüyü Genişlet" : "Menüyü Daralt"}
          >
            {daraltildi ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Menü Linkleri */}
        <nav className="space-y-2">
          <Link
            to="/kayit"
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              location.pathname === '/kayit' || location.pathname === '/'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            } ${daraltildi ? 'justify-center' : ''}`}
            title="Kayıt Masası"
          >
            <Users size={20} className="shrink-0" />
            {!daraltildi && <span className="font-medium text-sm">Kayıt Masası</span>}
          </Link>

          <Link
            to="/yemek"
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              location.pathname === '/yemek'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            } ${daraltildi ? 'justify-center' : ''}`}
            title="Yemek Organizasyonu"
          >
            <Utensils size={20} className="shrink-0" />
            {!daraltildi && <span className="font-medium text-sm">Yemek Organizasyonu</span>}
          </Link>
        </nav>
      </div>

      {/* Alt Bilgi */}
      <div className="border-t border-slate-800 pt-4 text-center">
        {!daraltildi ? (
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">1. Komite Sandık Masası</span>
        ) : (
          <span className="text-[10px] text-slate-500 font-bold">1.K</span>
        )}
      </div>
    </aside>
  );
};