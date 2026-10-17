using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieVerse.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRatings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ratings",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    MovieId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<byte>(type: "tinyint", nullable: false),
                    RatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PosterPath = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ReleaseDate = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    VoteAverage = table.Column<double>(type: "float", nullable: false),
                    Overview = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ratings", x => new { x.UserId, x.MovieId });
                    table.CheckConstraint("CK_Ratings_Score", "[Score] BETWEEN 1 AND 10");
                    table.ForeignKey(
                        name: "FK_Ratings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_UserId_RatedAtUtc",
                table: "Ratings",
                columns: new[] { "UserId", "RatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ratings");
        }
    }
}
