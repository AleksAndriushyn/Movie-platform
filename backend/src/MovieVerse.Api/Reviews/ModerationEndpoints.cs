using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using MovieVerse.Api.Auth;
using MovieVerse.Api.Data;
using MovieVerse.Api.Movies;
using MovieVerse.Api.Tmdb;

namespace MovieVerse.Api.Reviews;

public sealed record ModeratedReview(
    int Id,
    int MovieId,
    string? MovieTitle,
    ReviewAuthor Author,
    string? AuthorEmail,
    string Body,
    bool ContainsSpoilers,
    ReviewStatus Status,
    DateTime CreatedAt,
    int ReportCount,
    IReadOnlyDictionary<ReportReason, int> Reasons);

public sealed record ModerationPage(int Page, IReadOnlyList<ModeratedReview> Results, int TotalPages, int TotalResults);

public static class ModerationEndpoints
{
    public const int PageSize = 20;

    public static IEndpointRouteBuilder MapModerationEndpoints(this IEndpointRouteBuilder app)
    {
        var moderation = app.MapGroup("/api/admin/reviews").WithTags("Moderation").RequireAdmin();

        // The queue: hidden reviews first, then visible ones that have any reports
        moderation.MapGet("/", async (
                AppDbContext db,
                MovieCatalog catalog,
                ILogger<ModeratedReview> logger,
                [Range(1, int.MaxValue)] int page = 1,
                CancellationToken ct = default) =>
        {
            var query = db.Reviews.Where(r =>
                r.Status == ReviewStatus.Hidden || (r.Status == ReviewStatus.Visible && r.Reports.Any()));

            var total = await query.CountAsync(ct);
            var reviews = await query
                .OrderByDescending(r => r.Status)
                .ThenByDescending(r => r.Reports.Count)
                .ThenBy(r => r.Id)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .Select(r => new
                {
                    r.Id,
                    r.MovieId,
                    r.User!.Name,
                    r.User.AvatarUrl,
                    r.User.Email,
                    r.Body,
                    r.ContainsSpoilers,
                    r.Status,
                    r.CreatedAtUtc,
                    Reasons = r.Reports.Select(report => report.Reason).ToList(),
                })
                .ToListAsync(ct);

            var results = new List<ModeratedReview>(reviews.Count);
            foreach (var review in reviews)
            {
                results.Add(new ModeratedReview(
                    review.Id,
                    review.MovieId,
                    await TryGetTitleAsync(catalog, review.MovieId, logger, ct),
                    new ReviewAuthor(review.Name, review.AvatarUrl),
                    review.Email,
                    review.Body,
                    review.ContainsSpoilers,
                    review.Status,
                    review.CreatedAtUtc,
                    review.Reasons.Count,
                    review.Reasons.GroupBy(reason => reason).ToDictionary(group => group.Key, group => group.Count())));
            }

            return new ModerationPage(page, results, (total + PageSize - 1) / PageSize, total);
        })
            .WithName("GetModerationQueue");

        // Back to visible; the old reports are cleared so they can't hide it again
        moderation.MapPost("/{reviewId:int}/restore", async (int reviewId, AppDbContext db, CancellationToken ct) =>
        {
            var updated = await db.Reviews
                .Where(r => r.Id == reviewId)
                .ExecuteUpdateAsync(set => set.SetProperty(r => r.Status, ReviewStatus.Visible), ct);
            if (updated == 0)
            {
                return Results.NotFound();
            }

            await db.ReviewReports.Where(r => r.ReviewId == reviewId).ExecuteDeleteAsync(ct);
            return Results.NoContent();
        })
            .WithName("RestoreReview");

        moderation.MapPost("/{reviewId:int}/remove", async (int reviewId, AppDbContext db, CancellationToken ct) =>
        {
            var updated = await db.Reviews
                .Where(r => r.Id == reviewId)
                .ExecuteUpdateAsync(set => set.SetProperty(r => r.Status, ReviewStatus.Removed), ct);
            return updated == 0 ? Results.NotFound() : Results.NoContent();
        })
            .WithName("RemoveReview");

        return app;
    }

    // The queue stays usable even if TMDB is down; the UI falls back to the movie id
    private static async Task<string?> TryGetTitleAsync(
        MovieCatalog catalog, int movieId, ILogger logger, CancellationToken ct)
    {
        try
        {
            return (await catalog.GetSummaryAsync(movieId, ct)).Title;
        }
        catch (Exception ex) when (ex is TmdbException or HttpRequestException)
        {
            logger.LogWarning(ex, "Couldn't load the title of movie {MovieId}", movieId);
            return null;
        }
    }
}
