namespace MovieVerse.Api.Movies;

/// <summary>The fields a movie card needs, named like TMDB's (snake_case on the wire).</summary>
public sealed record MovieSummary(
    int Id,
    string Title,
    string? PosterPath,
    string? ReleaseDate,
    double VoteAverage,
    string? Overview);
