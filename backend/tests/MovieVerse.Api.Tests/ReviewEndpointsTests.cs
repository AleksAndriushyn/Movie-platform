using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MovieVerse.Api.Data;
using MovieVerse.Api.Reviews;

namespace MovieVerse.Api.Tests;

public sealed class ReviewEndpointsTests : IDisposable
{
    private const string Body = "A sharp, darkly funny film that holds up on every rewatch.";

    private readonly ApiFactory _factory = new();

    public ReviewEndpointsTests() =>
        _factory.Tmdb.Respond("movie/550?append_to_response=credits,videos", """{"id":550,"title":"Fight Club","vote_average":8.4}""");

    public void Dispose() => _factory.Dispose();

    private static Task<HttpResponseMessage> Write(HttpClient client, int movieId, string body, bool spoilers = false) =>
        client.PutAsJsonAsync($"/api/me/reviews/{movieId}", new { body, containsSpoilers = spoilers });

    private static Task<HttpResponseMessage> Report(HttpClient client, int reviewId, string reason = "spam") =>
        client.PostAsJsonAsync($"/api/reviews/{reviewId}/reports", new { reason });

    private async Task<(HttpClient Client, User User)> SignedIn(string subject, string name = "Test User")
    {
        var user = await _factory.AddUserAsync(subject, name);
        return (_factory.CreateClientFor(user), user);
    }

    private async Task<int> WriteReviewAsync(HttpClient client)
    {
        var response = await Write(client, 550, Body);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();
    }

    private async Task SetStatusAsync(int reviewId, ReviewStatus status)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Reviews.Where(r => r.Id == reviewId).ExecuteUpdateAsync(set => set.SetProperty(r => r.Status, status));
    }

    [Fact]
    public async Task WrittenReview_IsPublicWithAuthorAndRating()
    {
        var (alice, _) = await SignedIn("google-alice", "Alice");
        await alice.PutAsJsonAsync("/api/me/ratings/550", new { score = 9 });

        var write = await Write(alice, 550, $"  {Body}  ", spoilers: true);
        Assert.Equal(HttpStatusCode.OK, write.StatusCode);

        // Anonymous visitors see it, with the author's name and rating
        var page = await _factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/movies/550/reviews");
        Assert.Equal(1, page.GetProperty("totalResults").GetInt32());
        var review = Assert.Single(page.GetProperty("results").EnumerateArray());
        Assert.Equal(Body, review.GetProperty("body").GetString());
        Assert.Equal("Alice", review.GetProperty("author").GetProperty("name").GetString());
        Assert.Equal(9, review.GetProperty("authorRating").GetInt32());
        Assert.True(review.GetProperty("containsSpoilers").GetBoolean());
        Assert.False(review.GetProperty("isOwn").GetBoolean());
        Assert.EndsWith("Z", review.GetProperty("createdAt").GetString());

        var asAuthor = await alice.GetFromJsonAsync<JsonElement>("/api/movies/550/reviews");
        Assert.True(asAuthor.GetProperty("results")[0].GetProperty("isOwn").GetBoolean());
    }

    [Fact]
    public async Task EditingOwnReview_UpdatesItInsteadOfAddingAnother()
    {
        var (alice, _) = await SignedIn("google-alice");
        await WriteReviewAsync(alice);

        var edit = await Write(alice, 550, "Changed my mind after a second viewing, still great.");
        Assert.Equal(HttpStatusCode.OK, edit.StatusCode);

        var own = await alice.GetFromJsonAsync<JsonElement>("/api/me/reviews/550");
        Assert.Equal("Changed my mind after a second viewing, still great.", own.GetProperty("review").GetProperty("body").GetString());
        Assert.Equal("visible", own.GetProperty("review").GetProperty("status").GetString());
        Assert.NotEqual(JsonValueKind.Null, own.GetProperty("review").GetProperty("updatedAt").ValueKind);
        var page = await alice.GetFromJsonAsync<JsonElement>("/api/movies/550/reviews");
        Assert.Equal(1, page.GetProperty("totalResults").GetInt32());
    }

    [Theory]
    [InlineData("")]
    [InlineData("    too short   ")]
    public async Task TooShortReview_Returns400(string body)
    {
        var (alice, _) = await SignedIn("google-alice");

        var response = await Write(alice, 550, body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task TooLongReview_Returns400()
    {
        var (alice, _) = await SignedIn("google-alice");

        var response = await Write(alice, 550, new string('a', Review.MaxBodyLength + 1));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReviewOfUnknownMovie_Returns404()
    {
        var (alice, _) = await SignedIn("google-alice");

        var response = await Write(alice, 999999999, Body);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Writing_WithoutSession_Returns401()
    {
        var response = await Write(_factory.CreateClient(), 550, Body);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeletedReview_DisappearsAndOwnReviewIsEmpty()
    {
        var (alice, _) = await SignedIn("google-alice");
        await WriteReviewAsync(alice);

        var delete = await alice.DeleteAsync("/api/me/reviews/550");

        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
        var own = await alice.GetFromJsonAsync<JsonElement>("/api/me/reviews/550");
        Assert.Equal(JsonValueKind.Null, own.GetProperty("review").ValueKind);
        var page = await alice.GetFromJsonAsync<JsonElement>("/api/movies/550/reviews");
        Assert.Equal(0, page.GetProperty("totalResults").GetInt32());
    }

    [Fact]
    public async Task ThreeReports_HideTheReview_ButTheAuthorStillSeesIt()
    {
        var (alice, _) = await SignedIn("google-alice");
        var reviewId = await WriteReviewAsync(alice);

        foreach (var reporter in new[] { "google-bob", "google-carol" })
        {
            var (client, _) = await SignedIn(reporter);
            Assert.Equal(HttpStatusCode.NoContent, (await Report(client, reviewId)).StatusCode);
        }

        // Two reports: still public, and the reporter's flag shows
        var (dave, _) = await SignedIn("google-dave");
        var beforeThird = await _factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/movies/550/reviews");
        Assert.Equal(1, beforeThird.GetProperty("totalResults").GetInt32());

        await Report(dave, reviewId, "offensive");
        var afterThird = await _factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/movies/550/reviews");
        Assert.Equal(0, afterThird.GetProperty("totalResults").GetInt32());

        var own = await alice.GetFromJsonAsync<JsonElement>("/api/me/reviews/550");
        Assert.Equal("hidden", own.GetProperty("review").GetProperty("status").GetString());
    }

    [Fact]
    public async Task ReportingTwice_CountsOnce()
    {
        var (alice, _) = await SignedIn("google-alice");
        var reviewId = await WriteReviewAsync(alice);
        var (bob, _) = await SignedIn("google-bob");

        await Report(bob, reviewId);
        await Report(bob, reviewId);
        await Report(bob, reviewId);

        var page = await bob.GetFromJsonAsync<JsonElement>("/api/movies/550/reviews");
        Assert.Equal(1, page.GetProperty("totalResults").GetInt32());
        Assert.True(page.GetProperty("results")[0].GetProperty("reportedByMe").GetBoolean());
    }

    [Fact]
    public async Task ReportingOwnReview_Returns400()
    {
        var (alice, _) = await SignedIn("google-alice");
        var reviewId = await WriteReviewAsync(alice);

        var response = await Report(alice, reviewId);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("\"nonsense\"")]
    [InlineData("99")]
    public async Task UnknownReportReason_Returns400(string reasonJson)
    {
        var (alice, _) = await SignedIn("google-alice");
        var reviewId = await WriteReviewAsync(alice);
        var (bob, _) = await SignedIn("google-bob");

        var response = await bob.PostAsync(
            $"/api/reviews/{reviewId}/reports",
            new StringContent($$"""{"reason":{{reasonJson}}}""", System.Text.Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RemovedReview_CannotBeEditedOrDeletedByAuthor()
    {
        var (alice, _) = await SignedIn("google-alice");
        var reviewId = await WriteReviewAsync(alice);
        await SetStatusAsync(reviewId, ReviewStatus.Removed);

        var edit = await Write(alice, 550, "Trying to post the same thing again right away.");
        await alice.DeleteAsync("/api/me/reviews/550");

        Assert.Equal(HttpStatusCode.Conflict, edit.StatusCode);
        var own = await alice.GetFromJsonAsync<JsonElement>("/api/me/reviews/550");
        Assert.Equal("removed", own.GetProperty("review").GetProperty("status").GetString());
    }

    [Fact]
    public async Task NewReviews_AreLimitedPerDay()
    {
        var (alice, user) = await SignedIn("google-alice");
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            for (var movieId = 1; movieId <= ReviewEndpoints.MaxNewReviewsPerDay; movieId++)
            {
                db.Reviews.Add(new Review { UserId = user.Id, MovieId = movieId, Body = Body, CreatedAtUtc = DateTime.UtcNow });
            }
            await db.SaveChangesAsync();
        }

        var response = await Write(alice, 550, Body);

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Fact]
    public async Task DeletingAccount_RemovesTheirReviewsAndReports()
    {
        var (alice, aliceUser) = await SignedIn("google-alice");
        var (bob, bobUser) = await SignedIn("google-bob");
        var aliceReview = await WriteReviewAsync(alice);
        var bobReview = await WriteReviewAsync(bob);
        await Report(alice, bobReview);
        await Report(bob, aliceReview);

        var response = await alice.DeleteAsync("/api/me");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.False(await db.Reviews.AnyAsync(r => r.UserId == aliceUser.Id));
        Assert.False(await db.ReviewReports.AnyAsync(r => r.ReporterUserId == aliceUser.Id || r.ReviewId == aliceReview));
        Assert.True(await db.Reviews.AnyAsync(r => r.UserId == bobUser.Id));
    }

    [Fact]
    public async Task TmdbReviews_AreProxied()
    {
        _factory.Tmdb.Respond("movie/550/reviews?page=1", """{"id":550,"page":1,"results":[{"author":"Goddard"}],"total_pages":1,"total_results":1}""");

        var response = await _factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/movies/550/tmdb-reviews");

        Assert.Equal("Goddard", response.GetProperty("results")[0].GetProperty("author").GetString());
    }
}
