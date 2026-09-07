using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using btsosecim.Data;
using btsosecim.Models;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace btsosecim.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FirmaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FirmaController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetFirmalar([FromQuery] int? komiteNo)
        {
            var query = _context.Firmalar.AsQueryable();

            if (komiteNo.HasValue)
                query = query.Where(f => f.KomiteNo == komiteNo.Value);

            var liste = await query
                .OrderBy(f => f.FirmaAdi)
                .ToListAsync();

            return Ok(liste);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> FirmaGuncelle(Guid id, [FromBody] Firma guncelVeri)
        {
            var firma = await _context.Firmalar.FindAsync(id);
            if (firma == null)
                return NotFound(new { Basari = false, Mesaj = "Firma bulunamadı." });

            // --- Kayıt Masası Modülü ---
            firma.SecimGeldiMi = guncelVeri.SecimGeldiMi;
            firma.Zimmet = guncelVeri.Zimmet;
            firma.UyeDurumu = guncelVeri.UyeDurumu;
            firma.EvrakDurumu = guncelVeri.EvrakDurumu;
            firma.BorcMiktari = guncelVeri.BorcMiktari;

            // --- YEMEK ORGANİZASYONU MODÜLÜ (EKLENEN KISIM) ---
            firma.YemekAramaDurumu = guncelVeri.YemekAramaDurumu;
            firma.YemekTeyitDurumu = guncelVeri.YemekTeyitDurumu;
            firma.YemekFiiliKatilim = guncelVeri.YemekFiiliKatilim;

            await _context.SaveChangesAsync(); // Veritabanına kesin yazma işlemi

            return Ok(firma);
        }
    }
}