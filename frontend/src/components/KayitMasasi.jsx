import React, { useEffect, useState, useRef } from 'react';
import {
  Search, Download, CheckCircle2, RotateCcw, Building2, Phone, User,
  ShieldAlert, CheckCircle, Edit3, Save, Loader2, ChevronDown,
  AlertTriangle, Clock, CheckCheck, FileText, FileX, ArrowRightLeft, UserX,
  Menu, X
} from 'lucide-react';
import { getFirmalar, updateFirmaDurumu } from '../services/api';

export const KayitMasasi = () => {
  const [firmalar, setFirmalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemdekiId, setIslemdekiId] = useState(null);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliKomite, setSeciliKomite] = useState('');

  // Filtre seçenekleri
  const [aktifFiltre, setAktifFiltre] = useState('tum');
  const [dropdownAcik, setDropdownAcik] = useState(false);

  // Zimmet sahibine göre filtre (mobil + masaüstü ortak, varsayılan boş olduğu için masaüstünü etkilemez)
  const [zimmetFiltre, setZimmetFiltre] = useState('');

  // Mobil sidebar (drawer) açık/kapalı
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);

  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [geciciForm, setGeciciForm] = useState({});

  const dropdownRef = useRef(null);

  const verileriGetir = async () => {
    try {
      setYukleniyor(true);
      const data = await getFirmalar(seciliKomite);
      setFirmalar(data);
    } catch (error) {
      console.error("Firmalar yüklenirken hata oluştu:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriGetir();
  }, [seciliKomite]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAcik(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleKatilimDegistir = async (firma) => {
    const suankiDurumGeldiMi = !!firma.secimGeldiMi;
    const yeniDurumGeldiMi = !suankiDurumGeldiMi;

    setIslemdekiId(firma.id);
    try {
      const guncelVeri = {
        ...firma,
        secimGeldiMi: yeniDurumGeldiMi,
        zimmet: firma.zimmet || ''
      };

      await updateFirmaDurumu(firma.id, guncelVeri);
      setFirmalar(prev => prev.map(f => f.id === firma.id ? guncelVeri : f));
    } catch (error) {
      console.error("Katılım durumu güncellenemedi:", error);
      alert("Katılım durumu güncellenirken hata oluştu!");
    } finally {
      setIslemdekiId(null);
    }
  };

  const duzenlemeyiBaslat = (firma) => {
    setDuzenlenenId(firma.id);
    setGeciciForm({
      uyeDurumu: firma.uyeDurumu || 'FAAL',
      borcMiktari: firma.borcMiktari !== null && firma.borcMiktari !== undefined ? firma.borcMiktari : 0,
      evrakDurumu: firma.evrakDurumu || 'Evrak alınmadı',
      zimmet: firma.zimmet || ''
    });
  };

  const duzenlemeyiKaydet = async (firma) => {
    try {
      const guvenliBorc = geciciForm.uyeDurumu === 'FAAL' ? 0 : parseFloat(geciciForm.borcMiktari || 0);
      const guncelVeri = {
        ...firma,
        uyeDurumu: geciciForm.uyeDurumu,
        borcMiktari: guvenliBorc,
        evrakDurumu: geciciForm.evrakDurumu,
        zimmet: geciciForm.zimmet
      };

      await updateFirmaDurumu(firma.id, guncelVeri);
      setFirmalar(prev => prev.map(f => f.id === firma.id ? guncelVeri : f));
      setDuzenlenenId(null);
    } catch (error) {
      console.error("Firma güncellenirken hata oluştu:", error);
      alert("Düzenleme kaydedilemedi!");
    }
  };

  // Dinamik Metrik Hesaplamaları
  const toplamFirmaSayisi = firmalar.length;
  const gelenSayisi = firmalar.filter(f => f.secimGeldiMi === true).length;
  const bekleyenSayisi = Math.max(0, toplamFirmaSayisi - gelenSayisi);
  const katilimOrani = toplamFirmaSayisi > 0 ? ((gelenSayisi / toplamFirmaSayisi) * 100).toFixed(1) : "0.0";

  // Alt Filtre Sayıları
  const faalSayisi = firmalar.filter(f => f.uyeDurumu === 'FAAL').length;
  const askidaSayisi = firmalar.filter(f => f.uyeDurumu === 'ASKIDA BORÇ').length;

  // Evrak Durumları
  const evrakOnaylandiSayisi = firmalar.filter(f => {
    const d = f.evrakDurumu?.trim();
    return d === 'Evrak onaylandı' || d === "Evrak BTSO'da";
  }).length;

  const evrakOnaydaSayisi = firmalar.filter(f => f.evrakDurumu?.trim() === 'Evrak onayda').length;
  const sorunluImzaSayisi = firmalar.filter(f => f.evrakDurumu?.trim() === 'Sorunlu imza').length;
  const sorunluAskidaSayisi = firmalar.filter(f => f.evrakDurumu?.trim()?.toLowerCase() === 'sorunlu askıda').length;
  const sorunluYetkiliSayisi = firmalar.filter(f => f.evrakDurumu?.trim()?.toLowerCase() === 'sorunlu yetkili').length;
  const oyKarsidaSayisi = firmalar.filter(f => f.evrakDurumu?.trim() === 'Oy karşıda').length;

  // Geriye kalan tüm alınmadı / tanımsız kayıtlar
  const evrakAlinmadiSayisi = firmalar.filter(f => {
    const d = f.evrakDurumu?.trim();
    const bilinenler = [
      'Evrak onaylandı', "Evrak BTSO'da", 'Evrak onayda', 'Sorunlu imza',
      'sorunlu askıda', 'sorunlu yetkili', 'Oy karşıda'
    ];
    return !d || !bilinenler.some(b => b.toLowerCase() === d.toLowerCase());
  }).length;

  // Zimmet sahiplerinin benzersiz listesi (Türkçe A-Z)
  const zimmetListesi = [...new Set(
    firmalar.map(f => f.zimmet).filter(z => z && z.trim() !== '')
  )].sort((a, b) => a.localeCompare(b, 'tr'));

  // Filtreleme ve Türkçe A-Z Sıralama
  const filtrelenmisFirmalar = firmalar
    .filter(f => {
      const arama =
        (f.firmaAdi && f.firmaAdi.toLowerCase().includes(aramaMetni.toLowerCase())) ||
        (f.yetkiliIsim && f.yetkiliIsim.toLowerCase().includes(aramaMetni.toLowerCase())) ||
        (f.sicilNo && f.sicilNo.toLowerCase().includes(aramaMetni.toLowerCase())) ||
        (f.zimmet && f.zimmet.toLowerCase().includes(aramaMetni.toLowerCase())) ||
        (f.yetkiliTelefon && f.yetkiliTelefon.includes(aramaMetni));

      if (!arama) return false;

      // Zimmet sahibine göre doğrudan filtre (seçiliyse)
      if (zimmetFiltre && f.zimmet !== zimmetFiltre) return false;

      const evrak = f.evrakDurumu?.trim();
      const evrakLower = evrak?.toLowerCase() || '';

      if (aktifFiltre === 'gelen') return f.secimGeldiMi === true;
      if (aktifFiltre === 'bekleyen') return !f.secimGeldiMi;
      if (aktifFiltre === 'faal') return f.uyeDurumu === 'FAAL';
      if (aktifFiltre === 'askida') return f.uyeDurumu === 'ASKIDA BORÇ';
      if (aktifFiltre === 'evrakOnaylandi') return evrak === 'Evrak onaylandı' || evrak === "Evrak BTSO'da";
      if (aktifFiltre === 'evrakOnayda') return evrak === 'Evrak onayda';
      if (aktifFiltre === 'sorunluImza') return evrak === 'Sorunlu imza';
      if (aktifFiltre === 'sorunluAskida') return evrakLower === 'sorunlu askıda';
      if (aktifFiltre === 'sorunluYetkili') return evrakLower === 'sorunlu yetkili';
      if (aktifFiltre === 'oyKarsida') return evrak === 'Oy karşıda';
      if (aktifFiltre === 'evrakAlinmadi') {
        const bilinenler = [
          'evrak onaylandı', "evrak btso'da", 'evrak onayda', 'sorunlu imza',
          'sorunlu askıda', 'sorunlu yetkili', 'oy karşıda'
        ];
        return !evrak || !bilinenler.includes(evrakLower);
      }

      return true;
    })
    .sort((a, b) => (a.firmaAdi || '').localeCompare(b.firmaAdi || '', 'tr'));

  const getFiltreEtiketi = () => {
    switch (aktifFiltre) {
      case 'faal': return { baslik: 'Faal Üyeler', sayi: faalSayisi };
      case 'askida': return { baslik: 'Askıda Borçlular', sayi: askidaSayisi };
      case 'evrakOnaylandi': return { baslik: 'Evrak Onaylandı', sayi: evrakOnaylandiSayisi };
      case 'evrakOnayda': return { baslik: 'Evrak Onayda', sayi: evrakOnaydaSayisi };
      case 'sorunluImza': return { baslik: 'Sorunlu İmza', sayi: sorunluImzaSayisi };
      case 'sorunluAskida': return { baslik: 'Sorunlu Askıda', sayi: sorunluAskidaSayisi };
      case 'sorunluYetkili': return { baslik: 'Sorunlu Yetkili', sayi: sorunluYetkiliSayisi };
      case 'oyKarsida': return { baslik: 'Oy Karşıda', sayi: oyKarsidaSayisi };
      case 'evrakAlinmadi': return { baslik: 'Evrak Alınmadı', sayi: evrakAlinmadiSayisi };
      default: return { baslik: 'Tümü', sayi: toplamFirmaSayisi };
    }
  };

  const suankiFiltre = getFiltreEtiketi();

  // ---- Ortak küçük bileşen: mobil filtre menüsündeki durum butonu ----
  // Not: Tailwind sınıfları derleme zamanında taranır, bu yüzden `bg-${renk}-50` gibi
  // dinamik string'ler üretilmez. Bunun yerine sabit sınıf haritası kullanıyoruz.
  const RENK_HARITASI = {
    emerald: { aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200', rozet: 'bg-emerald-100 text-emerald-800' },
    rose: { aktif: 'bg-rose-50 text-rose-700 border-rose-200', rozet: 'bg-rose-100 text-rose-800' },
    blue: { aktif: 'bg-blue-50 text-blue-700 border-blue-200', rozet: 'bg-blue-100 text-blue-800' },
    amber: { aktif: 'bg-amber-50 text-amber-700 border-amber-200', rozet: 'bg-amber-100 text-amber-800' },
    purple: { aktif: 'bg-purple-50 text-purple-700 border-purple-200', rozet: 'bg-purple-100 text-purple-800' },
    slate: { aktif: 'bg-slate-100 text-slate-800 border-slate-200', rozet: 'bg-slate-200 text-slate-700' },
  };

  const MobilFiltreButonu = ({ aktif, onClick, renk, icon, etiket, sayi }) => {
    const renkler = RENK_HARITASI[renk] || RENK_HARITASI.slate;
    return (
      <button
        onClick={onClick}
        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors border ${
          aktif ? `${renkler.aktif} font-bold` : 'text-slate-700 border-transparent hover:bg-slate-50'
        }`}
      >
        <span className="flex items-center gap-2">{icon}{etiket}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${aktif ? renkler.rozet : 'bg-slate-100 text-slate-600'}`}>
          {sayi}
        </span>
      </button>
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] w-full mx-auto">

      {/* ============================= MOBİL GÖRÜNÜM (lg altı) ============================= */}
      <div className="lg:hidden">

        {/* Üst bar: hamburger + başlık */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setMobilMenuAcik(true)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-700 active:scale-95 transition-all"
            aria-label="Filtre menüsünü aç"
          >
            <Menu size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">Kayıt Masası</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              {gelenSayisi}/{toplamFirmaSayisi} giriş &middot; %{katilimOrani}
            </p>
          </div>
          <div className="w-[42px]" />
        </div>

        {/* Arama */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Firma, sicil, yetkili veya zimmet ara..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-sm"
          />
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
        </div>

        {/* Gelenler / Bekleyenler / Tümü hızlı sekmeler */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setAktifFiltre('tum')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
              aktifFiltre === 'tum' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Tümü ({toplamFirmaSayisi})
          </button>
          <button
            onClick={() => setAktifFiltre('gelen')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
              aktifFiltre === 'gelen' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50/70 text-emerald-700 border-emerald-200'
            }`}
          >
            Gelenler ({gelenSayisi})
          </button>
          <button
            onClick={() => setAktifFiltre('bekleyen')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
              aktifFiltre === 'bekleyen' ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50/70 text-amber-700 border-amber-200'
            }`}
          >
            Bekleyenler ({bekleyenSayisi})
          </button>
        </div>

        {/* Aktif ek filtre rozetleri (durum filtresi tum'dan farklıysa veya zimmet seçiliyse) */}
        {(aktifFiltre !== 'tum' && aktifFiltre !== 'gelen' && aktifFiltre !== 'bekleyen') || zimmetFiltre ? (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {(aktifFiltre !== 'tum' && aktifFiltre !== 'gelen' && aktifFiltre !== 'bekleyen') && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                {suankiFiltre.baslik} ({suankiFiltre.sayi})
                <button onClick={() => setAktifFiltre('tum')}><X size={12} /></button>
              </span>
            )}
            {zimmetFiltre && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                Zimmet: {zimmetFiltre}
                <button onClick={() => setZimmetFiltre('')}><X size={12} /></button>
              </span>
            )}
          </div>
        ) : null}

        {/* Kart listesi */}
        <div className="space-y-3">
          {yukleniyor ? (
            <div className="py-16 text-center text-slate-400 font-medium text-sm">Veriler yükleniyor, lütfen bekleyin...</div>
          ) : filtrelenmisFirmalar.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium text-sm">Aradığınız kriterlere uygun firma bulunamadı.</div>
          ) : (
            filtrelenmisFirmalar.map((firma) => {
              const geldikMi = !!firma.secimGeldiMi;
              const duzenleniyorMu = duzenlenenId === firma.id;
              const askidaMi = firma.uyeDurumu === 'ASKIDA BORÇ';
              const islemdeMi = islemdekiId === firma.id;
              const evrak = firma.evrakDurumu?.trim() || 'Evrak alınmadı';
              const isSorunlu = evrak.toLowerCase().includes('sorunlu');

              return (
                <div
                  key={firma.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm ${geldikMi ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}
                >
                  {/* Üst satır: firma adı + seçim durumu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <Building2 size={16} className={`shrink-0 mt-0.5 ${geldikMi ? 'text-emerald-600' : 'text-indigo-600'}`} />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm break-words">{firma.firmaAdi}</div>
                        <div className="text-slate-400 text-[11px] font-medium mt-0.5">Sicil No: {firma.sicilNo}</div>
                      </div>
                    </div>
                    {geldikMi ? (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 size={11} /> Geldi
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                        Bekliyor
                      </span>
                    )}
                  </div>

                  {/* Yetkili bilgisi */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><User size={11} className="text-slate-400" /> {firma.yetkiliIsim || 'Belirtilmemiş'}</span>
                    <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {firma.yetkiliTelefon || 'Telefon yok'}</span>
                  </div>

                  {/* Durum rozetleri */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {askidaMi ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert size={10} /> ASKIDA BORÇ
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        FAAL
                      </span>
                    )}
                    {firma.borcMiktari > 0 && (
                      <span className="text-rose-600 text-[10px] font-bold">Borç: {Number(firma.borcMiktari).toLocaleString('tr-TR')} TL</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      evrak === 'Evrak onaylandı' || evrak === "Evrak BTSO'da" ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      isSorunlu ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold' :
                      evrak === 'Evrak onayda' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      evrak === 'Oy karşıda' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {evrak}
                    </span>
                  </div>

                  {/* Zimmet - dokununca o kişiye göre filtreler */}
                  <button
                    onClick={() => setZimmetFiltre(firma.zimmet && firma.zimmet.trim() !== '' ? firma.zimmet : '')}
                    disabled={!firma.zimmet || firma.zimmet.trim() === ''}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 disabled:opacity-70"
                  >
                    Zimmet: {firma.zimmet && firma.zimmet.trim() !== '' ? firma.zimmet : 'Atanmadı'}
                  </button>

                  {/* Düzenleme formu */}
                  {duzenleniyorMu && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-indigo-200 space-y-2">
                      <select
                        value={geciciForm.uyeDurumu}
                        onChange={(e) => {
                          const yeniDurum = e.target.value;
                          setGeciciForm({
                            ...geciciForm,
                            uyeDurumu: yeniDurum,
                            borcMiktari: yeniDurum === 'FAAL' ? 0 : geciciForm.borcMiktari
                          });
                        }}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="FAAL">FAAL</option>
                        <option value="ASKIDA BORÇ">ASKIDA BORÇ</option>
                      </select>

                      {geciciForm.uyeDurumu === 'ASKIDA BORÇ' && (
                        <input
                          type="number"
                          placeholder="Borç (TL)"
                          value={geciciForm.borcMiktari}
                          onChange={(e) => setGeciciForm({ ...geciciForm, borcMiktari: e.target.value })}
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}

                      <select
                        value={geciciForm.evrakDurumu}
                        onChange={(e) => setGeciciForm({ ...geciciForm, evrakDurumu: e.target.value })}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Evrak alınmadı">Evrak alınmadı</option>
                        <option value="Evrak onayda">Evrak onayda</option>
                        <option value="Evrak onaylandı">Evrak onaylandı</option>
                        <option value="Evrak BTSO'da">Evrak BTSO'da</option>
                        <option value="Sorunlu imza">Sorunlu imza</option>
                        <option value="Sorunlu askıda">Sorunlu askıda</option>
                        <option value="Sorunlu yetkili">Sorunlu yetkili</option>
                        <option value="Oy karşıda">Oy karşıda</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Zimmet Sahibi..."
                        value={geciciForm.zimmet}
                        onChange={(e) => setGeciciForm({ ...geciciForm, zimmet: e.target.value })}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />

                      <button
                        onClick={() => duzenlemeyiKaydet(firma)}
                        className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Save size={13} /> Kaydet
                      </button>
                    </div>
                  )}

                  {/* Aksiyon satırı */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => duzenleniyorMu ? setDuzenlenenId(null) : duzenlemeyiBaslat(firma)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-slate-600 bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold"
                    >
                      <Edit3 size={13} /> {duzenleniyorMu ? 'Vazgeç' : 'Düzenle'}
                    </button>

                    {geldikMi ? (
                      <button
                        disabled={islemdeMi}
                        onClick={() => handleKatilimDegistir(firma)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-slate-600 bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        {islemdeMi ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                        Geri Al
                      </button>
                    ) : (
                      <button
                        disabled={islemdeMi}
                        onClick={() => handleKatilimDegistir(firma)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        {islemdeMi ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Giriş Yap
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar / Drawer (soldan açılır, ekranı bölmez) */}
        {mobilMenuAcik && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobilMenuAcik(false)} />
            <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                <span className="font-extrabold text-slate-900 text-sm">Filtrele</span>
                <button onClick={() => setMobilMenuAcik(false)} className="p-1.5 rounded-lg hover:bg-slate-50">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Üye &amp; Borç Durumu</div>
                  <div className="space-y-1">
                    <MobilFiltreButonu
                      aktif={aktifFiltre === 'faal'} onClick={() => { setAktifFiltre('faal'); setMobilMenuAcik(false); }}
                      renk="emerald" icon={<CheckCheck size={14} className="text-emerald-600" />} etiket="Faal Üyeler" sayi={faalSayisi}
                    />
                    <MobilFiltreButonu
                      aktif={aktifFiltre === 'askida'} onClick={() => { setAktifFiltre('askida'); setMobilMenuAcik(false); }}
                      renk="rose" icon={<ShieldAlert size={14} className="text-rose-600" />} etiket="Askıda Borçlular" sayi={askidaSayisi}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Evrak &amp; Sandık Durumu</div>
                  <div className="space-y-1">
                    <MobilFiltreButonu aktif={aktifFiltre === 'evrakOnaylandi'} onClick={() => { setAktifFiltre('evrakOnaylandi'); setMobilMenuAcik(false); }} renk="emerald" icon={<CheckCircle size={14} className="text-emerald-600" />} etiket="Evrak Onaylandı" sayi={evrakOnaylandiSayisi} />
                    <MobilFiltreButonu aktif={aktifFiltre === 'evrakOnayda'} onClick={() => { setAktifFiltre('evrakOnayda'); setMobilMenuAcik(false); }} renk="blue" icon={<Clock size={14} className="text-blue-600" />} etiket="Evrak Onayda" sayi={evrakOnaydaSayisi} />
                    <MobilFiltreButonu aktif={aktifFiltre === 'sorunluImza'} onClick={() => { setAktifFiltre('sorunluImza'); setMobilMenuAcik(false); }} renk="amber" icon={<AlertTriangle size={14} className="text-amber-600" />} etiket="Sorunlu İmza" sayi={sorunluImzaSayisi} />
                    <MobilFiltreButonu aktif={aktifFiltre === 'sorunluAskida'} onClick={() => { setAktifFiltre('sorunluAskida'); setMobilMenuAcik(false); }} renk="amber" icon={<AlertTriangle size={14} className="text-amber-600" />} etiket="Sorunlu Askıda" sayi={sorunluAskidaSayisi} />
                    <MobilFiltreButonu aktif={aktifFiltre === 'sorunluYetkili'} onClick={() => { setAktifFiltre('sorunluYetkili'); setMobilMenuAcik(false); }} renk="amber" icon={<UserX size={14} className="text-amber-600" />} etiket="Sorunlu Yetkili" sayi={sorunluYetkiliSayisi} />
                    <MobilFiltreButonu aktif={aktifFiltre === 'oyKarsida'} onClick={() => { setAktifFiltre('oyKarsida'); setMobilMenuAcik(false); }} renk="purple" icon={<ArrowRightLeft size={14} className="text-purple-600" />} etiket="Oy Karşıda" sayi={oyKarsidaSayisi} />
                    <MobilFiltreButonu aktif={aktifFiltre === 'evrakAlinmadi'} onClick={() => { setAktifFiltre('evrakAlinmadi'); setMobilMenuAcik(false); }} renk="slate" icon={<FileX size={14} className="text-slate-500" />} etiket="Evrak Alınmadı" sayi={evrakAlinmadiSayisi} />
                  </div>
                </div>

                {zimmetListesi.length > 0 && (
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Zimmet Sahibine Göre</div>
                    <div className="flex flex-wrap gap-1.5">
                      {zimmetListesi.map((z) => (
                        <button
                          key={z}
                          onClick={() => { setZimmetFiltre(zimmetFiltre === z ? '' : z); setMobilMenuAcik(false); }}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                            zimmetFiltre === z ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Komite</div>
                  <select
                    value={seciliKomite}
                    onChange={(e) => setSeciliKomite(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 text-xs cursor-pointer"
                  >
                    <option value="">1. Komite</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 shrink-0 space-y-2">
                <button
                  onClick={() => { setAktifFiltre('tum'); setZimmetFiltre(''); }}
                  className="w-full text-xs font-bold text-slate-500 border border-slate-200 rounded-lg py-2.5"
                >
                  Filtreleri Temizle
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg text-xs font-bold">
                  <Download size={14} /> Rapor Al (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================= MASAÜSTÜ GÖRÜNÜM (lg ve üstü, değişmedi) ============================= */}
      <div className="hidden lg:block">
        {/* Üst Başlık */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              BTSO Seçim Yönetimi
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Kayıt Masası Operasyon Paneli</h2>
            <p className="text-slate-500 mt-1 font-medium text-sm">Üye katılım durumlarını takip edin, borç ve evrak revizelerini anlık yönetin.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all text-sm">
              <Download size={16} className="text-slate-500" />
              Rapor Al (PDF)
            </button>
          </div>
        </div>

        {/* METRİK KARTLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Toplam Firma</span>
              <div className="text-3xl font-black text-slate-800 mt-2">{toplamFirmaSayisi}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <Building2 size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100/80 flex items-center justify-between relative overflow-hidden">
            <div>
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">Kayıt Yapanlar</span>
              <div className="text-3xl font-black text-indigo-700 mt-2">{gelenSayisi}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Bekleyenler</span>
              <div className="text-3xl font-black text-slate-800 mt-2">{bekleyenSayisi}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <User size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100/80 flex items-center justify-between relative overflow-hidden">
            <div>
              <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Katılım Oranı</span>
              <div className="text-3xl font-black text-emerald-700 mt-2">%{katilimOrani}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle size={22} />
            </div>
          </div>
        </div>

        {/* ARAMA VE TEK SATIRDA KİLİTLENMİŞ FİLTRELER */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible mb-6">
          <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white rounded-t-2xl">

            {/* Arama Inputu */}
            <div className="relative w-full xl:w-[380px] shrink-0">
              <input
                type="text"
                placeholder="Firma, sicil, yetkili veya zimmet ara..."
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs"
              />
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={15} />
            </div>

            {/* Filtre Butonları & Komite */}
            <div className="flex items-center gap-2 overflow-x-auto xl:overflow-visible pb-1 xl:pb-0 shrink-0">

              {/* DROPDOWN FİLTRESİ */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownAcik(!dropdownAcik)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs shrink-0 ${
                    ['faal', 'askida', 'evrakOnaylandi', 'evrakOnayda', 'sorunluImza', 'sorunluAskida', 'sorunluYetkili', 'oyKarsida', 'evrakAlinmadi', 'tum'].includes(aktifFiltre) && aktifFiltre !== 'gelen' && aktifFiltre !== 'bekleyen'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{suankiFiltre.baslik}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    aktifFiltre.includes('sorunlu') ? 'bg-amber-400 text-slate-950 font-black' :
                    aktifFiltre === 'askida' ? 'bg-rose-500 text-white font-bold' :
                    'bg-slate-700 text-white'
                  }`}>
                    {suankiFiltre.sayi}
                  </span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${dropdownAcik ? 'rotate-180' : ''}`} />
                </button>

                {/* AÇILIR MENÜ */}
                {dropdownAcik && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => { setAktifFiltre('tum'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'tum' ? 'bg-slate-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2"><FileText size={14} /> Tüm Firmalar</span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">{toplamFirmaSayisi}</span>
                    </button>

                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">
                      Üye & Borç Durumu
                    </div>

                    <button
                      onClick={() => { setAktifFiltre('faal'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'faal' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-emerald-600"><CheckCheck size={14} /> Faal Üyeler</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{faalSayisi}</span>
                    </button>

                    <button
                      onClick={() => { setAktifFiltre('askida'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'askida' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-rose-600"><ShieldAlert size={14} /> Askıda Borçlular</span>
                      <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{askidaSayisi}</span>
                    </button>

                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">
                      Evrak & Sandık Durumu
                    </div>

                    <button
                      onClick={() => { setAktifFiltre('evrakOnaylandi'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'evrakOnaylandi' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-emerald-600"><CheckCircle size={14} /> Evrak Onaylandı</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{evrakOnaylandiSayisi}</span>
                    </button>

                    <button
                      onClick={() => { setAktifFiltre('evrakOnayda'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'evrakOnayda' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-blue-600"><Clock size={14} /> Evrak Onayda</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{evrakOnaydaSayisi}</span>
                    </button>

                    {/* SORUNLU DURUMLAR */}
                    <button
                      onClick={() => { setAktifFiltre('sorunluImza'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'sorunluImza' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-amber-600"><AlertTriangle size={14} /> Sorunlu İmza</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{sorunluImzaSayisi}</span>
                    </button>

                    <button
                      onClick={() => { setAktifFiltre('sorunluAskida'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'sorunluAskida' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-amber-600"><AlertTriangle size={14} /> Sorunlu Askıda</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{sorunluAskidaSayisi}</span>
                    </button>

                    <button
                      onClick={() => { setAktifFiltre('sorunluYetkili'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'sorunluYetkili' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-amber-600"><UserX size={14} /> Sorunlu Yetkili</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{sorunluYetkiliSayisi}</span>
                    </button>

                    <button
                      onClick={() => { setAktifFiltre('oyKarsida'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'oyKarsida' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-purple-600"><ArrowRightLeft size={14} /> Oy Karşıda</span>
                      <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{oyKarsidaSayisi}</span>
                    </button>

                    <button
                      onClick={() => { setAktifFiltre('evrakAlinmadi'); setDropdownAcik(false); }}
                      className={`w-full px-4 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        aktifFiltre === 'evrakAlinmadi' ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-slate-500"><FileX size={14} /> Evrak Alınmadı</span>
                      <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{evrakAlinmadiSayisi}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Gelenler Butonu */}
              <button
                onClick={() => { setAktifFiltre('gelen'); setDropdownAcik(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs shrink-0 ${
                  aktifFiltre === 'gelen'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-emerald-50/70 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Gelenler
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${aktifFiltre === 'gelen' ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
                  {gelenSayisi}
                </span>
              </button>

              {/* Bekleyenler Butonu */}
              <button
                onClick={() => { setAktifFiltre('bekleyen'); setDropdownAcik(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs shrink-0 ${
                  aktifFiltre === 'bekleyen'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-amber-50/70 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                Bekleyenler
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${aktifFiltre === 'bekleyen' ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900'}`}>
                  {bekleyenSayisi}
                </span>
              </button>

              {/* Komite Seçimi */}
              <select
                value={seciliKomite}
                onChange={(e) => setSeciliKomite(e.target.value)}
                className="bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs shrink-0 cursor-pointer shadow-2xs"
              >
                <option value="">1. Komite</option>
              </select>

            </div>

          </div>

          {/* TABLO */}
          <div className="overflow-x-auto">
            {yukleniyor ? (
              <div className="p-16 text-center text-slate-400 font-medium">Veriler yükleniyor, lütfen bekleyin...</div>
            ) : filtrelenmisFirmalar.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-medium">Aradığınız kriterlere uygun firma bulunamadı.</div>
            ) : (
              <table className="w-full text-left text-sm table-auto">
                <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 w-[28%]">Firma & Sicil No</th>
                    <th className="px-6 py-4 w-[18%]">Yetkili İletişim</th>
                    <th className="px-6 py-4 w-[16%]">Üye Durumu & Borç</th>
                    <th className="px-6 py-4 w-[14%]">Zimmet Sahibi</th>
                    <th className="px-6 py-4 text-center w-[12%]">Evrak Durumu</th>
                    <th className="px-6 py-4 text-center w-[9%]">Seçim Durumu</th>
                    <th className="px-6 py-4 text-right w-[13%]">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-normal">
                  {filtrelenmisFirmalar.map((firma) => {
                    const geldikMi = !!firma.secimGeldiMi;
                    const duzenleniyorMu = duzenlenenId === firma.id;
                    const askidaMi = firma.uyeDurumu === 'ASKIDA BORÇ';
                    const islemdeMi = islemdekiId === firma.id;
                    const evrak = firma.evrakDurumu?.trim() || 'Evrak alınmadı';
                    const isSorunlu = evrak.toLowerCase().includes('sorunlu');

                    return (
                      <tr key={firma.id} className={`transition-all duration-150 ${geldikMi ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'hover:bg-slate-50/60'}`}>

                        {/* Firma & Sicil No */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-slate-900 text-sm flex items-start gap-2 break-words">
                            <Building2 size={16} className={`shrink-0 mt-0.5 ${geldikMi ? 'text-emerald-600' : 'text-indigo-600'}`} />
                            <span>{firma.firmaAdi}</span>
                          </div>
                          <div className="text-slate-400 text-xs mt-1 pl-6 font-medium">Sicil No: <span className="text-slate-600 font-semibold">{firma.sicilNo}</span></div>
                        </td>

                        {/* Yetkili İletişim */}
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

                        {/* Üye Durumu & Borç */}
                        <td className="px-6 py-4 align-top">
                          {duzenleniyorMu ? (
                            <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-xl border border-indigo-200 shadow-sm">
                              <select
                                value={geciciForm.uyeDurumu}
                                onChange={(e) => {
                                  const yeniDurum = e.target.value;
                                  setGeciciForm({
                                    ...geciciForm,
                                    uyeDurumu: yeniDurum,
                                    borcMiktari: yeniDurum === 'FAAL' ? 0 : geciciForm.borcMiktari
                                  });
                                }}
                                className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="FAAL">FAAL</option>
                                <option value="ASKIDA BORÇ">ASKIDA BORÇ</option>
                              </select>

                              {geciciForm.uyeDurumu === 'ASKIDA BORÇ' && (
                                <input
                                  type="number"
                                  placeholder="Borç (TL)"
                                  value={geciciForm.borcMiktari}
                                  onChange={(e) => setGeciciForm({ ...geciciForm, borcMiktari: e.target.value })}
                                  className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              )}
                            </div>
                          ) : (
                            <div>
                              {askidaMi ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                  <ShieldAlert size={12} /> ASKIDA BORÇ
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  FAAL
                                </span>
                              )}
                              {firma.borcMiktari > 0 && (
                                <div className="text-rose-600 text-xs mt-1.5 font-bold">Borç: {Number(firma.borcMiktari).toLocaleString('tr-TR')} TL</div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Zimmet Sahibi */}
                        <td className="px-6 py-4 text-slate-700 font-medium text-xs align-top">
                          {duzenleniyorMu ? (
                            <input
                              type="text"
                              placeholder="Zimmet Sahibi..."
                              value={geciciForm.zimmet}
                              onChange={(e) => setGeciciForm({ ...geciciForm, zimmet: e.target.value })}
                              className="w-full text-xs font-semibold bg-white border border-indigo-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200/60 break-words">
                              {firma.zimmet && firma.zimmet.trim() !== '' ? firma.zimmet : 'Atanmadı'}
                            </span>
                          )}
                        </td>

                        {/* Evrak Durumu */}
                        <td className="px-6 py-4 text-center align-top">
                          {duzenleniyorMu ? (
                            <select
                              value={geciciForm.evrakDurumu}
                              onChange={(e) => setGeciciForm({ ...geciciForm, evrakDurumu: e.target.value })}
                              className="text-xs font-semibold bg-white border border-indigo-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer"
                            >
                              <option value="Evrak alınmadı">Evrak alınmadı</option>
                              <option value="Evrak onayda">Evrak onayda</option>
                              <option value="Evrak onaylandı">Evrak onaylandı</option>
                              <option value="Evrak BTSO'da">Evrak BTSO'da</option>
                              <option value="Sorunlu imza">Sorunlu imza</option>
                              <option value="Sorunlu askıda">Sorunlu askıda</option>
                              <option value="Sorunlu yetkili">Sorunlu yetkili</option>
                              <option value="Oy karşıda">Oy karşıda</option>
                            </select>
                          ) : (
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold break-words ${
                              evrak === 'Evrak onaylandı' || evrak === "Evrak BTSO'da" ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold' :
                              isSorunlu ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold' :
                              evrak === 'Evrak onayda' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              evrak === 'Oy karşıda' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {evrak}
                            </span>
                          )}
                        </td>

                        {/* Seçim Durumu */}
                        <td className="px-6 py-4 text-center align-top">
                          {geldikMi ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 size={13} className="text-emerald-600" /> Geldi
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Bekliyor
                            </span>
                          )}
                        </td>

                        {/* Aksiyon */}
                        <td className="px-6 py-4 text-right align-top">
                          <div className="flex items-center justify-end gap-2">
                            {duzenleniyorMu ? (
                              <button
                                onClick={() => duzenlemeyiKaydet(firma)}
                                className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                              >
                                <Save size={13} /> Kaydet
                              </button>
                            ) : (
                              <button
                                onClick={() => duzenlemeyiBaslat(firma)}
                                className="text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 p-1.5 rounded-lg transition-all hover:border-indigo-300"
                                title="Borç, Evrak ve Zimmet Düzenle"
                              >
                                <Edit3 size={14} />
                              </button>
                            )}

                            {geldikMi ? (
                              <button
                                disabled={islemdeMi}
                                onClick={() => handleKatilimDegistir(firma)}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 text-xs font-bold bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                title="Girişi Geri Al"
                              >
                                {islemdeMi ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                                <span>Geri Al</span>
                              </button>
                            ) : (
                              <button
                                disabled={islemdeMi}
                                onClick={() => handleKatilimDegistir(firma)}
                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
                              >
                                {islemdeMi ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                <span>Giriş Yap</span>
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

    </div>
  );
};