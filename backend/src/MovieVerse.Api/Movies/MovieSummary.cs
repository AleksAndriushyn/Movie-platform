using System.Text.Json.Serialization;
using MovieVerse.Api.Data;

namespace MovieVerse.Api.Movies;

/// <summary>The fields a movie card needs, named like TMDB's (snake_case on the wire).</summary>
public sealed record MovieSummary(
    int Id,
    string Title,
    string? PosterPath,
    string? ReleaseDate,
    double VoteAverage,
    string? Overview)
{
    /// <summary>Release date as stored: TMDB sends "" when it's unknown.</summary>
    [JsonIgnore]
    public string? StoredReleaseDate => string.IsNullOrEmpty(ReleaseDate) ? null : ReleaseDate;

    /// <summary>Overview cut to the column size; cards only show two lines of it.</summary>
    [JsonIgnore]
    public string? StoredOverview => Overview is { Length: > AppDbContext.MaxOverviewLength }
        ? Overview[..AppDbContext.MaxOverviewLength]
        : Overview;
}
