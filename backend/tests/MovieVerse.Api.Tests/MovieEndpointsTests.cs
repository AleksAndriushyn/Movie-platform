using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;

namespace MovieVerse.Api.Tests;

// A fresh factory per test keeps the in-memory cache and recorded requests isolated
public sealed class MovieEndpointsTests : IDisposable
{
    private const string PopularJson = """{"page":2,"results":[{"id":550,"title":"Fight Club"}],"total_pages":10,"total_results":200}""";

    private readonly ApiFactory _factory = new();
    private readonly HttpClient _client;

    public MovieEndpointsTests() => _client = _factory.CreateClient();

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task Popular_ReturnsTmdbJsonAndSendsTokenOnlyUpstream()
    {
        _factory.Tmdb.Respond("movie/popular?page=2", PopularJson);

        var response = await _client.GetAsync("/api/movies/popular?page=2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(PopularJson, await response.Content.ReadAsStringAsync());
        Assert.Equal("public, max-age=900", response.Headers.CacheControl?.ToString());

        var upstream = Assert.Single(_factory.Tmdb.Requests);
        Assert.Equal("Bearer", upstream.Headers.Authorization?.Scheme);
        Assert.Equal(ApiFactory.AccessToken, upstream.Headers.Authorization?.Parameter);
    }

    [Fact]
    public async Task Popular_RepeatedRequest_IsServedFromCache()
    {
        _factory.Tmdb.Respond("movie/popular?page=1", PopularJson);

        await _client.GetAsync("/api/movies/popular");
        var second = await _client.GetAsync("/api/movies/popular?page=1");

        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        Assert.Single(_factory.Tmdb.Requests);
    }

    [Theory]
    [InlineData("/api/movies/popular?page=0")]
    [InlineData("/api/movies/popular?page=501")]
    [InlineData("/api/movies/search?query=%20%20")]
    [InlineData("/api/genres/28/movies?page=-1")]
    public async Task InvalidParameters_Return400WithoutCallingTmdb(string url)
    {
        var response = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(_factory.Tmdb.Requests);
    }

    [Fact]
    public async Task Search_TrimsAndEncodesQuery()
    {
        _factory.Tmdb.Respond("search/movie?query=Tom%20%26%20Jerry&page=1", PopularJson);

        var response = await _client.GetAsync("/api/movies/search?query=%20Tom%20%26%20Jerry%20");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Movie_RequestsCreditsAndVideos()
    {
        _factory.Tmdb.Respond("movie/550?append_to_response=credits,videos", """{"id":550}""");

        var response = await _client.GetAsync("/api/movies/550");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UnknownMovie_Returns404ProblemDetails()
    {
        var response = await _client.GetAsync("/api/movies/999999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal(404, problem?.Status);
    }

    [Fact]
    public async Task RejectedToken_Returns502WithoutLeakingTmdbMessage()
    {
        _factory.Tmdb.Respond(
            "genre/movie/list",
            """{"status_code":7,"status_message":"Invalid API key: You must be granted a valid key."}""",
            HttpStatusCode.Unauthorized);

        var response = await _client.GetAsync("/api/genres");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.DoesNotContain("API key", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task UnknownRoute_Returns404WithoutCallingTmdb()
    {
        var response = await _client.GetAsync("/api/tv/popular");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Empty(_factory.Tmdb.Requests);
    }

    [Fact]
    public async Task Health_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync());
    }
}
