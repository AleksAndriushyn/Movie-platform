namespace MovieVerse.Api.Data;

public enum ReviewStatus : byte
{
    Visible = 0,

    /// <summary>Hidden automatically after enough reports, until a moderator decides.</summary>
    Hidden = 1,

    /// <summary>Removed by a moderator; the author can't edit or re-post it.</summary>
    Removed = 2,
}

/// <summary>A user's public review of a movie; one per user and movie.</summary>
public sealed class Review
{
    public const int MinBodyLength = 10;
    public const int MaxBodyLength = 4000;

    public int Id { get; set; }

    public int UserId { get; set; }

    public User? User { get; set; }

    public int MovieId { get; set; }

    public required string Body { get; set; }

    public bool ContainsSpoilers { get; set; }

    public ReviewStatus Status { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }

    public List<ReviewReport> Reports { get; set; } = [];
}

public enum ReportReason : byte
{
    Spam = 1,
    Offensive = 2,
    Spoilers = 3,
    Other = 4,
}

/// <summary>One user's report of a review; a user reports a review at most once.</summary>
public sealed class ReviewReport
{
    public int ReviewId { get; set; }

    public int ReporterUserId { get; set; }

    public ReportReason Reason { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
