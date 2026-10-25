# BTSO Seçim & Organizasyon Takip Sistemi

BTSO seçim sürecinde yer alan firmaların alana katılım durumlarını, iletişim süreçlerini ve yemek organizasyonu takiplerini saha operasyonu için anlık olarak yönetmek amacıyla geliştirilmiş full-stack takip platformudur.

---

## 🎯 Projenin Amacı ve Özellikleri

* **Firma Katılım Takibi:** Seçim sürecindeki firmaların listelenmesi, alana gelip gelmediklerinin (`Geldi` / `Gelmedi`) anlık olarak işaretlenmesi.
* **İletişim & Arama Yönetimi:** Saha koordinasyon ekibinin firmalara ulaşıp ulaşmadığının takibi (`Arandı` / `Aranmadı`).
* **Yemek Organizasyonu Kontrolü:** Davetli firma ve temsilcilerin yemek organizasyonuna katılım durumlarının anlık kaydı.
* **Hızlı Durum Filtreleme:** Arananlar, alana ulaşanlar ve yemeğe katılanlar bazında operasyonel anlık filtreleme.

---

## 🛠️ Mimari ve Teknolojiler

### Backend
* **Platform:** .NET 8 / ASP.NET Core Web API
* **ORM:** Entity Framework Core (Code-First)
* **Veritabanı:** MSSQL / PostgreSQL
* **Mimari Özellikler:**
  * Controller tabanlı RESTful API tasarımı
  * `ApplicationDbContext` ile merkezi veri erişimi ve migration yönetimi
  * Okuma performansını artıran `AsNoTracking()` LINQ sorguları
  * Hızlı durum güncellemelerine uygun endpoint mimarisi

### Frontend
* **Kütüphane:** React
* **Stil / Arayüz:** Tailwind CSS
* **İletişim:** Axios / Fetch API

---

## 📂 Dizin Yapısı

```text
btsosecim/
├── Controllers/            # Firma katılım, arama ve yemek durumlarını yöneten API uç noktaları
├── data/                   # EF Core DbContext yapılandırması (ApplicationDbContext.cs)
├── models/                 # Firma ve durum takibi Entity / DTO sınıfları
├── Migrations/             # EF Core şema versiyonlama dosyaları
├── file/                   # Organizasyon evrak ve veri dosyaları
├── frontend/               # React & Tailwind CSS saha arayüzü
├── Properties/             # Sunucu ve profil konfigürasyonları
├── appsettings.json        # Bağlantı dizgeleri ve ortam ayarları
└── btsosecim.csproj        # Proje bağımlılıkları
