using Microsoft.EntityFrameworkCore;
using btsosecim.Models;

namespace btsosecim.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Bu property, PostgreSQL'deki 'Firmalar' tablosunu temsil eder
        public DbSet<Firma> Firmalar { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tablo adı ve şema ayarları (Firebase otomatik isimlendirmesine uyum için)
            modelBuilder.Entity<Firma>().ToTable("Firmalar");

            // PostgreSQL'de hızlı filtreleme için indekslemeler
            modelBuilder.Entity<Firma>().HasIndex(f => f.KomiteNo);
            modelBuilder.Entity<Firma>().HasIndex(f => f.Zimmet);
            modelBuilder.Entity<Firma>().HasIndex(f => f.SicilNo).IsUnique(); // Sicil no benzersiz olmalı
        }
    }
}