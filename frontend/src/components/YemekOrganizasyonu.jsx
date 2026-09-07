import React, { useEffect, useState, useRef } from 'react';
import { 
  Search, Download, Utensils, CheckCircle2, RotateCcw, 
  Building2, Phone, User, Check, X, PhoneCall, PhoneOff,
  Clock, AlertCircle, CalendarCheck, Loader2, Edit3, Save, ChevronDown
} from 'lucide-react';
import { getFirmalar, updateFirmaDurumu } from '../services/api';

export const YemekOrganizasyonu = () => {
  const [firmalar, setFirmalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemdekiId, setIslemdekiId] = useState(null);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliKomite, setSeciliKomite] = useState('1');
  const [aktifFiltre, setAktifFiltre] = useState('tum');
  const [dropdownAcik, setDropdownAcik] = useState(false);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [geciciForm, setGeciciForm] = useState({});

  const dropdownRef = useRef(null);

  const verileriGetir = async () => {
    try {
      setYukleniyor(true);
      const data = await getFirmalar(seciliKomite);
      setFirmalar(data);
    } catch (error) {
      console.error("Yemek listesi yüklenirken hata:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriGetir();
  }, [seciliKomite]);

  // Dropdown dışı tıklamada menüyü kapat
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAcik(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fiili Katılım (Etkinlik Günü Kapı Girişi)
  const handleFiiliKatilimDegistir = async (firma) => {
    const suankiKatilim = !!firma.yemekFiiliKatilim;
    const yeniKatilim = !suankiKatilim;

    setIslemdekiId(firma.id);
    try {
      const guncelVeri = {
        ...firma,
        yemekFiiliKatilim: yeniKatilim,
        // Eğer fiilen geldiyse teyit durumunu da Katılacak yapalım
        yemekTeyitDurumu: yeniKatilim ? 'Katılacak' : (firma.yemekTeyitDurumu || 'Belirsiz')
      };

      await updateFirmaDurumu(firma.id, guncelVeri);
      setFirmalar(prev => prev.map(f => f.id === firma.id ? guncelVeri : f));
    } catch (error) {
      console.error("Yemek katılımı güncellenemedi:", error);
      alert("Katılım durumu güncellenirken hata oluştu!");
    } finally {
      setIslemdekiId(null);
    }
  };

  const duzenlemeyiBaslat = (firma) => {
    setDuzenlenenId(firma.id);
    setGeciciForm({
      yemekAramaDurumu: firma.yemekAramaDurumu || 'Bekliyor',
      yemekTeyitDurumu: firma.yemekTeyitDurumu || 'Belirsiz'
    });
  };

  const duzenlemeyiKaydet = async (firma) => {
    try {
      const guncelVeri = {
        ...firma,
        yemekAramaDurumu: geciciForm.yemekAramaDurumu,
        yemekTeyitDurumu: geciciForm.yemekTeyitDurumu
      };

      await updateFirmaDurumu(firma.id, guncelVeri);
      setFirmalar(prev => prev.map(f => f.id === firma.id ? guncelVeri : f));
      setDuzenlenenId(null);
    } catch (error) {
      console.error("Yemek organizasyonu güncellenemedi:", error);
      alert("Kayıt başarısız!");
    }
  };

  // Dinamik Metrik Hesaplamaları
  const toplamFirma = firmalar.length;
  const katilacakSayisi = firmalar.filter(f => f.yemekTeyitDurumu === 'Katılacak').length;
  const katilmayacakSayisi = firmalar.filter(f => f.yemekTeyitDurumu === 'Katılmayacak').length;
  const belirsizSayisi = firmalar.filter(f => !f.yemekTeyitDurumu || f.yemekTeyitDurumu === 'Belirsiz').length;

  const ulasildiSayisi = firmalar.filter(f => f.yemekAramaDurumu === 'Ulaşıldı').length;
  const ulasilamadiSayisi = firmalar.filter(f => f.yemekAramaDurumu === 'Ulaşılamadı').length;
  const aramaBekleyenSayisi = firmalar.filter(f => !f.yemekAramaDurumu || f.yemekAramaDurumu === 'Bekliyor').length;

  const fiiliKatilanSayisi = firmalar.filter(f => f.yemekFiiliKatilim === true).length;

  // Filtreleme ve Türkçe A-Z Sıralama
  const filtrelenmisFirmalar = firmalar
    .filter(f => {
      const arama = 
        (f.firmaAdi && f.firmaAdi.toLowerCase().includes(aramaMetni.toLowerCase())) ||
        (f.yetkiliIsim && f.yetkiliIsim.toLowerCase().includes(aramaMetni.toLowerCase())) ||
        (f.sicilNo && f.sicilNo.toLowerCase().includes(aramaMetni.toLowerCase())) ||
        (f.yetkiliTelefon && f.yetkiliTelefon.includes(aramaMetni));

      if (!arama) return false;

      if (aktifFiltre === 'katilacak') return f.yemekTeyitDurumu === 'Katılacak';
      if (aktifFiltre === 'katilmayacak') return f.yemekTeyitDurumu === 'Katılmayacak';
      if (aktifFiltre === 'fiili') return f.yemekFiiliKatilim === true;
      if (aktifFiltre === 'ulasildi') return f.yemekAramaDurumu === 'Ulaşıldı';
      if (aktifFiltre === 'ulasilamadi') return f.yemekAramaDurumu === 'Ulaşılamadı';
      if (aktifFiltre === 'aramaBekliyor') return !f.yemekAramaDurumu || f.yemekAramaDurumu === 'Bekliyor';

      return true; // 'tum'
    })
    .sort((a, b) => (a.firmaAdi || '').localeCompare(b.firmaAdi || '', 'tr'));

  const getFiltreEtiketi = () => {
    switch (aktifFiltre) {
      case 'ulasildi': return { baslik: 'Ulaşıldı', sayi: ulasildiSayisi };
      case 'ulasilamadi': return { baslik: 'Ulaşılamadı', sayi: ulasilamadiSayisi };
      case 'aramaBekliyor': return { baslik: 'Arama Bekleyen', sayi: aramaBekleyenSayisi };
      case 'katilmayacak': return { baslik: 'Katılmayacak', sayi: katilmayacakSayisi };
      default: return { baslik: 'Tümü', sayi: toplamFirma };
    }
  };

  const suankiFiltre = getFiltreEtiketi();

  return (
    <div className="p-8 max-w-[1600px] w-full mx-auto">
      {/* Üst Başlık */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            BTSO Seçim Lobi & Sosyal Takip
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Yemek Organizasyonu Yönetimi</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">Üyelerin arama teyitlerini takip edin, katılacak kişi sayısını ve fiili yemek girişlerini anlık yönetin.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all text-sm">
            <Download size={16} className="text-slate-500" />
            Yemek Listesi Raporu
          </button>
        </div>
      </div>

      {/* METRİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Toplam Davetli</span>
            <div className="text-3xl font-black text-slate-800 mt-2">{toplamFirma}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/80 flex items-center justify-between relative overflow-hidden">
          <div>
            <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">Teyitli Katılacak</span>
            <div className="text-3xl font-black text-amber-700 mt-2">{katilacakSayisi}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <CalendarCheck size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100/80 flex items-center justify-between relative overflow-hidden">
          <div>
            <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Fiili Katılan (Kapı)</span>
            <div className="text-3xl font-black text-emerald-700 mt-2">{fiiliKatilanSayisi}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Utensils size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100/80 flex items-center justify-between">
          <div>
            <span className="text-rose-500 text-xs font-bold uppercase tracking-wider">Katılmayacak</span>
            <div className="text-3xl font-black text-rose-600 mt-2">{katilmayacakSayisi}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <X size={22} />
          </div>
        </div>
      </div>

      {/* ARAMA VE KİLİTLENMİŞ TEK SATIR FİLTRELER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible mb-6">
        <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white rounded-t-2xl">
          
          {/* Arama Inputu */}
          <div className="relative w-full xl:w-[380px] shrink-0">
            <input 
              type="text" 
              placeholder="Firma, yetkili veya telefon ara..." 
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
            />
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={15} />
          </div>

          {/* Filtre Butonları */}
          <div className="flex items-center gap-2 overflow-x-auto xl:overflow-visible pb-1 xl:pb-0 shrink-0">
            
            {/* Tümü & Detay Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setDropdownAcik(!dropdownAcik)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs shrink-0 ${
                  ['ulasildi', 'ulasilamadi', 'aramaBekliyor', 'katilmayacak', 'tum'].includes(aktifFiltre) && aktifFiltre !== 'katilacak' && aktifFiltre !== 'fiili'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{suankiFiltre.baslik}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  aktifFiltre === 'ulasilamadi' || aktifFiltre === 'katilmayacak' ? 'bg-rose-500 text-white font-bold' :
                  'bg-slate-700 text-white'
                }`}>
                  {suankiFiltre.sayi}
                </span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${dropdownAcik ? 'rotate-180' : ''}`} />
              </button>

              {dropdownAcik && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => { setAktifFiltre('tum'); setDropdownAcik(false); }}
                    className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      aktifFiltre === 'tum' ? 'bg-slate-50 text-amber-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Tüm Davetliler</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">{toplamFirma}</span>
                  </button>

                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">
                    Arama Durumu
                  </div>

                  <button
                    onClick={() => { setAktifFiltre('ulasildi'); setDropdownAcik(false); }}
                    className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      aktifFiltre === 'ulasildi' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-emerald-600"><PhoneCall size={13} /> Ulaşıldı</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{ulasildiSayisi}</span>
                  </button>

                  <button
                    onClick={() => { setAktifFiltre('ulasilamadi'); setDropdownAcik(false); }}
                    className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      aktifFiltre === 'ulasilamadi' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-rose-600"><PhoneOff size={13} /> Ulaşılamadı</span>
                    <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{ulasilamadiSayisi}</span>
                  </button>

                  <button
                    onClick={() => { setAktifFiltre('aramaBekliyor'); setDropdownAcik(false); }}
                    className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      aktifFiltre === 'aramaBekliyor' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-slate-500"><Clock size={13} /> Arama Bekliyor</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{aramaBekleyenSayisi}</span>
                  </button>

                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">
                    Teyit Durumu
                  </div>

                  <button
                    onClick={() => { setAktifFiltre('katilmayacak'); setDropdownAcik(false); }}
                    className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      aktifFiltre === 'katilmayacak' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-rose-600"><X size={13} /> Katılmayacak</span>
                    <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{katilmayacakSayisi}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Katılacaklar Butonu */}
            <button
              onClick={() => { setAktifFiltre('katilacak'); setDropdownAcik(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs shrink-0 ${
                aktifFiltre === 'katilacak' 
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                  : 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              Katılacak
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${aktifFiltre === 'katilacak' ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900'}`}>
                {katilacakSayisi}
              </span>
            </button>

            {/* Fiili Katılanlar Butonu */}
            <button
              onClick={() => { setAktifFiltre('fiili'); setDropdownAcik(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs shrink-0 ${
                aktifFiltre === 'fiili' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-emerald-50/70 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Fiili Katılan
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${aktifFiltre === 'fiili' ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
                {fiiliKatilanSayisi}
              </span>
            </button>

            {/* Komite Seçimi */}
            <select 
              value={seciliKomite}
              onChange={(e) => setSeciliKomite(e.target.value)}
              className="bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs shrink-0 cursor-pointer shadow-2xs"
            >
              <option value="1">1. Komite</option>
              <option value="46">46. Komite</option>
            </select>

          </div>

        </div>

        {/* TABLO */}
        <div className="overflow-x-auto">
          {yukleniyor ? (
            <div className="p-16 text-center text-slate-400 font-medium flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-amber-600" size={28} />
              <span>Yemek listesi yükleniyor...</span>
            </div>
          ) : filtrelenmisFirmalar.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">Aradığınız kriterlere uygun kayıt bulunamadı.</div>
          ) : (
            <table className="w-full text-left text-sm table-auto">
              <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-[28%]">Firma & Sicil No</th>
                  <th className="px-6 py-4 w-[20%]">Yetkili İletişim</th>
                  <th className="px-6 py-4 text-center w-[12%]">Evrak Durumu</th>
                  <th className="px-6 py-4 text-center w-[13%]">Arama Durumu</th>
                  <th className="px-6 py-4 text-center w-[13%]">Teyit Durumu</th>
                  <th className="px-6 py-4 text-right w-[14%]">Fiili Katılım</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-normal">
                {filtrelenmisFirmalar.map((firma) => {
                  const katildiMi = !!firma.yemekFiiliKatilim;
                  const duzenleniyorMu = duzenlenenId === firma.id;
                  const islemdeMi = islemdekiId === firma.id;
                  const aramaDurumu = firma.yemekAramaDurumu || 'Bekliyor';
                  const teyitDurumu = firma.yemekTeyitDurumu || 'Belirsiz';
                  const evrak = firma.evrakDurumu?.trim() || 'Evrak alınmadı';

                  return (
                    <tr key={firma.id} className={`transition-all duration-150 ${katildiMi ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'hover:bg-slate-50/60'}`}>
                      
                      {/* Firma & Sicil */}
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-slate-900 text-sm flex items-start gap-2 break-words">
                          <Building2 size={16} className={`shrink-0 mt-0.5 ${katildiMi ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span>{firma.firmaAdi}</span>
                        </div>
                        <div className="text-slate-400 text-xs mt-1 pl-6 font-medium">Sicil No: <span className="text-slate-600 font-semibold">{firma.sicilNo}</span></div>
                      </td>

                      {/* Yetkili & Telefon */}
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-700 flex items-start gap-1.5 text-xs break-words">
                          <User size={13} className="text-slate-400 shrink-0 mt-0.5" />
                          <span>{firma.yetkiliIsim || 'Belirtilmemiş'}</span>
                        </div>
                        <div className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5 pl-4 font-medium break-words">
                          {firma.yetkiliTelefon && <Phone size={11} className="text-emerald-500 shrink-0" />}
                          <span>{firma.yetkiliTelefon || 'Telefon yok'}</span>
                        </div>
                      </td>

                      {/* Evrak Durumu */}
                      <td className="px-6 py-4 text-center align-top">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold break-words ${
                          evrak === 'Evrak onaylandı' || evrak === "Evrak BTSO'da" ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          evrak.toLowerCase().includes('sorunlu') ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {evrak}
                        </span>
                      </td>

                      {/* Arama Durumu (Bekliyor, Ulaşıldı, Ulaşılamadı) */}
                      <td className="px-6 py-4 text-center align-top">
                        {duzenleniyorMu ? (
                          <select 
                            value={geciciForm.yemekAramaDurumu}
                            onChange={(e) => setGeciciForm({...geciciForm, yemekAramaDurumu: e.target.value})}
                            className="text-xs font-semibold bg-white border border-amber-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full cursor-pointer"
                          >
                            <option value="Bekliyor">Bekliyor</option>
                            <option value="Ulaşıldı">Ulaşıldı</option>
                            <option value="Ulaşılamadı">Ulaşılamadı</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            aramaDurumu === 'Ulaşıldı' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            aramaDurumu === 'Ulaşılamadı' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {aramaDurumu === 'Ulaşıldı' && <PhoneCall size={11} />}
                            {aramaDurumu === 'Ulaşılamadı' && <PhoneOff size={11} />}
                            {aramaDurumu === 'Bekliyor' && <Clock size={11} />}
                            {aramaDurumu}
                          </span>
                        )}
                      </td>

                      {/* Teyit Durumu (Belirsiz, Katılacak, Katılmayacak) */}
                      <td className="px-6 py-4 text-center align-top">
                        {duzenleniyorMu ? (
                          <select 
                            value={geciciForm.yemekTeyitDurumu}
                            onChange={(e) => setGeciciForm({...geciciForm, yemekTeyitDurumu: e.target.value})}
                            className="text-xs font-semibold bg-white border border-amber-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full cursor-pointer"
                          >
                            <option value="Belirsiz">Belirsiz</option>
                            <option value="Katılacak">Katılacak</option>
                            <option value="Katılmayacak">Katılmayacak</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                            teyitDurumu === 'Katılacak' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            teyitDurumu === 'Katılmayacak' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {teyitDurumu === 'Katılacak' && <Check size={11} />}
                            {teyitDurumu === 'Katılmayacak' && <X size={11} />}
                            {teyitDurumu}
                          </span>
                        )}
                      </td>

                      {/* Düzenle & Fiili Katılım */}
                      <td className="px-6 py-4 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          {duzenleniyorMu ? (
                            <button 
                              onClick={() => duzenlemeyiKaydet(firma)}
                              className="bg-amber-600 text-white hover:bg-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                            >
                              <Save size={13} /> Kaydet
                            </button>
                          ) : (
                            <button 
                              onClick={() => duzenlemeyiBaslat(firma)}
                              className="text-slate-400 hover:text-amber-600 bg-white border border-slate-200 p-1.5 rounded-lg transition-all hover:border-amber-300 shadow-2xs"
                              title="Arama & Teyit Düzenle"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}

                          {katildiMi ? (
                            <button 
                              disabled={islemdeMi}
                              onClick={() => handleFiiliKatilimDegistir(firma)}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 text-xs font-bold bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                              title="Girişi Geri Al"
                            >
                              {islemdeMi ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                              <span>Geri Al</span>
                            </button>
                          ) : (
                            <button 
                              disabled={islemdeMi}
                              onClick={() => handleFiiliKatilimDegistir(firma)}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
                            >
                              {islemdeMi ? <Loader2 size={14} className="animate-spin" /> : <Utensils size={14} />}
                              <span>Katıldı</span>
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};