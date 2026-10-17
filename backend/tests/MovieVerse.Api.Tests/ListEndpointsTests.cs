using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace MovieVerse.Api.Tests;

public sealed class ListEndpointsTests : IDisposable
{
    private const string FightClubJson = """
        {"id":550,"title":"Fight Club","poster_path":"/poster.jpg","release_date":"1999-10-15",
         "vote_average":8.4,"overview":"An insomniac office worker...","genres":[{"id":18,"name":"Drama"}]}
        """;

    private readonly ApiFactory _factory = new();

    public ListEndpointsTests() =>
        _factory.Tmdb.Respond("movie/550?append_to_response=credits,videos", FightClubJson);

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task Lists_WithoutSession_Return401()
    {
        var response = await _factory.CreateClient().PutAsync("/api/me/lists/favorites/550", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AddedMovie_AppearsInMembershipAndListPage()
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));

        var add = await client.PutAsync("/api/me/lists/favorites/550", null);
        Assert.Equal(HttpStatusCode.NoContent, add.StatusCode);

        var membership = await client.GetFromJsonAsync<JsonElement>("/api/me/lists");
        Assert.Equal([550], membership.GetProperty("favorites").EnumerateArray().Select(e => e.GetInt32()));
        Assert.Empty(membership.GetProperty("watchlist").EnumerateArray());

        // TMDB-shaped, snake_case page so the frontend can reuse its list layout
        var page = await client.GetFromJsonAsync<JsonElement>("/api/me/lists/favorites");
        Assert.Equal(1, page.GetProperty("total_results").GetInt32());
        Assert.Equal(1, page.GetProperty("total_pages").GetInt32());
        var movie = Assert.Single(page.GetProperty("results").EnumerateArray());
        Assert.Equal("Fight Club", movie.GetProperty("title").GetString());
        Assert.Equal("/poster.jpg", movie.GetProperty("poster_path").GetString());
        Assert.Equal("1999-10-15", movie.GetProperty("release_date").GetString());
        Assert.Equal(8.4, movie.GetProperty("vote_average").GetDouble());
    }

    [Fact]
    public async Task AddingTwice_IsIdempotentAndCallsTmdbOnce()
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));

        await client.PutAsync("/api/me/lists/watchlist/550", null);
        var second = await client.PutAsync("/api/me/lists/watchlist/550", null);

        Assert.Equal(HttpStatusCode.NoContent, second.StatusCode);
        Assert.Single(_factory.Tmdb.Requests);
        var page = await client.GetFromJsonAsync<JsonElement>("/api/me/lists/watchlist");
        Assert.Equal(1, page.GetProperty("total_results").GetInt32());
    }

    [Fact]
    public async Task RemovedMovie_DisappearsFromList()
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));
        await client.PutAsync("/api/me/lists/favorites/550", null);

        var remove = await client.DeleteAsync("/api/me/lists/favorites/550");

        Assert.Equal(HttpStatusCode.NoContent, remove.StatusCode);
        var page = await client.GetFromJsonAsync<JsonElement>("/api/me/lists/favorites");
        Assert.Equal(0, page.GetProperty("total_results").GetInt32());
    }

    [Fact]
    public async Task UnknownMovie_Returns404AndStoresNothing()
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));

        var add = await client.PutAsync("/api/me/lists/favorites/999999999", null);

        Assert.Equal(HttpStatusCode.NotFound, add.StatusCode);
        var page = await client.GetFromJsonAsync<JsonElement>("/api/me/lists/favorites");
        Assert.Equal(0, page.GetProperty("total_results").GetInt32());
    }

    [Theory]
    [InlineData("GET", "/api/me/lists/seen")]
    [InlineData("PUT", "/api/me/lists/seen/550")]
    [InlineData("DELETE", "/api/me/lists/seen/550")]
    public async Task UnknownList_Returns404(string method, string url)
    {
        var client = _factory.CreateClientFor(await _factory.AddUserAsync("google-1"));

        var response = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), url));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Empty(_factory.Tmdb.Requests);
    }

    [Fact]
    public async Task Lists_AreIsolatedBetweenUsers()
    {
        var alice = _factory.CreateClientFor(await _factory.AddUserAsync("google-alice"));
        var bob = _factory.CreateClientFor(await _factory.AddUserAsync("google-bob"));

        await alice.PutAsync("/api/me/lists/favorites/550", null);
        // Bob deleting the same movie must not touch Alice's list
        await bob.DeleteAsync("/api/me/lists/favorites/550");

        var bobPage = await bob.GetFromJsonAsync<JsonElement>("/api/me/lists/favorites");
        Assert.Equal(0, bobPage.GetProperty("total_results").GetInt32());
        var alicePage = await alice.GetFromJsonAsync<JsonElement>("/api/me/lists/favorites");
        Assert.Equal(1, alicePage.GetProperty("total_results").GetInt32());
    }
}
