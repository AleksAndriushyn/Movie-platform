using Microsoft.EntityFrameworkCore;

namespace MovieVerse.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public const int MaxOverviewLength = 1000;

    public DbSet<User> Users => Set<User>();

    public DbSet<ListItem> ListItems => Set<ListItem>();

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
    }
}
