using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace btsosecim.Migrations
{
    /// <inheritdoc />
    public partial class BorcAlaniEkle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "BorcMiktari",
                table: "Firmalar",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EvrakDurumu",
                table: "Firmalar",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UyeDurumu",
                table: "Firmalar",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BorcMiktari",
                table: "Firmalar");

            migrationBuilder.DropColumn(
                name: "EvrakDurumu",
                table: "Firmalar");

            migrationBuilder.DropColumn(
                name: "UyeDurumu",
                table: "Firmalar");
        }
    }
}
