using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MovieVerse.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public const int MaxOverviewLength = 1000;

    public DbSet<User> Users => Set<User>();

    public DbSet<ListItem> ListItems => Set<ListItem>();

    public DbSet<Rating> Ratings => Set<Rating>();

    public DbSet<Review> Reviews => Set<Review>();

    public DbSet<ReviewReport> ReviewReports => Set<ReviewReport>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Times are stored in UTC; mark them as such on read, or JSON serializes them without "Z"
        // and browsers read them as local time
        configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
    }

    private sealed class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>(
        value => value,
        value => DateTime.SpecifyKind(value, DateTimeKind.Utc));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(user =>
        {
            user.HasIndex(u => u.GoogleSubject).IsUnique();
            user.Property(u => u.GoogleSubject).HasMaxLength(255);
            user.Property(u => u.Email).HasMaxLength(320);
            user.Property(u => u.Name).HasMaxLength(200);
            user.Property(u => u.AvatarUrl).HasMaxLength(2048);
        });

        modelBuilder.Entity<ListItem>(item =>
        {
            item.HasKey(i => new { i.UserId, i.List, i.MovieId });
            item.HasIndex(i => new { i.UserId, i.List, i.AddedAtUtc });
            item.HasOne<User>().WithMany().HasForeignKey(i => i.UserId).OnDelete(DeleteBehavior.Cascade);
            item.Property(i => i.Title).HasMaxLength(500);
            item.Property(i => i.PosterPath).HasMaxLength(200);
            item.Property(i => i.ReleaseDate).HasMaxLength(10);
            item.Property(i => i.Overview).HasMaxLength(MaxOverviewLength);
        });

        modelBuilder.Entity<Rating>(rating =>
        {
            rating.HasKey(r => new { r.UserId, r.MovieId });
            rating.HasIndex(r => new { r.UserId, r.RatedAtUtc });
            rating.HasOne<User>().WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
            rating.ToTable(t => t.HasCheckConstraint(
                "CK_Ratings_Score", $"[Score] BETWEEN {Rating.MinScore} AND {Rating.MaxScore}"));
            rating.Property(r => r.Title).HasMaxLength(500);
            rating.Property(r => r.PosterPath).HasMaxLength(200);
            rating.Property(r => r.ReleaseDate).HasMaxLength(10);
            rating.Property(r => r.Overview).HasMaxLength(MaxOverviewLength);
        });

        modelBuilder.Entity<Review>(review =>
        {
            review.HasIndex(r => new { r.UserId, r.MovieId }).IsUnique();
            review.HasIndex(r => new { r.MovieId, r.Status, r.CreatedAtUtc });
            review.HasIndex(r => r.Status);
            review.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
            review.Property(r => r.Body).HasMaxLength(Review.MaxBodyLength);
        });

        modelBuilder.Entity<ReviewReport>(report =>
        {
            report.HasKey(r => new { r.ReviewId, r.ReporterUserId });
            report.HasOne<Review>().WithMany(r => r.Reports).HasForeignKey(r => r.ReviewId).OnDelete(DeleteBehavior.Cascade);
            // SQL Server rejects a second cascade path from Users (via Reviews and directly),
            // so a reporter's reports are deleted explicitly when the account is deleted
            report.HasOne<User>().WithMany().HasForeignKey(r => r.ReporterUserId).OnDelete(DeleteBehavior.NoAction);
            report.HasIndex(r => r.ReporterUserId);
        });
    }
}
