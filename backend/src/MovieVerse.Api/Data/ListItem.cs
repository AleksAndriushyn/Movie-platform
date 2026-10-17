namespace MovieVerse.Api.Data;

public enum MovieList : byte
{
    Favorites = 1,
    Watchlist = 2,
}

/// <summary>
/// A movie in one of a user's lists, with a snapshot of the card data taken when it was added,
/// so a list page renders from one query instead of a TMDB call per movie.
/// </summary>
public sealed class ListItem
{
    public int UserId { get; set; }

    public MovieList List { get; set; }

    public int MovieId { get; set; }

    public DateTime AddedAtUtc { get; set; }

    public required string Title { get; set; }

    public string? PosterPath { get; set; }

    public string? ReleaseDate { get; set; }

    public double VoteAverage { get; set; }

    public string? Overview { get; set; }
}
