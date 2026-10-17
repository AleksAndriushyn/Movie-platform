namespace MovieVerse.Api.Data;

/// <summary>A user's 1-10 score for a movie, with the same card snapshot as <see cref="ListItem"/>.</summary>
public sealed class Rating
{
    public const int MinScore = 1;
    public const int MaxScore = 10;

    public int UserId { get; set; }

    public int MovieId { get; set; }

    public byte Score { get; set; }

    public DateTime RatedAtUtc { get; set; }

    public required string Title { get; set; }

    public string? PosterPath { get; set; }

    public string? ReleaseDate { get; set; }

    public double VoteAverage { get; set; }

    public string? Overview { get; set; }
}
