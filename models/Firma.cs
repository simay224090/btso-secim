using System;
using System.ComponentModel.DataAnnotations;

namespace btsosecim.Models
{
    public class Firma
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string FirmaAdi { get; set; } = string.Empty;

        [Required]
        public string SicilNo { get; set; } = string.Empty;

        public string YetkiliIsim { get; set; } = string.Empty;

        public string YetkiliTelefon { get; set; } = string.Empty;

        [Required]
        public int KomiteNo { get; set; }

        // --- Kayıt Masası Modülü ---
        public bool SecimGeldiMi { get; set; } = false;

        public string Zimmet { get; set; } = string.Empty;

        // --- Yemek Organizasyonu Modülü ---
        public string YemekAramaDurumu { get; set; } = "Bekliyor"; // Bekliyor, Ulaşıldı, Ulaşılamadı

        public string YemekTeyitDurumu { get; set; } = "Belirsiz"; // Belirsiz, Katılacak, Katılmayacak

        public bool YemekFiiliKatilim { get; set; } = false;

        // --- Üyelik / Borç / Evrak Modülü ---
        public string UyeDurumu { get; set; } = "FAAL"; // FAAL, ASKIDA BORÇ, BORCUNU ÖDEDİ

        public decimal? BorcMiktari { get; set; } // null = borcu yok, Excel'deki "-" bu şekilde gelir

        public string EvrakDurumu { get; set; } = "Alınmadı"; // Alınmadı, Alındı — sadece panelden değişir
    }
}