using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using btsosecim.Models;
using btsosecim.Data;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Linq;
using System;
using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace btsosecim.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ImportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("excel-yukle")]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Lütfen geçerli bir Excel dosyası yükleyin.");

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var hamSatirlar = new List<Firma>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    var rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        var firmaAdi = worksheet.Cells[row, 1].Text.Trim(); // A sütunu: Firma
                        if (string.IsNullOrEmpty(firmaAdi)) continue;

                        var sicilNo = worksheet.Cells[row, 2].Text.Trim();   // B sütunu: Ticaret Sicil No
                        var komiteMetni = worksheet.Cells[row, 3].Text.Trim(); // C sütunu: Komite
                        var telefon = worksheet.Cells[row, 4].Text.Trim();    // D sütunu: Tel

                        // Yetkili isminin yanındaki parantezli telefon numaralarını otomatik temizliyoruz
                        var yetkiliHam = worksheet.Cells[row, 5].Text.Trim(); // E sütunu: Yetkililer
                                                                              // Hem normal parantezleri () hem de köşeli parantezleri [] içindeki her şeyi tamamen temizler

                        var yetkiliIsim = Regex.Replace(yetkiliHam, @"\s*[\(\[].*?[\)\]]", "").Trim();

                        var zimmetSahibi = worksheet.Cells[row, 6].Text.Trim(); // F sütunu: Zimmet Sahipleri
                        var evrakDurumu = worksheet.Cells[row, 7].Text.Trim(); // G sütunu: Evrak Durumu
                        var uyeDurumuHam = worksheet.Cells[row, 8].Text.Trim().ToUpper(new CultureInfo("tr-TR")); // H sütunu: Üye Durumu
                        var borcMetni = worksheet.Cells[row, 9].Text.Trim(); // I sütunu: Borç Miktarı

                        int komiteNo = 1;
                        if (!string.IsNullOrEmpty(komiteMetni))
                        {
                            var rakamlar = new string(komiteMetni.Where(char.IsDigit).ToArray());
                            if (int.TryParse(rakamlar, out var k)) komiteNo = k;
                        }

                        var uyeDurumu = uyeDurumuHam.Contains("ASKI") ? "ASKIDA BORÇ" : "FAAL";

                        decimal? borcMiktari = null;
                        if (!string.IsNullOrEmpty(borcMetni) && borcMetni != "-")
                        {
                            var temizMetin = borcMetni.Replace(".", "").Replace(",", ".");
                            if (decimal.TryParse(temizMetin, NumberStyles.Any, CultureInfo.InvariantCulture, out var v))
                                borcMiktari = v;
                        }

                        var sicilTemiz = string.IsNullOrEmpty(sicilNo) ? "EKSİK-" + Guid.NewGuid().ToString().Substring(0, 6) : sicilNo;

                        var firma = new Firma
                        {
                            FirmaAdi = firmaAdi,
                            SicilNo = sicilTemiz,
                            KomiteNo = komiteNo,
                            YetkiliTelefon = telefon,
                            YetkiliIsim = yetkiliIsim,
                            Zimmet = string.IsNullOrEmpty(zimmetSahibi) ? "Bekliyor" : zimmetSahibi,
                            EvrakDurumu = string.IsNullOrEmpty(evrakDurumu) ? "Alınmadı" : evrakDurumu,
                            UyeDurumu = uyeDurumu,
                            BorcMiktari = borcMiktari
                        };

                        hamSatirlar.Add(firma);
                    }
                }
            }

            var okunanSatirlar = hamSatirlar
                .GroupBy(f => f.SicilNo)
                .Select(g => g.Last())
                .ToList();

            try
            {
                var mevcutFirmalar = await _context.Firmalar.ToListAsync();
                var mevcutSozluk = mevcutFirmalar
                    .Where(f => !string.IsNullOrEmpty(f.SicilNo))
                    .GroupBy(f => f.SicilNo.Trim())
                    .ToDictionary(g => g.Key, g => g.First());

                int guncellenen = 0;
                int eklenen = 0;

                foreach (var yeni in okunanSatirlar)
                {
                    var sicilKey = yeni.SicilNo?.Trim();

                    if (!string.IsNullOrEmpty(sicilKey) && mevcutSozluk.TryGetValue(sicilKey, out var mevcut))
                    {
                        mevcut.FirmaAdi = yeni.FirmaAdi;
                        mevcut.KomiteNo = yeni.KomiteNo;
                        mevcut.YetkiliTelefon = yeni.YetkiliTelefon;
                        mevcut.YetkiliIsim = yeni.YetkiliIsim;
                        mevcut.UyeDurumu = yeni.UyeDurumu;
                        mevcut.BorcMiktari = yeni.BorcMiktari;
                        mevcut.EvrakDurumu = yeni.EvrakDurumu;

                        if (!string.IsNullOrEmpty(yeni.Zimmet) && yeni.Zimmet != "Bekliyor")
                            mevcut.Zimmet = yeni.Zimmet;

                        guncellenen++;
                    }
                    else
                    {
                        await _context.Firmalar.AddAsync(yeni);
                        eklenen++;
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Basari = true,
                    Mesaj = $"{eklenen} yeni firma eklendi, {guncellenen} firma güncellendi. Toplam işlenen sicil: {okunanSatirlar.Count}"
                });
            }
            catch (Exception ex)
            {
                var detayHata = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { Basari = false, Mesaj = "Kayıt hatası", Hata = detayHata });
            }
        }
    }
}