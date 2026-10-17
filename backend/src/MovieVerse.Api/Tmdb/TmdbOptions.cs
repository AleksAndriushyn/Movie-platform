using System.ComponentModel.DataAnnotations;

namespace MovieVerse.Api.Tmdb;

public sealed class TmdbOptions
{
    public const string SectionName = "Tmdb";

    /// <summary>TMDB API Read Access Token (v4 auth). Never sent to the browser.</summary>
    [Required(ErrorMessage =
        "TMDB token is not configured. Locally run: dotnet user-secrets set \"Tmdb:AccessToken\" \"<token>\" " +
        "--project backend/src/MovieVerse.Api. On Azure, add the app setting Tmdb__AccessToken.")]
    public string AccessToken { get; set; } = string.Empty;

    [Required, Url]
    public string BaseUrl { get; set; } = "https://api.themoviedb.org/3/";
}
