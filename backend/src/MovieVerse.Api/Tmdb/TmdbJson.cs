using System.Text.Json;

namespace MovieVerse.Api.Tmdb;

public static class TmdbJson
{
    /// <summary>TMDB's snake_case JSON; also used for our responses that mimic TMDB's shape.</summary>
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };
}
