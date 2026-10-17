using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MovieVerse.Api.Auth;
using MovieVerse.Api.Data;
using MovieVerse.Api.Movies;
using MovieVerse.Api.Tmdb;

namespace MovieVerse.Api.Lists;

public sealed record RateMovieRequest([property: Range(Rating.MinScore, Rating.MaxScore)] int Score);

/// <summary>A rated movie: the card fields plus the user's own score.</summary>
public sealed record RatedMovie(
    int Id,
    string Title,
    string? PosterPath,
    string? ReleaseDate,
    double VoteAverage,
    string? Overview,
    int UserRating);

public sealed record RatedMoviePage(int Page, IReadOnlyList<RatedMovie> Results, int TotalPages, int TotalResults);

public static class RatingEndpoints
{
    public const int MaxRatings = 5000;

    public static IEndpointRouteBuilder MapRatingEndpoints(this IEndpointRouteBuilder app)
    {
        var ratings = app.MapGroup("/api/me/ratings").WithTags("Ratings").RequireAuthorization();

        ratings.MapGet("/", async (
                ClaimsPrincipal user,
                AppDbContext db,
                [Range(1, int.MaxValue)] int page = 1,
                CancellationToken ct = default) =>
        {
            var userId = user.GetUserId();
            var query = db.Ratings.Where(r => r.UserId == userId);
            var total = await query.CountAsync(ct);
            var results = await query
                .OrderByDescending(r => r.RatedAtUtc)
                .Skip((page - 1) * ListEndpoints.PageSize)
                .Take(ListEndpoints.PageSize)
                .Select(r => new RatedMovie(
                    r.MovieId, r.Title, r.PosterPath, r.ReleaseDate, r.VoteAverage, r.Overview, r.Score))
                .ToListAsync(ct);

            var totalPages = (total + ListEndpoints.PageSize - 1) / ListEndpoints.PageSize;
            return Results.Json(new RatedMoviePage(page, results, totalPages, total), TmdbJson.Options);
        })
            .WithName("GetRatings");

        ratings.MapPut("/{movieId:int}", async (
                [Range(1, int.MaxValue)] int movieId,
                RateMovieRequest request,
                ClaimsPrincipal user,
                AppDbContext db,
                MovieCatalog catalog,
                CancellationToken ct) =>
        {
            var userId = user.GetUserId();
            var score = (byte)request.Score;

            // Re-rating only changes the score: no TMDB call needed
            var existing = await db.Ratings.SingleOrDefaultAsync(r => r.UserId == userId && r.MovieId == movieId, ct);
            if (existing is not null)
            {
                existing.Score = score;
                existing.RatedAtUtc = DateTime.UtcNow;
                await db.SaveChangesAsync(ct);
                return Results.NoContent();
            }

            if (await db.Ratings.CountAsync(r => r.UserId == userId, ct) >= MaxRatings)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status409Conflict,
                    title: "Too many ratings",
                    detail: $"You can rate up to {MaxRatings} movies.");
            }

            // Unknown movie ids surface as 404 from TMDB via the exception handler
            var movie = await catalog.GetSummaryAsync(movieId, ct);

            db.Ratings.Add(new Rating
            {
                UserId = userId,
                MovieId = movieId,
                Score = score,
                RatedAtUtc = DateTime.UtcNow,
                Title = movie.Title,
                PosterPath = movie.PosterPath,
                ReleaseDate = movie.StoredReleaseDate,
                VoteAverage = movie.VoteAverage,
                Overview = movie.StoredOverview,
            });

            try
            {
                await db.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                // a concurrent request rated it first; apply this score on top
                db.ChangeTracker.Clear();
                var updated = await db.Ratings
                    .Where(r => r.UserId == userId && r.MovieId == movieId)
                    .ExecuteUpdateAsync(set => set
                        .SetProperty(r => r.Score, score)
                        .SetProperty(r => r.RatedAtUtc, DateTime.UtcNow), ct);
                if (updated == 0)
                {
                    throw;
                }
            }

            return Results.NoContent();
        })
            .WithName("RateMovie");

        ratings.MapDelete("/{movieId:int}", async (
                int movieId,
                ClaimsPrincipal user,
                AppDbContext db,
                CancellationToken ct) =>
        {
            var userId = user.GetUserId();
            await db.Ratings
                .Where(r => r.UserId == userId && r.MovieId == movieId)
                .ExecuteDeleteAsync(ct);

            return Results.NoContent();
        })
            .WithName("RemoveRating");

        return app;
    }
}
