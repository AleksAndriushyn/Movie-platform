using System.ComponentModel.DataAnnotations;

namespace MovieVerse.Api.Tmdb;

public sealed class TmdbOptions
{
    public const string SectionName = "Tmdb";

    /// <summary>TMDB API Read Access Token (v4 auth). Never sent to the browser.</summary>
    [Required]
    public string AccessToken { get; set; } = string.Empty;

    [Required, Url]
    public string BaseUrl { get; set; } = "https://api.themoviedb.org/3/";
}
