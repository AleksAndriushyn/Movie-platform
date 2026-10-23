namespace MovieVerse.Api.Data;

public sealed class User
{
    public int Id { get; set; }

    /// <summary>Google's stable account id ("sub" claim).</summary>
    public required string GoogleSubject { get; set; }

    public string? Email { get; set; }

    public string? Name { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime LastLoginAtUtc { get; set; }

    /// <summary>Can moderate reviews. Set directly in the database.</summary>
    public bool IsAdmin { get; set; }
}
