using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using MovieVerse.Api.Tmdb;
using Polly;

namespace MovieVerse.Api.Infrastructure;

/// <summary>
/// Maps TMDB failures to ProblemDetails. Upstream auth/quota problems are ours to fix,
/// so they surface as 502/503 without leaking TMDB's message to clients.
/// </summary>
public sealed class UpstreamExceptionHandler(
    IProblemDetailsService problemDetails,
    ILogger<UpstreamExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, title, detail) = exception switch
        {
            TmdbException { StatusCode: HttpStatusCode.NotFound } tmdb =>
                (StatusCodes.Status404NotFound, "Not found", tmdb.StatusMessage),
            TmdbException { StatusCode: HttpStatusCode.TooManyRequests } =>
                (StatusCodes.Status503ServiceUnavailable, "Movie data is temporarily unavailable", null),
            TmdbException { StatusCode: HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden } =>
                (StatusCodes.Status502BadGateway, "Movie data provider rejected the request", null),
            TmdbException { StatusCode: >= HttpStatusCode.BadRequest and < HttpStatusCode.InternalServerError } tmdb =>
                (StatusCodes.Status400BadRequest, "Invalid request", tmdb.StatusMessage),
            TmdbException or HttpRequestException or ExecutionRejectedException =>
                (StatusCodes.Status502BadGateway, "Movie data provider is unavailable", null),
            _ => (0, null, null),
        };

        if (status == 0)
        {
            return false;
        }

        if (status >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "TMDB request failed for {Path}", httpContext.Request.Path);
        }

        httpContext.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = { Status = status, Title = title, Detail = detail },
        });
    }
}
