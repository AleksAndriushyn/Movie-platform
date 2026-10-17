using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace MovieVerse.Api.Tests;

public sealed class RatingEndpointsTests : IDisposable
{
    private const string FightClubJson = """
        {"id":550,"title":"Fight Club","poster_path":"/poster.jpg","release_date":"1999-10-15",
         "vote_average":8.4,"overview":"An insomniac office worker..."}
        """;

    private readonly ApiFactory _factory = new();

    public RatingEndpointsTests() =>
        _factory.Tmdb.Respond("movie/550?append_to_response=credits,videos", FightClubJson);

    public void Dispose() => _factory.Dispose();

    private static Task<HttpResponseMessage> Rate(HttpClient client, int movieId, int score) =>
        client.PutAsJsonAsync($"/api/me/ratings/{movieId}", new { score });

    [Fact]
    public async Task Rating_WithoutSession_Returns401()
    {
        var response = await Rate(_factory.CreateClient(), 550, 8);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RatedMovie_AppearsInMembershipAndRatingsPage()
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));

        var rate = await Rate(client, 550, 9);
        Assert.Equal(HttpStatusCode.NoContent, rate.StatusCode);

        var membership = await client.GetFromJsonAsync<JsonElement>("/api/me/lists");
        Assert.Equal(9, membership.GetProperty("ratings").GetProperty("550").GetInt32());

        var page = await client.GetFromJsonAsync<JsonElement>("/api/me/ratings");
        Assert.Equal(1, page.GetProperty("total_results").GetInt32());
        var movie = Assert.Single(page.GetProperty("results").EnumerateArray());
        Assert.Equal("Fight Club", movie.GetProperty("title").GetString());
        Assert.Equal(9, movie.GetProperty("user_rating").GetInt32());
        Assert.Equal(8.4, movie.GetProperty("vote_average").GetDouble());
    }

    [Fact]
    public async Task Rerating_UpdatesScoreWithoutCallingTmdbAgain()
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));

        await Rate(client, 550, 6);
        var second = await Rate(client, 550, 10);

        Assert.Equal(HttpStatusCode.NoContent, second.StatusCode);
        Assert.Single(_factory.Tmdb.Requests);
        var membership = await client.GetFromJsonAsync<JsonElement>("/api/me/lists");
        Assert.Equal(10, membership.GetProperty("ratings").GetProperty("550").GetInt32());
    }

    [Fact]
    public async Task RemovedRating_Disappears()
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));
        await Rate(client, 550, 7);

        var remove = await client.DeleteAsync("/api/me/ratings/550");

        Assert.Equal(HttpStatusCode.NoContent, remove.StatusCode);
        var membership = await client.GetFromJsonAsync<JsonElement>("/api/me/lists");
        Assert.Empty(membership.GetProperty("ratings").EnumerateObject());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    [InlineData(-3)]
    public async Task OutOfRangeScore_Returns400WithoutCallingTmdb(int score)
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));

        var response = await Rate(client, 550, score);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(_factory.Tmdb.Requests);
    }

    [Fact]
    public async Task UnknownMovie_Returns404AndStoresNothing()
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));

        var response = await Rate(client, 999999999, 8);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var page = await client.GetFromJsonAsync<JsonElement>("/api/me/ratings");
        Assert.Equal(0, page.GetProperty("total_results").GetInt32());
    }

    [Fact]
    public async Task Ratings_AreIsolatedBetweenUsers()
    {
        var alice = _factory.CreateClientFor(await _factory.AddUserAsync("google-alice"));
        var bob = _factory.CreateClientFor(await _factory.AddUserAsync("google-bob"));

        await Rate(alice, 550, 9);
        await Rate(bob, 550, 3);
        await bob.DeleteAsync("/api/me/ratings/550");

        var aliceMembership = await alice.GetFromJsonAsync<JsonElement>("/api/me/lists");
        Assert.Equal(9, aliceMembership.GetProperty("ratings").GetProperty("550").GetInt32());
    }
}
