using System.Text.Json;
using Microsoft.Extensions.Caching.Hybrid;
using MovieVerse.Api.Tmdb;

namespace MovieVerse.Api.Movies;

/// <summary>
/// Read-only movie data from TMDB, cached server-side so repeated requests
/// don't spend the TMDB quota. Concurrent misses for one key share a single upstream call.
/// </summary>
public sealed class MovieCatalog(TmdbClient tmdb, HybridCache cache)
{
    public static readonly TimeSpan GenresTtl = TimeSpan.FromHours(24);
    public static readonly TimeSpan DetailsTtl = TimeSpan.FromHours(1);
    public static readonly TimeSpan ListsTtl = TimeSpan.FromMinutes(15);
    public static readonly TimeSpan SearchTtl = TimeSpan.FromMinutes(5);

    public ValueTask<string> GetPopularAsync(int page, CancellationToken ct) =>
        GetCachedAsync($"popular:{page}", "movie/popular", new() { ["page"] = page.ToString() }, ListsTtl, ct);

    public ValueTask<string> GetDetailsAsync(int movieId, CancellationToken ct) =>
        GetCachedAsync(
            $"movie:{movieId}",
            $"movie/{movieId}",
            new() { ["append_to_response"] = "credits,videos" },
            DetailsTtl,
            ct);

    /// <summary>The card fields of a movie, read from the cached details response.</summary>
    public async Task<MovieSummary> GetSummaryAsync(int movieId, CancellationToken ct)
    {
        var json = await GetDetailsAsync(movieId, ct);
        return JsonSerializer.Deserialize<MovieSummary>(json, TmdbJson.Options)
            ?? throw new InvalidOperationException($"TMDB returned empty details for movie {movieId}.");
    }

    public ValueTask<string> SearchAsync(string query, int page, CancellationToken ct) =>
        GetCachedAsync(
            // TMDB search is case-insensitive, so share cache entries across casing
            $"search:{query.ToLowerInvariant()}:{page}",
            "search/movie",
            new() { ["query"] = query, ["page"] = page.ToString() },
            SearchTtl,
            ct);

    public ValueTask<string> GetGenresAsync(CancellationToken ct) =>
        GetCachedAsync("genres", "genre/movie/list", [], GenresTtl, ct);

    public ValueTask<string> GetByGenreAsync(int genreId, int page, CancellationToken ct) =>
        GetCachedAsync(
            $"genre:{genreId}:{page}",
            "discover/movie",
            new() { ["with_genres"] = genreId.ToString(), ["page"] = page.ToString() },
            ListsTtl,
            ct);

    // Failed upstream calls throw and are never cached
    private ValueTask<string> GetCachedAsync(
        string key,
        string path,
        Dictionary<string, string?> query,
        TimeSpan ttl,
        CancellationToken ct) =>
        cache.GetOrCreateAsync(
            $"tmdb:{key}",
            (tmdb, path, query),
            static (state, token) => new ValueTask<string>(
                state.tmdb.GetJsonAsync(state.path, state.query, token)),
            new HybridCacheEntryOptions { Expiration = ttl, LocalCacheExpiration = ttl },
            cancellationToken: ct);
}
