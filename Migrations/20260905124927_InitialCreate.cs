using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace btsosecim.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Firmalar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirmaAdi = table.Column<string>(type: "text", nullable: false),
                    SicilNo = table.Column<string>(type: "text", nullable: false),
                    YetkiliIsim = table.Column<string>(type: "text", nullable: false),
                    YetkiliTelefon = table.Column<string>(type: "text", nullable: false),
                    KomiteNo = table.Column<int>(type: "integer", nullable: false),
                    SecimGeldiMi = table.Column<bool>(type: "boolean", nullable: false),
                    Zimmet = table.Column<string>(type: "text", nullable: false),
                    YemekAramaDurumu = table.Column<string>(type: "text", nullable: false),
                    YemekTeyitDurumu = table.Column<string>(type: "text", nullable: false),
                    YemekFiiliKatilim = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Firmalar", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Firmalar_KomiteNo",
                table: "Firmalar",
                column: "KomiteNo");

            migrationBuilder.CreateIndex(
                name: "IX_Firmalar_SicilNo",
                table: "Firmalar",
                column: "SicilNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Firmalar_Zimmet",
                table: "Firmalar",
                column: "Zimmet");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Firmalar");
        }
    }
}
