using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MovieVerse.Api.Auth;
using MovieVerse.Api.Data;
using MovieVerse.Api.Movies;
using MovieVerse.Api.Tmdb;

namespace MovieVerse.Api.Lists;

/// <summary>Same shape as TMDB's paginated lists, so the frontend reuses its list pages.</summary>
public sealed record MoviePage(int Page, IReadOnlyList<MovieSummary> Results, int TotalPages, int TotalResults);

public sealed record ListMembership(IReadOnlyList<int> Favorites, IReadOnlyList<int> Watchlist);

public static class ListEndpoints
{
    public const int PageSize = 20;
    public const int MaxItemsPerList = 1000;

    public static IEndpointRouteBuilder MapListEndpoints(this IEndpointRouteBuilder app)
    {
        var lists = app.MapGroup("/api/me/lists").WithTags("Lists").RequireAuthorization();

        // Which movies are in which list, so cards can show their state without extra requests
        lists.MapGet("/", async (ClaimsPrincipal user, AppDbContext db, CancellationToken ct) =>
        {
            var userId = user.GetUserId();
            var items = await db.ListItems
                .Where(i => i.UserId == userId)
                .Select(i => new { i.List, i.MovieId })
                .ToListAsync(ct);

            return new ListMembership(
                items.Where(i => i.List == MovieList.Favorites).Select(i => i.MovieId).ToList(),
                items.Where(i => i.List == MovieList.Watchlist).Select(i => i.MovieId).ToList());
        })
            .WithName("GetListMembership");

        lists.MapGet("/{list}", async (
                string list,
                ClaimsPrincipal user,
                AppDbContext db,
                [Range(1, int.MaxValue)] int page = 1,
                CancellationToken ct = default) =>
        {
            if (!TryParseList(list, out var movieList))
            {
                return Results.NotFound();
            }

            var userId = user.GetUserId();
            var query = db.ListItems.Where(i => i.UserId == userId && i.List == movieList);
            var total = await query.CountAsync(ct);
            var results = await query
                .OrderByDescending(i => i.AddedAtUtc)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .Select(i => new MovieSummary(i.MovieId, i.Title, i.PosterPath, i.ReleaseDate, i.VoteAverage, i.Overview))
                .ToListAsync(ct);

            var totalPages = (total + PageSize - 1) / PageSize;
            return Results.Json(new MoviePage(page, results, totalPages, total), TmdbJson.Options);
        })
            .WithName("GetList");

        lists.MapPut("/{list}/{movieId:int}", async (
                string list,
                [Range(1, int.MaxValue)] int movieId,
                ClaimsPrincipal user,
                AppDbContext db,
                MovieCatalog catalog,
                CancellationToken ct) =>
        {
            if (!TryParseList(list, out var movieList))
            {
                return Results.NotFound();
            }

            var userId = user.GetUserId();
            var items = db.ListItems.Where(i => i.UserId == userId && i.List == movieList);

            if (await items.AnyAsync(i => i.MovieId == movieId, ct))
            {
                return Results.NoContent();
            }

            if (await items.CountAsync(ct) >= MaxItemsPerList)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status409Conflict,
                    title: "List is full",
                    detail: $"A list can hold up to {MaxItemsPerList} movies.");
            }

            // Unknown movie ids surface as 404 from TMDB via the exception handler
            var movie = await catalog.GetSummaryAsync(movieId, ct);

            db.ListItems.Add(new ListItem
            {
                UserId = userId,
                List = movieList,
                MovieId = movieId,
                AddedAtUtc = DateTime.UtcNow,
                Title = movie.Title,
                PosterPath = movie.PosterPath,
                ReleaseDate = string.IsNullOrEmpty(movie.ReleaseDate) ? null : movie.ReleaseDate,
                VoteAverage = movie.VoteAverage,
                Overview = Truncate(movie.Overview, AppDbContext.MaxOverviewLength),
            });

            try
            {
                await db.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                // a concurrent request may have added it first; adding is idempotent
                db.ChangeTracker.Clear();
                if (!await items.AnyAsync(i => i.MovieId == movieId, ct))
                {
                    throw;
                }
            }

            return Results.NoContent();
        })
            .WithName("AddToList");

        lists.MapDelete("/{list}/{movieId:int}", async (
                string list,
                int movieId,
                ClaimsPrincipal user,
                AppDbContext db,
                CancellationToken ct) =>
        {
            if (!TryParseList(list, out var movieList))
            {
                return Results.NotFound();
            }

            var userId = user.GetUserId();
            await db.ListItems
                .Where(i => i.UserId == userId && i.List == movieList && i.MovieId == movieId)
                .ExecuteDeleteAsync(ct);

            return Results.NoContent();
        })
            .WithName("RemoveFromList");

        return app;
    }

    private static bool TryParseList(string slug, out MovieList list)
    {
        (var found, list) = slug switch
        {
            "favorites" => (true, MovieList.Favorites),
            "watchlist" => (true, MovieList.Watchlist),
            _ => (false, default),
        };
        return found;
    }

    private static string? Truncate(string? value, int maxLength) =>
        value is { Length: > 0 } && value.Length > maxLength ? value[..maxLength] : value;
}
