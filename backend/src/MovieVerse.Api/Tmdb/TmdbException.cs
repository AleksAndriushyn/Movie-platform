using System.Net;

namespace MovieVerse.Api.Tmdb;

/// <summary>TMDB answered with a non-success status code.</summary>
public sealed class TmdbException(HttpStatusCode statusCode, string? statusMessage)
    : Exception($"TMDB responded with {(int)statusCode}: {statusMessage}")
{
    public HttpStatusCode StatusCode { get; } = statusCode;

    public string? StatusMessage { get; } = statusMessage;
}
