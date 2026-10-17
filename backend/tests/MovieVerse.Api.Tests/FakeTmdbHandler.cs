using System.Collections.Concurrent;
using System.Net;
using System.Text;

namespace MovieVerse.Api.Tests;

/// <summary>Stands in for api.themoviedb.org and records every request it receives.</summary>
public sealed class FakeTmdbHandler : HttpMessageHandler
{
    private readonly ConcurrentDictionary<string, (HttpStatusCode Status, string Body)> _responses = new();

    public ConcurrentQueue<HttpRequestMessage> Requests { get; } = new();

    /// <param name="pathAndQuery">Path relative to /3/, e.g. "movie/popular?page=1".</param>
    public void Respond(string pathAndQuery, string body, HttpStatusCode status = HttpStatusCode.OK) =>
        _responses[pathAndQuery] = (status, body);

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Requests.Enqueue(request);

        var key = request.RequestUri!.PathAndQuery["/3/".Length..];
        var (status, body) = _responses.TryGetValue(key, out var response)
            ? response
            : (HttpStatusCode.NotFound, """{"status_code":34,"status_message":"The resource you requested could not be found."}""");

        return Task.FromResult(new HttpResponseMessage(status)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        });
    }
}
