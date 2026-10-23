using System.ComponentModel.DataAnnotations;

namespace MovieVerse.Api.Movies;

public static class MovieEndpoints
{
    // TMDB rejects pages above 500
    private const int MaxPage = 500;
    private const int MaxQueryLength = 100;

    public static IEndpointRouteBuilder MapMovieEndpoints(this IEndpointRouteBuilder app)
    {
        var movies = app.MapGroup("/api/movies").WithTags("Movies");

        movies.MapGet("/popular", async (
                HttpContext http,
                MovieCatalog catalog,
                [Range(1, MaxPage)] int page = 1,
                CancellationToken ct = default) =>
            Json(http, await catalog.GetPopularAsync(page, ct), MovieCatalog.ListsTtl))
            .WithName("GetPopularMovies");

        movies.MapGet("/search", async (
                HttpContext http,
                MovieCatalog catalog,
                [Required, StringLength(MaxQueryLength)] string query,
                [Range(1, MaxPage)] int page = 1,
                CancellationToken ct = default) =>
            Json(http, await catalog.SearchAsync(query.Trim(), page, ct), MovieCatalog.SearchTtl))
            .WithName("SearchMovies");

        movies.MapGet("/{movieId:int}", async (
                HttpContext http,
                MovieCatalog catalog,
                [Range(1, int.MaxValue)] int movieId,
                CancellationToken ct = default) =>
            Json(http, await catalog.GetDetailsAsync(movieId, ct), MovieCatalog.DetailsTtl))
            .WithName("GetMovie");

        movies.MapGet("/{movieId:int}/tmdb-reviews", async (
                HttpContext http,
                MovieCatalog catalog,
                [Range(1, int.MaxValue)] int movieId,
                [Range(1, MaxPage)] int page = 1,
                CancellationToken ct = default) =>
            Json(http, await catalog.GetTmdbReviewsAsync(movieId, page, ct), MovieCatalog.DetailsTtl))
            .WithName("GetTmdbReviews");

        var genres = app.MapGroup("/api/genres").WithTags("Genres");

        genres.MapGet("/", async (HttpContext http, MovieCatalog catalog, CancellationToken ct = default) =>
            Json(http, await catalog.GetGenresAsync(ct), MovieCatalog.GenresTtl))
            .WithName("GetGenres");

        genres.MapGet("/{genreId:int}/movies", async (
                HttpContext http,
                MovieCatalog catalog,
                [Range(1, int.MaxValue)] int genreId,
                [Range(1, MaxPage)] int page = 1,
                CancellationToken ct = default) =>
            Json(http, await catalog.GetByGenreAsync(genreId, page, ct), MovieCatalog.ListsTtl))
            .WithName("GetMoviesByGenre");

        return app;
    }

    // Pass TMDB JSON through untouched and let browsers reuse it for as long as we cache it
    private static IResult Json(HttpContext http, string json, TimeSpan maxAge)
    {
        http.Response.Headers.CacheControl = $"public, max-age={(int)maxAge.TotalSeconds}";
        return Results.Content(json, "application/json");
    }
}
