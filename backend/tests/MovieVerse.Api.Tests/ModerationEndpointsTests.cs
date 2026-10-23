using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MovieVerse.Api.Data;

namespace MovieVerse.Api.Tests;

public sealed class ModerationEndpointsTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public ModerationEndpointsTests() =>
        _factory.Tmdb.Respond("movie/550?append_to_response=credits,videos", """{"id":550,"title":"Fight Club","vote_average":8.4}""");

    public void Dispose() => _factory.Dispose();

    private async Task<HttpClient> AdminClientAsync()
    {
        var admin = await _factory.AddUserAsync("google-admin", "Admin");
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Users.Where(u => u.Id == admin.Id).ExecuteUpdateAsync(set => set.SetProperty(u => u.IsAdmin, true));
        return _factory.CreateClientFor(admin);
    }

    /// <summary>A review by Alice with the given number of reports from other users.</summary>
    private async Task<int> ReportedReviewAsync(int reports)
    {
        var alice = _factory.CreateClientFor(await _factory.AddUserAsync("google-alice", "Alice"));
        var write = await alice.PutAsJsonAsync("/api/me/reviews/550", new { body = "Buy cheap watches at example.com today!", containsSpoilers = false });
        var reviewId = (await write.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();

        for (var i = 0; i < reports; i++)
        {
            var reporter = _factory.CreateClientFor(await _factory.AddUserAsync($"google-reporter-{i}"));
            await reporter.PostAsJsonAsync($"/api/reviews/{reviewId}/reports", new { reason = "spam" });
        }

        return reviewId;
    }

    private static async Task<int> PublicCountAsync(HttpClient client) =>
        (await client.GetFromJsonAsync<JsonElement>("/api/movies/550/reviews")).GetProperty("totalResults").GetInt32();

    [Fact]
    public async Task NonAdmin_Gets403()
    {
        var user = _factory.CreateClientFor(await _factory.AddUserAsync("google-user"));

        Assert.Equal(HttpStatusCode.Forbidden, (await user.GetAsync("/api/admin/reviews")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await user.PostAsync("/api/admin/reviews/1/remove", null)).StatusCode);
    }

    [Fact]
    public async Task Anonymous_Gets401()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await _factory.CreateClient().GetAsync("/api/admin/reviews")).StatusCode);
    }

    [Fact]
    public async Task Queue_ShowsReportedReviewsWithReasonsAndTitle()
    {
        var reviewId = await ReportedReviewAsync(reports: 3);
        var admin = await AdminClientAsync();

        var queue = await admin.GetFromJsonAsync<JsonElement>("/api/admin/reviews");

        var item = Assert.Single(queue.GetProperty("results").EnumerateArray());
        Assert.Equal(reviewId, item.GetProperty("id").GetInt32());
        Assert.Equal("Fight Club", item.GetProperty("movieTitle").GetString());
        Assert.Equal("hidden", item.GetProperty("status").GetString());
        Assert.Equal(3, item.GetProperty("reportCount").GetInt32());
        Assert.Equal(3, item.GetProperty("reasons").GetProperty("spam").GetInt32());
        Assert.Equal("google-alice@example.com", item.GetProperty("authorEmail").GetString());
    }

    [Fact]
    public async Task Restore_MakesReviewPublicAndClearsReports()
    {
        var reviewId = await ReportedReviewAsync(reports: 3);
        var admin = await AdminClientAsync();

        var restore = await admin.PostAsync($"/api/admin/reviews/{reviewId}/restore", null);

        Assert.Equal(HttpStatusCode.NoContent, restore.StatusCode);
        Assert.Equal(1, await PublicCountAsync(_factory.CreateClient()));
        var queue = await admin.GetFromJsonAsync<JsonElement>("/api/admin/reviews");
        Assert.Equal(0, queue.GetProperty("totalResults").GetInt32());
    }

    [Fact]
    public async Task Remove_TakesReviewDownForGood()
    {
        var reviewId = await ReportedReviewAsync(reports: 1);
        var admin = await AdminClientAsync();

        var remove = await admin.PostAsync($"/api/admin/reviews/{reviewId}/remove", null);

        Assert.Equal(HttpStatusCode.NoContent, remove.StatusCode);
        Assert.Equal(0, await PublicCountAsync(_factory.CreateClient()));
        var queue = await admin.GetFromJsonAsync<JsonElement>("/api/admin/reviews");
        Assert.Equal(0, queue.GetProperty("totalResults").GetInt32());
    }

    [Fact]
    public async Task UnknownReview_Returns404()
    {
        var admin = await AdminClientAsync();

        Assert.Equal(HttpStatusCode.NotFound, (await admin.PostAsync("/api/admin/reviews/12345/remove", null)).StatusCode);
    }
}
